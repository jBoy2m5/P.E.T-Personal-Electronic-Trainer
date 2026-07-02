import { create } from 'zustand';
import i18n from 'i18next';
import { generateDynamicRoadmap } from '../services/roadmapGenerator';
import { fetchAiRoadmap } from '../services/aiRoadmapService';
import useExerciseStore from './useExerciseStore';
import usePetStore from './usePetStore';
import axiosClient from '../api/axiosClient';

const getUserId = () => {
  try {
    const saved = localStorage.getItem('user-data');
    return saved ? JSON.parse(saved)?.userId : null;
  } catch { return null; }
};

const getRoadmapKey = (userId) => {
  const uid = userId || getUserId();
  return uid ? `roadmap-data-${uid}` : 'roadmap-data';
};

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// AbortController của request AI đang chạy — để nút "dùng lộ trình mặc định" hủy được giữa chừng
let aiAbortController = null;

// Ràng buộc mở khóa lộ trình:
// - Ngày kế tiếp chỉ 'active' khi: ngày trước đã hoàn thành TRƯỚC hôm nay (đã sang ngày lịch mới)
//   VÀ hôm nay đã điểm danh (điểm danh = bắt đầu ngày mới). Chưa điểm danh → mọi ngày chưa xong đều khóa.
// - Ngày nghỉ: điểm danh hôm đó là tính hoàn thành (tự đánh dấu khi đến lượt).
// - Ngày completed cũ không có completedDate (dữ liệu trước bản này) coi như hoàn thành trong quá khứ.
const deriveStatuses = (roadmap) => {
  const todayKey = getTodayKey();
  const lastCheckinDate = usePetStore.getState().lastCheckinDate;
  const checkedInToday = lastCheckinDate === todayKey;

  const updated = roadmap.map(d => ({ ...d }));
  let lastCompletedIdx = updated.map(d => d.status === 'completed').lastIndexOf(true);

  const prevDoneBeforeToday = (idx) => {
    if (idx < 0) return true; // ngày 1 không có ngày trước
    const prev = updated[idx];
    return !prev.completedDate || prev.completedDate < todayKey;
  };

  // Ngày nghỉ đến lượt + đã điểm danh hôm nay → tự hoàn thành (mỗi ngày lịch chỉ 1 ngày nghỉ)
  const nextIdx = lastCompletedIdx + 1;
  if (
    nextIdx < updated.length && updated[nextIdx].isRestDay &&
    checkedInToday && prevDoneBeforeToday(lastCompletedIdx)
  ) {
    updated[nextIdx].status = 'completed';
    updated[nextIdx].completedDate = todayKey;
    lastCompletedIdx = nextIdx;
  }

  for (let i = 0; i <= lastCompletedIdx; i++) updated[i].status = 'completed';
  const activeIdx = lastCompletedIdx + 1;
  if (activeIdx < updated.length) {
    const unlocked = checkedInToday && prevDoneBeforeToday(lastCompletedIdx);
    updated[activeIdx].status = unlocked ? 'active' : 'locked';
    for (let i = activeIdx + 1; i < updated.length; i++) updated[i].status = 'locked';
  }
  return updated;
};

