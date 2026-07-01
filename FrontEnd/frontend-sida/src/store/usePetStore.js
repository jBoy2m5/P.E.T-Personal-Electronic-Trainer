import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

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

const getUserId = () => {
  try {
    const saved = localStorage.getItem('user-data');
    return saved ? JSON.parse(saved)?.userId : null;
  } catch { return null; }
};

const getPetKey = (userId) => {
  const uid = userId || getUserId();
  return uid ? `pet-daily-${uid}` : 'pet-daily';
};

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
  try { return s ? JSON.parse(s) : []; } catch { return []; }
};

// Ảnh chụp trạng thái nhiệm vụ hằng ngày để gửi lên server (nguồn dữ liệu chính)
const dailyPayload = (state, todayStr) => ({
  pet_daily_date: todayStr,
  points_earned_today: state.pointsEarnedToday || 0,
  exercises_trained: JSON.stringify(state.exercisesTrained || []),
  claimed_missions: JSON.stringify(state.claimedMissions?.[todayStr] || []),
});

const getInitialState = () => {
  const userId = getUserId();
  const key = getPetKey(userId);
  const todayStr = getTodayKey();
  let data = { totalPoints: 0, exercisesTrained: [], pointsEarnedToday: 0, date: todayStr, petId: null, petName: null, claimedMissions: {}, checkinStreak: 0, lastCheckinDate: null };
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      data = { ...data, ...parsed };
      if (data.date !== todayStr) {
        data.date = todayStr;
        data.pointsEarnedToday = 0;
        data.exercisesTrained = [];
      }
    }
  } catch { /* ignore */ }
  return data;
};

const usePetStore = create((set, get) => ({
  ...getInitialState(),

  syncFromBackend: async () => {
    const userId = getUserId();
    if (!userId) return;
    const key = getPetKey(userId);
    const todayStr = getTodayKey();
    try {
      const pet = await axiosClient.get(`/pets/user/${userId}`);
      const totalPoints = pet.total_exp || 0;
      // Nguồn chính là server. Trạng thái nhiệm vụ chỉ áp dụng nếu là của hôm nay
      const sameDay = pet.pet_daily_date === todayStr;
      const newState = {
        totalPoints,
        petId: pet.pet_id,
        petName: pet.pet_name || null,
        pointsEarnedToday: sameDay ? (pet.points_earned_today || 0) : 0,
        exercisesTrained: sameDay ? parseJsonArray(pet.exercises_trained) : [],
        claimedMissions: { [todayStr]: sameDay ? parseJsonArray(pet.claimed_missions) : [] },
        checkinStreak: pet.checkin_streak || 0,
        lastCheckinDate: pet.last_checkin_date || null,
        date: todayStr
      };
      localStorage.setItem(key, JSON.stringify(newState));
      set(newState);
    } catch (err) {
      if (err?.response?.status === 404) {
        // New user: create pet with level 1, exp 0
        try {
          const newPet = await axiosClient.post('/pets', { user_id: userId, level: 1, total_exp: 0 });
          const freshState = { totalPoints: 0, petId: newPet.pet_id, pointsEarnedToday: 0, exercisesTrained: [], date: todayStr };
          localStorage.setItem(key, JSON.stringify(freshState));
          set(freshState);
        } catch { /* ignore */ }
      }
      // Other errors: backend unavailable, keep local state
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

  isSad: () => {
    const schedule = localStorage.getItem('pet-schedule');
    if (!schedule) return false;
    const data = JSON.parse(schedule);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const today = new Date();
    for (let i = 1; i <= 2; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      if (data[fmt(d)]?.trained) return false;
    }
    return !data[fmt(today)]?.trained;
  },

  performCheckin: async () => {
    const userId = getUserId();
    const key = getPetKey(userId);
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
      set((state) => {
        const merged = { ...state, totalPoints: newTotalExp, checkinStreak: newStreak, lastCheckinDate: todayStr };
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
      });
      return expGained;
    } catch { return null; }
  },

  updatePetName: async (name) => {
    const userId = getUserId();
    const key = getPetKey(userId);
    const { petId } = get();
    const trimmed = (name || '').trim().slice(0, 20);
    if (!trimmed || !petId) return false;
    try {
      await axiosClient.put(`/pets/${petId}`, { pet_name: trimmed });
      set((state) => {
        const merged = { ...state, petName: trimmed };
        localStorage.setItem(key, JSON.stringify(merged));
        return merged;
      });
      return true;
    } catch { return false; }
  },

  claimMission: (missionId, expReward) => {
    const MAX_DAILY_EXP = 300;
    const todayStr = getTodayKey();
    const userId = getUserId();
    const key = getPetKey(userId);

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
      localStorage.setItem(key, JSON.stringify(newState));

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
    const userId = getUserId();
    const key = getPetKey(userId);

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
      // Giữ nguyên toàn bộ state (claimedMissions, checkinStreak, lastCheckinDate...) để không bị mất sau refresh
      const newState = {
        ...state,
        totalPoints: newTotalPoints,
        pointsEarnedToday: currentPointsToday + expGained,
        exercisesTrained,
        date: todayStr,
        petId: state.petId
      };

      localStorage.setItem(key, JSON.stringify(newState));

      // Sync to backend (nguồn dữ liệu chính)
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
