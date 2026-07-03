import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import useScheduleStore from './useScheduleStore';
import { getUserId } from '../utils/userStorage';

// PET STORE SERVER-ONLY: state sống in-memory và sync 2 chiều với server
// (GET /pets/user/{id} lúc boot qua syncFromBackend, PUT /pets/{id} khi thay đổi).
// KHÔNG còn snapshot localStorage 'pet-daily' — F5 là đọc lại từ server.

const PET_LEVELS = [
  { level: 1, name: 'Trứng', minPoints: 0, icon: '🥚' },
  { level: 2, name: 'Baby Pet', minPoints: 10, icon: '🐣' },
  { level: 3, name: 'Pet nhỏ', minPoints: 50, icon: '🐥' },
  { level: 4, name: 'Pet lớn', minPoints: 150, icon: '🐕' },
  { level: 5, name: 'Pet mạnh', minPoints: 300, icon: '🦁' },
  { level: 6, name: 'Pet chiến binh', minPoints: 600, icon: '🐉' },
  { level: 7, name: 'Pet huyền thoại', minPoints: 1200, icon: '🦄' },
  { level: 8, name: 'Pet thần thoại', minPoints: 2500, icon: '⭐' },
];

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calcLevel = (totalPoints) => {
  let current = PET_LEVELS[0];
  for (const lvl of PET_LEVELS) {
    if (totalPoints >= lvl.minPoints) current = lvl;
  }
  return current.level;
};

const parseJsonArray = (s) => {
  try {
    const v = s ? JSON.parse(s) : [];
    return Array.isArray(v) ? v : [];
  } catch { return []; }
};

// Ảnh chụp trạng thái nhiệm vụ hằng ngày để gửi lên server (nguồn dữ liệu duy nhất)
const dailyPayload = (state, todayStr) => ({
  pet_daily_date: todayStr,
  points_earned_today: state.pointsEarnedToday || 0,
  exercises_trained: JSON.stringify(state.exercisesTrained || []),
  claimed_missions: JSON.stringify(state.claimedMissions?.[todayStr] || []),
});

const initialState = {
  totalPoints: 0,
  exercisesTrained: [],
  pointsEarnedToday: 0,
  date: getTodayKey(),
  petId: null,
  petName: null,
  claimedMissions: {},
  checkinStreak: 0,
  lastCheckinDate: null,
  equippedOutfits: [],
};

