import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import { getScheduleKey } from '../utils/userStorage';
import { fetchProfile } from '../api/profileApi';

// Cân nặng tham chiếu mà estimated_calories_per_rep trong DB được hiệu chỉnh theo (người trưởng
// thành trung bình). EXP quy đổi từ kcal nên nhân thêm hệ số cân nặng thật để 2 người tập cùng
// bài, cùng số rep nhưng thể trạng khác nhau nhận thưởng công bằng hơn (không đổi số kcal
// hiển thị/lưu session — chỉ ảnh hưởng EXP).
const REFERENCE_WEIGHT_KG = 65;
const MIN_WEIGHT_FACTOR = 0.8;
const MAX_WEIGHT_FACTOR = 1.3;

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
  try {
    const v = s ? JSON.parse(s) : [];
    return Array.isArray(v) ? v : [];
  } catch { return []; }
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
  let data = { totalPoints: 0, exercisesTrained: [], pointsEarnedToday: 0, date: todayStr, petId: null, petName: null, claimedMissions: {}, checkinStreak: 0, lastCheckinDate: null, equippedOutfits: [] };
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
  petReactionTick: 0, // đếm tăng dần mỗi lần cần pet phản ứng tức thì (rep hợp lệ...); không lưu localStorage/server
  userWeight: null, // cân nặng thật lấy tươi từ server mỗi lần sync — KHÔNG lưu localStorage (chính sách số đo cơ thể)

  triggerPetReaction: () => set((state) => ({ petReactionTick: (state.petReactionTick || 0) + 1 })),

  syncFromBackend: async () => {
    const userId = getUserId();
    if (!userId) return;
    const key = getPetKey(userId);
    const todayStr = getTodayKey();
    // Lấy cân nặng thật song song để tính hệ số EXP công bằng theo thể trạng (addExp) — lỗi thì bỏ qua, dùng mặc định.
    fetchProfile().then((p) => { if (p?.weight) set({ userWeight: p.weight }); }).catch(() => {});
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
        equippedOutfits: parseJsonArray(pet.appearance_type),
        date: todayStr
      };
      localStorage.setItem(key, JSON.stringify(newState));
      set(newState);
      // lastCheckinDate mới từ server có thể đổi trạng thái khóa/mở của lộ trình
      import('./useRoadmapStore').then((m) => m.default.getState().refreshStatuses()).catch(() => {});
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
    const schedule = localStorage.getItem(getScheduleKey());
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

  // Trả về { expGained, decay, daysMissed } — decay > 0 nghĩa là streak vừa bị đứt (nghỉ tập
  // nhiều ngày liên tiếp), rủi ro thật khiến động lực chăm pet không chỉ dừng ở hiệu ứng buồn.
  performCheckin: async () => {
    const userId = getUserId();
    const key = getPetKey(userId);
    const todayStr = getTodayKey();
    const { petId, checkinStreak, lastCheckinDate, totalPoints } = get();
    if (!petId) return null;
    if (lastCheckinDate === todayStr) return { expGained: 0, decay: 0, daysMissed: 0 };

    // Calculate yesterday
    const d = new Date(); d.setDate(d.getDate() - 1);
    const yesterday = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    const streakBroken = !!lastCheckinDate && lastCheckinDate !== yesterday && (checkinStreak || 0) > 0;
    const newStreak = lastCheckinDate === yesterday ? (checkinStreak || 0) + 1 : 1;
    const dayInCycle = ((newStreak - 1) % 7) + 1;
    const expRewards = [10, 15, 20, 25, 30, 40, 100];
    const expGained = expRewards[dayInCycle - 1];

    // Phạt nhẹ theo số ngày thực sự bỏ lỡ (streak cũ đứt), tối đa 5 ngày để không "xóa sổ"
    // người quay lại sau kỳ nghỉ dài — mục tiêu là tạo rủi ro thật, không phải trừng phạt tuyệt đối.
    const DECAY_PER_MISSED_DAY = 8;
    const MAX_DECAY_DAYS = 5;
    let daysMissed = 0;
    let decay = 0;
    if (streakBroken) {
      const lastDate = new Date(`${lastCheckinDate}T00:00:00`);
      const todayDate = new Date(`${todayStr}T00:00:00`);
      daysMissed = Math.max(0, Math.round((todayDate - lastDate) / 86400000) - 1);
      decay = Math.min(daysMissed, MAX_DECAY_DAYS) * DECAY_PER_MISSED_DAY;
    }
    const newTotalExp = Math.max(0, (totalPoints || 0) + expGained - decay);

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
      // Điểm danh = bắt đầu ngày mới → tính lại trạng thái khóa/mở của lộ trình
      // (dynamic import để tránh vòng lặp import giữa 2 store)
      import('./useRoadmapStore').then((m) => m.default.getState().refreshStatuses()).catch(() => {});
      return { expGained, decay, daysMissed };
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

  // Mặc/cởi trang phục cho pet — trạng thái lưu trong cột appearance_type (JSON array) trên server.
  // Không trừ EXP: chỉ cần tổng EXP đạt ngưỡng của món đồ (kiểm tra ở UI) là trang bị được.
  toggleOutfit: (outfitId) => {
    const userId = getUserId();
    const key = getPetKey(userId);
    set((state) => {
      const current = state.equippedOutfits || [];
      const next = current.includes(outfitId)
        ? current.filter((o) => o !== outfitId)
        : [...current, outfitId];
      const newState = { ...state, equippedOutfits: next };
      localStorage.setItem(key, JSON.stringify(newState));
      if (state.petId) {
        axiosClient.put(`/pets/${state.petId}`, { appearance_type: JSON.stringify(next) }).catch(() => {});
      }
      return newState;
    });
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

      const weightFactor = Math.min(MAX_WEIGHT_FACTOR, Math.max(MIN_WEIGHT_FACTOR, (state.userWeight || REFERENCE_WEIGHT_KG) / REFERENCE_WEIGHT_KG));
      let expGained = Math.max(1, Math.round(kcal * weightFactor * 0.1));
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
