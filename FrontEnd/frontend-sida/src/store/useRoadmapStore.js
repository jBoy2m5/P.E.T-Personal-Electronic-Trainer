import { create } from 'zustand';
import i18n from 'i18next';
import { generateDynamicRoadmap } from '../services/roadmapGenerator';
import { fetchAiRoadmap } from '../services/aiRoadmapService';
import useExerciseStore from './useExerciseStore';
import usePetStore from './usePetStore';
import axiosClient from '../api/axiosClient';
import { getUserId } from '../utils/userStorage';
import { fetchProfile } from '../api/profileApi';

// LỘ TRÌNH SERVER-ONLY: tài liệu 28 ngày (kèm tick từng bài trong day.completedExercises,
// gắn theo dayId chứ KHÔNG theo ngày lịch/tên bài) sống trong cột roadmap_json của server.
// Không còn localStorage — F5/máy khác/đăng nhập lại đều đọc đúng một nguồn.

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

const sameRoadmap = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const useRoadmapStore = create((set, get) => ({
  roadmapData: [],
  roadmapId: null, // id row roadmap trên server — đích của mọi PUT roadmap_json
  initialized: false,
  generating: false, // đang chờ AI sinh lộ trình → UI hiển thị màn hình chờ thay vì lộ trình cũ/mặc định

  loadRoadmap: async () => {
    const userId = getUserId();
    if (!userId) {
      // Chưa đăng nhập (App chặn /roadmap rồi, đây chỉ là lưới an toàn)
      set({ roadmapData: [], initialized: true });
      return;
    }

    let server = null;
    try {
      server = await axiosClient.get('/roadmaps/me');
    } catch (err) {
      if (err?.response?.status !== 404) {
        // Lỗi mạng/server (không phải "chưa có lộ trình") → KHÔNG tự tạo mới để
        // tránh đè lộ trình thật đang có trên server; hiển thị rỗng, lần sau thử lại
        set({ initialized: true });
        return;
      }
    }

    if (server?.roadmap_json) {
      try {
        const parsed = JSON.parse(server.roadmap_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const withStatuses = deriveStatuses(parsed);
          set({ roadmapData: withStatuses, roadmapId: server.id, initialized: true });
          // deriveStatuses có thể vừa tự hoàn thành ngày nghỉ → ghi lại server
          if (!sameRoadmap(parsed, withStatuses)) get()._persist(withStatuses);
          return;
        }
      } catch { /* JSON hỏng → rơi xuống nhánh migration/tạo mới */ }
    }

    // Server chưa có roadmap_json → MIGRATION MỘT LẦN từ localStorage phiên bản cũ
    // (roadmap-data-{userId} + tick hôm nay trong pet-schedule-{userId})
    const migrated = get()._readLegacyLocal(userId);
    if (migrated) {
      const withStatuses = deriveStatuses(migrated);
      set({ roadmapData: withStatuses, roadmapId: server?.id ?? null, initialized: true });
      const saved = await get()._persist(withStatuses);
      if (saved) {
        // Server đã giữ dữ liệu → xóa hẳn bản local (không còn nguồn thứ hai)
        localStorage.removeItem(`roadmap-data-${userId}`);
        localStorage.removeItem(`pet-schedule-${userId}`);
      }
      return;
    }

    await get().generateRoadmap();
  },

  // Dùng cho lần tạo đầu và nút ↺ Reset: sinh lộ trình mới (AI → fallback local) rồi
  // POST tạo ROW MỚI trên server — tick cũ và advice cache cũ tự hết hiệu lực theo row cũ.
  generateRoadmap: async () => {
    set({ generating: true });
    try {
      const userId = getUserId();
      const userData = await buildGeneratorUserData();
      const exercises = await useExerciseStore.getState().fetchExercises();
      // Ưu tiên lộ trình do Gemini sinh; AI lỗi/timeout/bị người dùng hủy thì fallback thuật toán local
      aiAbortController = new AbortController();
      const aiRoadmap = await fetchAiRoadmap(exercises, aiAbortController.signal);
      aiAbortController = null;
      const fresh = (aiRoadmap || generateDynamicRoadmap(userData, exercises))
        .map(d => ({ ...d, completedExercises: [] })); // tick gắn theo dayId, lộ trình mới = sạch tick
      const roadmap = deriveStatuses(fresh);

      set({ roadmapData: roadmap, roadmapId: null, initialized: true });

      if (userId) {
        try {
          const created = await axiosClient.post('/roadmaps', {
            goal: userData.goal,
            roadmap_json: JSON.stringify(roadmap),
          });
          set({ roadmapId: created?.id ?? null });
        } catch { /* server tạm lỗi: giữ in-memory, _persist sẽ POST lại khi có thay đổi */ }
      }

      // Prefetch lời khuyên AI theo ngôn ngữ hiện tại — server tự cache vào cột
      // advice_vi/advice_en của roadmap, Roadmap.jsx chỉ việc GET lại là có ngay
      const langKey = (i18n.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
      axiosClient.get(`/ai/roadmap-advice?lang=${langKey}`).catch(() => {});
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
    if (sameRoadmap(roadmapData, withStatuses)) return;
    set({ roadmapData: withStatuses });
    get()._persist(withStatuses);
  },

  // Tick MỘT bài của MỘT ngày lộ trình (nguồn duy nhất của dấu ✓ trong DailyWorkout).
  // Đủ hết bài của ngày → ngày tự hoàn thành (ghi completedDate để ràng buộc mở khóa hoạt động).
  markExerciseDone: (localDayId, exerciseName) => {
    const { roadmapData } = get();
    const idx = roadmapData.findIndex(d => d.dayId.toString() === localDayId.toString());
    if (idx === -1 || !exerciseName) return;

    const updated = roadmapData.map(d => ({ ...d }));
    const day = updated[idx];
    const ticks = new Set(day.completedExercises || []);
    if (ticks.has(exerciseName)) return;
    ticks.add(exerciseName);
    day.completedExercises = [...ticks];

    const allDone = (day.exercises || []).length > 0 &&
      day.exercises.every(ex => ticks.has(ex.name));
    if (allDone && day.status !== 'completed') {
      day.status = 'completed';
      // Ngày kế tiếp KHÔNG mở ngay mà chờ sang ngày lịch mới + điểm danh (deriveStatuses)
      day.completedDate = getTodayKey();
    }

    const withStatuses = deriveStatuses(updated);
    set({ roadmapData: withStatuses });
    get()._persist(withStatuses);
  },

  markDayComplete: (localDayId) => {
    const { roadmapData } = get();
    const idx = roadmapData.findIndex(d => d.dayId.toString() === localDayId.toString());
    if (idx === -1) return;

    const updated = roadmapData.map(d => ({ ...d }));
    updated[idx].status = 'completed';
    updated[idx].completedDate = getTodayKey();
    const withStatuses = deriveStatuses(updated);
    set({ roadmapData: withStatuses });
    get()._persist(withStatuses);
  },

  // Ghi cả tài liệu lộ trình lên server. Trả về true nếu server đã nhận.
  _persist: async (roadmap) => {
    const body = { roadmap_json: JSON.stringify(roadmap) };
    try {
      const { roadmapId } = get();
      if (roadmapId) {
        await axiosClient.put(`/roadmaps/${roadmapId}`, body);
      } else {
        // Chưa có row trên server (POST lúc tạo bị lỗi mạng / migration khi server chưa có) → tạo mới
        const created = await axiosClient.post('/roadmaps', body);
        set({ roadmapId: created?.id ?? null });
        if (!created?.id) return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // Đọc roadmap từ localStorage phiên bản cũ và dựng lại tick theo dayId:
  // - ngày đã completed → coi như đã tập đủ mọi bài của ngày đó
  // - ngày đang mở (chưa xong đầu tiên) → nhận tick HÔM NAY từ pet-schedule (per-date, theo tên bài)
  // Trả null nếu không có gì để migrate.
  _readLegacyLocal: (userId) => {
    try {
      const raw = localStorage.getItem(`roadmap-data-${userId}`);
      if (!raw) return null;
      const roadmap = JSON.parse(raw);
      if (!Array.isArray(roadmap) || roadmap.length === 0) return null;

      let todayTicks = [];
      try {
        const sched = JSON.parse(localStorage.getItem(`pet-schedule-${userId}`) || '{}');
        todayTicks = sched?.[getTodayKey()]?.completedExercises || [];
      } catch { /* ignore */ }

      const firstOpenIdx = roadmap.findIndex(d => d.status !== 'completed');
      return roadmap.map((day, i) => {
        const rest = { ...day };
        delete rest.backendDayId; // bỏ field của cơ chế sync cũ
        const names = (rest.exercises || []).map(e => e.name);
        let completedExercises = [];
        if (rest.status === 'completed' && !rest.isRestDay) {
          completedExercises = names;
        } else if (i === firstOpenIdx) {
          completedExercises = names.filter(n => todayTicks.includes(n));
        }
        return { ...rest, completedExercises };
      });
    } catch {
      return null;
    }
  },
}));

export default useRoadmapStore;