const usePetStore = create((set, get) => ({
  ...initialState,

  syncFromBackend: async () => {
    const userId = getUserId();
    if (!userId) return;
    const todayStr = getTodayKey();
    try {
      const pet = await axiosClient.get(`/pets/user/${userId}`);
      const totalPoints = pet.total_exp || 0;
      // Trạng thái nhiệm vụ trên server chỉ áp dụng nếu là của hôm nay
      const sameDay = pet.pet_daily_date === todayStr;
      set({
        totalPoints,
        petId: pet.pet_id,
        petName: pet.pet_name || null,
        pointsEarnedToday: sameDay ? (pet.points_earned_today || 0) : 0,
        exercisesTrained: sameDay ? parseJsonArray(pet.exercises_trained) : [],
        claimedMissions: { [todayStr]: sameDay ? parseJsonArray(pet.claimed_missions) : [] },
        checkinStreak: pet.checkin_streak || 0,
        lastCheckinDate: pet.last_checkin_date || null,
        equippedOutfits: parseJsonArray(pet.appearance_type),
        date: todayStr,
      });
      // lastCheckinDate mới từ server có thể đổi trạng thái khóa/mở của lộ trình
      import('./useRoadmapStore').then((m) => m.default.getState().refreshStatuses()).catch(() => {});
    } catch (err) {
      if (err?.response?.status === 404) {
        // New user: create pet with level 1, exp 0
        try {
          const newPet = await axiosClient.post('/pets', { user_id: userId, level: 1, total_exp: 0 });
          set({ ...initialState, petId: newPet.pet_id, date: todayStr });
        } catch { /* ignore */ }
      }
      // Other errors: backend unavailable, keep in-memory state
    }
  },

  getCurrentLevel: () => {
    const { totalPoints } = get();
    let current = PET_LEVELS[0];
    for (const lvl of PET_LEVELS) {
      if (totalPoints >= lvl.minPoints) current = lvl;
    }
    return current;
  },

  // Pet buồn khi 3 ngày liền (hôm nay + 2 hôm trước) không có buổi tập nào.
  // Nguồn: useScheduleStore (dựng từ workout-sessions trên SERVER, không localStorage).
  isSad: () => {
    const sched = useScheduleStore.getState();
    if (!sched.loaded) {
      sched.loadSchedule().catch(() => {});
      return false; // chưa có dữ liệu → không kết luận pet buồn
    }
    const data = sched.scheduleData;
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const today = new Date();
    for (let i = 1; i <= 2; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      if (data[fmt(d)]?.trained) return false;
    }
    return !data[fmt(today)]?.trained;
  },

  performCheckin: async () => {
    const todayStr = getTodayKey();
    const { petId, checkinStreak, lastCheckinDate, totalPoints } = get();
    if (!petId) return null;
    if (lastCheckinDate === todayStr) return 0;

    // Calculate yesterday
    const d = new Date(); d.setDate(d.getDate() - 1);
    const yesterday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    const newStreak = lastCheckinDate === yesterday ? (checkinStreak || 0) + 1 : 1;
    const dayInCycle = ((newStreak - 1) % 7) + 1;
    const expRewards = [10, 15, 20, 25, 30, 40, 100];
    const expGained = expRewards[dayInCycle - 1];
    const newTotalExp = (totalPoints || 0) + expGained;

    try {
      await axiosClient.put(`/pets/${petId}`, {
        total_exp: newTotalExp,
        level: calcLevel(newTotalExp),
        checkin_streak: newStreak,
        last_checkin_date: todayStr,
      });
      set({ totalPoints: newTotalExp, checkinStreak: newStreak, lastCheckinDate: todayStr });
      // Điểm danh = bắt đầu ngày mới → tính lại trạng thái khóa/mở của lộ trình
      // (dynamic import để tránh vòng lặp import giữa 2 store)
      import('./useRoadmapStore').then((m) => m.default.getState().refreshStatuses()).catch(() => {});
      return expGained;
    } catch { return null; }
  },

  updatePetName: async (name) => {
    const { petId } = get();
    const trimmed = (name || '').trim().slice(0, 20);
    if (!trimmed || !petId) return false;
    try {
      await axiosClient.put(`/pets/${petId}`, { pet_name: trimmed });
      set({ petName: trimmed });
      return true;
    } catch { return false; }
  },

  // Mặc/cởi trang phục cho pet — trạng thái lưu trong cột appearance_type (JSON array) trên server.
  // Không trừ EXP: chỉ cần tổng EXP đạt ngưỡng của món đồ (kiểm tra ở UI) là trang bị được.
  toggleOutfit: (outfitId) => {
    set((state) => {
      const current = state.equippedOutfits || [];
      const next = current.includes(outfitId)
        ? current.filter((o) => o !== outfitId)
        : [...current, outfitId];
      if (state.petId) {
        axiosClient.put(`/pets/${state.petId}`, { appearance_type: JSON.stringify(next) }).catch(() => {});
      }
      return { equippedOutfits: next };
    });
  },

  claimMission: (missionId, expReward) => {
    const MAX_DAILY_EXP = 300;
    const todayStr = getTodayKey();

    set((state) => {
      const todayClaimed = state.claimedMissions?.[todayStr] || [];
      if (todayClaimed.includes(missionId)) return state;

      let currentPointsToday = state.date === todayStr ? state.pointsEarnedToday : 0;
      let expGained = expReward;
      if (currentPointsToday + expGained > MAX_DAILY_EXP) {
        expGained = Math.max(0, MAX_DAILY_EXP - currentPointsToday);
      }

      const newTotalPoints = state.totalPoints + expGained;
      const newClaimed = { ...state.claimedMissions, [todayStr]: [...todayClaimed, missionId] };
      const newState = {
        ...state,
        totalPoints: newTotalPoints,
        pointsEarnedToday: currentPointsToday + expGained,
        claimedMissions: newClaimed,
        date: todayStr,
      };

      if (state.petId) {
        axiosClient.put(`/pets/${state.petId}`, {
          total_exp: newTotalPoints,
          level: calcLevel(newTotalPoints),
          ...dailyPayload(newState, todayStr)
        }).catch(() => {});
      }

      return newState;
    });
  },

  addExp: (kcal, exerciseName) => {
    const MAX_DAILY_EXP = 300;
    const todayStr = getTodayKey();

    set((state) => {
      let currentPointsToday = state.date === todayStr ? state.pointsEarnedToday : 0;
      let exercisesTrained = state.date === todayStr ? [...(state.exercisesTrained || [])] : [];

      let expGained = Math.max(1, Math.round(kcal * 0.1));
      let isCapped = false;

      if (currentPointsToday + expGained > MAX_DAILY_EXP) {
        expGained = Math.max(0, MAX_DAILY_EXP - currentPointsToday);
        isCapped = true;
      }

      if (exerciseName && !exercisesTrained.includes(exerciseName)) {
        exercisesTrained.push(exerciseName);
      }

      const newTotalPoints = state.totalPoints + expGained;
      // Giữ nguyên toàn bộ state (claimedMissions, checkinStreak, lastCheckinDate...)
      const newState = {
        ...state,
        totalPoints: newTotalPoints,
        pointsEarnedToday: currentPointsToday + expGained,
        exercisesTrained,
        date: todayStr,
        petId: state.petId
      };

      // Sync to backend (nguồn dữ liệu duy nhất — F5 sẽ đọc lại từ đây)
      if (state.petId) {
        axiosClient.put(`/pets/${state.petId}`, {
          total_exp: newTotalPoints,
          level: calcLevel(newTotalPoints),
          ...dailyPayload(newState, todayStr)
        }).catch(() => {});
      }

      return { ...newState, lastExpGained: expGained, lastIsCapped: isCapped };
    });

    return {
      exp: get().lastExpGained,
      isCapped: get().lastIsCapped
    };
  }
}));

export default usePetStore;