const useRoadmapStore = create((set, get) => ({
  roadmapData: [],
  initialized: false,
  generating: false, // đang chờ AI sinh lộ trình → UI hiển thị màn hình chờ thay vì lộ trình cũ/mặc định

  loadRoadmap: async () => {
    const userId = getUserId();
    const key = getRoadmapKey(userId);
    const saved = localStorage.getItem(key);

    if (saved) {
      const parsed = deriveStatuses(JSON.parse(saved));
      localStorage.setItem(key, JSON.stringify(parsed));
      set({ roadmapData: parsed, initialized: true });
      // Sync completion from backend in background
      if (userId) get()._syncCompletionFromBackend(userId, parsed);
      return;
    }

    if (userId) {
      await get()._fetchOrCreate(userId);
    } else {
      await get().generateRoadmap();
    }
  },

  generateRoadmap: async () => {
    set({ generating: true });
    try {
      const userId = getUserId();
      const key = getRoadmapKey(userId);
      const saved = localStorage.getItem('user-data');
      let userData = { gender: 'Nam', height: 170, weight: 65, fitnessLevel: 'Mới bắt đầu', goal: 'Giữ dáng' };
      if (saved) {
        const p = JSON.parse(saved);
        userData = { gender: p.gender || 'Nam', height: p.height || 170, weight: p.weight || 65, fitnessLevel: p.fitnessLevel || 'Mới bắt đầu', goal: p.goal || p.fitness_goal || 'Giữ dáng' };
      }
      const exercises = await useExerciseStore.getState().fetchExercises();
      // Ưu tiên lộ trình do Gemini sinh; AI lỗi/timeout/bị người dùng hủy thì fallback thuật toán local
      aiAbortController = new AbortController();
      const aiRoadmap = await fetchAiRoadmap(exercises, aiAbortController.signal);
      aiAbortController = null;
      const roadmap = deriveStatuses(aiRoadmap || generateDynamicRoadmap(userData, exercises));

      localStorage.setItem(key, JSON.stringify(roadmap));
      set({ roadmapData: roadmap, initialized: true });

      // Save to backend (fire-and-forget)
      if (userId) get()._saveToBackend(userId, roadmap, userData.goal);

      // Lời khuyên AI theo ngôn ngữ hiện tại, cache theo key có hậu tố ngôn ngữ (Roadmap.jsx đọc/fetch bổ sung)
      const langKey = (i18n.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
      axiosClient.get(`/ai/roadmap-advice?lang=${langKey}`).then(res => {
        if (res?.advice) localStorage.setItem(`ai-roadmap-advice-v2-${langKey}`, res.advice);
      }).catch(() => {});
    } finally {
      set({ generating: false });
    }
  },

  // Người dùng chọn "dùng lộ trình mặc định" trong lúc chờ AI → hủy request Gemini;
  // fetchAiRoadmap trả null và flow đang chạy tự fallback sang generateDynamicRoadmap ngay
  skipAiGeneration: () => {
    if (aiAbortController) {
      aiAbortController.abort();
      aiAbortController = null;
    }
  },

  // Tính lại trạng thái khóa/mở theo ngày hôm nay + điểm danh (gọi sau khi check-in hoặc khi mở trang)
  refreshStatuses: () => {
    const { roadmapData } = get();
    if (!roadmapData.length) return;
    const withStatuses = deriveStatuses(roadmapData);
    localStorage.setItem(getRoadmapKey(), JSON.stringify(withStatuses));
    set({ roadmapData: withStatuses });
  },

  markDayComplete: (localDayId) => {
    const { roadmapData } = get();
    const idx = roadmapData.findIndex(d => d.dayId.toString() === localDayId.toString());
    if (idx === -1) return;

    const updated = roadmapData.map(d => ({ ...d }));
    updated[idx].status = 'completed';
    // Ghi ngày hoàn thành — ngày kế tiếp KHÔNG mở ngay mà chờ sang ngày lịch mới + điểm danh (deriveStatuses)
    updated[idx].completedDate = getTodayKey();
    const withStatuses = deriveStatuses(updated);

    const key = getRoadmapKey();
    localStorage.setItem(key, JSON.stringify(withStatuses));
    set({ roadmapData: withStatuses });

    // Sync to backend
    const backendDayId = updated[idx].backendDayId;
    if (backendDayId) {
      axiosClient.put(`/roadmaps/days/${backendDayId}`, { is_completed: true }).catch(() => {});
    }
  },

  _syncCompletionFromBackend: async (userId, localRoadmap) => {
    try {
      const userRoadmaps = await axiosClient.get(`/roadmaps/user/${userId}`);
      if (!userRoadmaps?.length) return;

      const days = userRoadmaps[0].days || [];
      if (!days.length) return;

      const merged = localRoadmap.map(localDay => {
        const backendDay = days.find(d => d.day_number === localDay.dayId);
        if (!backendDay) return localDay;
        return {
          ...localDay,
          backendDayId: backendDay.id,
          status: backendDay.is_completed ? 'completed' : localDay.status
        };
      });

      const withStatuses = deriveStatuses(merged);
      const key = getRoadmapKey(userId);
      localStorage.setItem(key, JSON.stringify(withStatuses));
      set({ roadmapData: withStatuses });
    } catch { /* ignore, use local data */ }
  },

  _fetchOrCreate: async (userId) => {
    try {
      const userRoadmaps = await axiosClient.get(`/roadmaps/user/${userId}`);
      const saved = localStorage.getItem('user-data');
      const p = saved ? JSON.parse(saved) : {};
      const userData = { gender: p.gender || 'Nam', height: p.height || 170, weight: p.weight || 65, fitnessLevel: p.fitnessLevel || 'Mới bắt đầu', goal: p.goal || p.fitness_goal || 'Giữ dáng' };
      const exercises = await useExerciseStore.getState().fetchExercises();

      if (userRoadmaps?.length) {
        // Đã có lộ trình trên server → dựng lại bằng thuật toán local (nhanh, ổn định)
        // rồi merge trạng thái hoàn thành; không gọi AI lại để tránh lệch lộ trình gốc
        const localRoadmap = generateDynamicRoadmap(userData, exercises);
        const days = userRoadmaps[0].days || [];
        const merged = localRoadmap.map(localDay => {
          const bd = days.find(d => d.day_number === localDay.dayId);
          return bd ? { ...localDay, backendDayId: bd.id, status: bd.is_completed ? 'completed' : localDay.status } : localDay;
        });
        const withStatuses = deriveStatuses(merged);
        const key = getRoadmapKey(userId);
        localStorage.setItem(key, JSON.stringify(withStatuses));
        set({ roadmapData: withStatuses, initialized: true });
      } else {
        // Lần đầu tạo lộ trình → ưu tiên Gemini, AI lỗi thì fallback thuật toán local
        set({ generating: true });
        try {
          aiAbortController = new AbortController();
          const aiRoadmap = await fetchAiRoadmap(exercises, aiAbortController.signal);
          aiAbortController = null;
          const localRoadmap = aiRoadmap || generateDynamicRoadmap(userData, exercises);
          const key = getRoadmapKey(userId);
          const withStatuses = deriveStatuses(localRoadmap);
          localStorage.setItem(key, JSON.stringify(withStatuses));
          set({ roadmapData: withStatuses, initialized: true });
          get()._saveToBackend(userId, withStatuses, userData.goal);
        } finally {
          set({ generating: false });
        }
      }
    } catch {
      set({ generating: false });
      await get().generateRoadmap();
    }
  },

  _saveToBackend: async (userId, roadmap, goal) => {
    try {
      const created = await axiosClient.post('/roadmaps', { user_id: userId, goal });
      const roadmapId = created.id;
      const days = await Promise.all(
        roadmap.map(day =>
          axiosClient.post(`/roadmaps/${roadmapId}/days`, {
            day_number: day.dayId,
            challenge_name: day.quest || day.muscleGroup,
            duration: day.duration || 0,
            is_completed: false,
            kcal: day.kcal || 0,
            muscle_group: day.muscleGroup
          }).catch(() => null)
        )
      );

      // Store backendDayIds in local roadmap
      const key = getRoadmapKey(userId);
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = local.map(localDay => {
        const bd = days.find(d => d?.day_number === localDay.dayId);
        return bd ? { ...localDay, backendDayId: bd.id } : localDay;
      });
      localStorage.setItem(key, JSON.stringify(updated));
      set({ roadmapData: updated });
    } catch { /* backend unavailable, continue with local */ }
  }
}));

export default useRoadmapStore;
