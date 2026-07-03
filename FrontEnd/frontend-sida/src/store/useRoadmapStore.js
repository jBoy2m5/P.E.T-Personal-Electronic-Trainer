import { create } from 'zustand';
import i18n from 'i18next';
import { generateDynamicRoadmap } from '../services/roadmapGenerator';
import { fetchAiRoadmap } from '../services/aiRoadmapService';
import useExerciseStore from './useExerciseStore';
import usePetStore from './usePetStore';
import axiosClient from '../api/axiosClient';
import { getAdviceKey, getScheduleKey } from '../utils/userStorage';
import { fetchProfile } from '../api/profileApi';

// Hồ sơ dùng cho thuật toán lộ trình dự phòng (local) — LẤY TỪ SERVER, không đọc localStorage
// (số đo không còn cache ở client). Áp giá trị mặc định để thuật toán luôn chạy được khi thiếu.
const buildGeneratorUserData = async () => {
  const p = await fetchProfile().catch(() => ({}));
  return {
    gender: p.gender || 'Nam',
    height: p.height || 170,
    weight: p.weight || 65,
    fitnessLevel: p.fitnessLevel || 'Mới bắt đầu',
    goal: p.goal || 'Giữ dáng',
  };
};

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
// Cờ báo người dùng đã bấm "dùng lộ trình mặc định": skip tự dựng lộ trình local ngay,
// và flow AI đang chạy khi thấy cờ này thì bỏ kết quả AI (không đè lên lộ trình đã chọn).
let aiSkipped = false;
// Hồ sơ đã nạp cho lần generate đang chạy — để skip dựng lộ trình local NGAY (đồng bộ),
// không phải gọi lại /users/me (ở bản này /me nặng nên await sẽ treo màn chờ).
let lastGenUserData = null;

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
    aiSkipped = false;
    set({ generating: true });
    try {
      const userId = getUserId();
      const key = getRoadmapKey(userId);
      // Reset/tạo lộ trình mới → xóa tick bài cũ trong pet-schedule (lưu theo NGÀY+TÊN bài,
      // không theo roadmap nên không tự mất khi sinh lộ trình mới) để lộ trình mới bắt đầu sạch tick.
      try {
        const schedKey = getScheduleKey();
        const sched = JSON.parse(localStorage.getItem(schedKey) || '{}');
        let changed = false;
        Object.keys(sched).forEach(dk => {
          if (sched[dk]?.completedExercises?.length) {
            sched[dk].completedExercises = [];
            sched[dk].note = '';
            changed = true;
          }
        });
        if (changed) localStorage.setItem(schedKey, JSON.stringify(sched));
      } catch { /* ignore */ }
      const userData = await buildGeneratorUserData();
      lastGenUserData = userData; // để skip dùng lại, không phải fetch /me
      const exercises = await useExerciseStore.getState().fetchExercises();
      // Ưu tiên lộ trình do Gemini sinh; AI lỗi/timeout/bị người dùng hủy thì fallback thuật toán local
      aiAbortController = new AbortController();
      const aiRoadmap = await fetchAiRoadmap(exercises, aiAbortController.signal);
      aiAbortController = null;
      if (aiSkipped) return; // đã bấm "dùng lộ trình mặc định" trong lúc chờ → bỏ kết quả AI
      const roadmap = deriveStatuses(aiRoadmap || generateDynamicRoadmap(userData, exercises));

      localStorage.setItem(key, JSON.stringify(roadmap));
      set({ roadmapData: roadmap, initialized: true });

      // Save to backend (fire-and-forget)
      if (userId) get()._saveToBackend(userId, roadmap, userData.goal);

      // Lời khuyên AI theo ngôn ngữ hiện tại, cache theo key có hậu tố ngôn ngữ (Roadmap.jsx đọc/fetch bổ sung)
      const langKey = (i18n.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
      axiosClient.get(`/ai/roadmap-advice?lang=${langKey}`).then(res => {
        if (res?.advice) localStorage.setItem(getAdviceKey(langKey), res.advice);
      }).catch(() => {});
    } finally {
      set({ generating: false });
    }
  },

  // Người dùng chọn "dùng lộ trình mặc định" trong lúc chờ AI: đặt cờ + hủy request Gemini,
  // rồi DỰNG NGAY lộ trình local và tắt màn chờ — không chờ abort lan tới request (không đáng tin
  // khi backend đang giữ ~45s). Flow AI khi quay lại thấy aiSkipped=true sẽ bỏ kết quả của nó.
  skipAiGeneration: () => {
    if (!get().generating) return;
    aiSkipped = true;
    if (aiAbortController) {
      aiAbortController.abort();
      aiAbortController = null;
    }
    // Dựng lộ trình local ĐỒNG BỘ từ dữ liệu đã nạp sẵn — KHÔNG gọi mạng (tránh treo ở /me):
    // profile đã fetch lúc bắt đầu generate (lastGenUserData), exercises đã cache trong store.
    const userId = getUserId();
    const userData = lastGenUserData ||
      { gender: 'Nam', height: 170, weight: 65, fitnessLevel: 'Mới bắt đầu', goal: 'Giữ dáng' };
    const exercises = useExerciseStore.getState().exercises || [];
    const roadmap = deriveStatuses(generateDynamicRoadmap(userData, exercises));
    localStorage.setItem(getRoadmapKey(userId), JSON.stringify(roadmap));
    set({ roadmapData: roadmap, initialized: true, generating: false });
    if (userId) get()._saveToBackend(userId, roadmap, userData.goal);
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
          status: backendDay.is_completed ? 'completed' : localDay.status,
          // Backend không lưu ngày hoàn thành → nếu thiếu thì coi như hoàn thành HÔM NAY, KHÔNG để null
          // (deriveStatuses coi completedDate null = "quá khứ" nên sẽ tự nhảy ngày ngay khi refresh).
          completedDate: backendDay.is_completed ? (localDay.completedDate || getTodayKey()) : localDay.completedDate
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
      const userData = await buildGeneratorUserData();
      lastGenUserData = userData; // để skip dùng lại, không phải fetch /me
      const exercises = await useExerciseStore.getState().fetchExercises();

      if (userRoadmaps?.length) {
        // Đã có lộ trình trên server → dựng lại bằng thuật toán local (nhanh, ổn định)
        // rồi merge trạng thái hoàn thành; không gọi AI lại để tránh lệch lộ trình gốc
        const localRoadmap = generateDynamicRoadmap(userData, exercises);
        const days = userRoadmaps[0].days || [];
        const merged = localRoadmap.map(localDay => {
          const bd = days.find(d => d.day_number === localDay.dayId);
          if (!bd) return localDay;
          return {
            ...localDay,
            backendDayId: bd.id,
            status: bd.is_completed ? 'completed' : localDay.status,
            // Thiếu ngày hoàn thành (backend không lưu) → coi như hôm nay, tránh deriveStatuses tự nhảy ngày
            completedDate: bd.is_completed ? (localDay.completedDate || getTodayKey()) : localDay.completedDate
          };
        });
        const withStatuses = deriveStatuses(merged);
        const key = getRoadmapKey(userId);
        localStorage.setItem(key, JSON.stringify(withStatuses));
        set({ roadmapData: withStatuses, initialized: true });
      } else {
        // Lần đầu tạo lộ trình → ưu tiên Gemini, AI lỗi thì fallback thuật toán local
        aiSkipped = false;
        set({ generating: true });
        try {
          aiAbortController = new AbortController();
          const aiRoadmap = await fetchAiRoadmap(exercises, aiAbortController.signal);
          aiAbortController = null;
          if (aiSkipped) return; // đã bấm "dùng lộ trình mặc định" → skip đã dựng lộ trình, bỏ kết quả AI
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
