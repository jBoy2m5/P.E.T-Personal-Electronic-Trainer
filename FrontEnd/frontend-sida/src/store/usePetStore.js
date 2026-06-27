import { create } from 'zustand';

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

const getInitialState = () => {
  const saved = localStorage.getItem('pet-daily');
  const todayStr = getTodayKey();
  
  let data = { totalPoints: 0, exercisesTrained: [], pointsEarnedToday: 0, date: todayStr };
  
  if (saved) {
    const parsed = JSON.parse(saved);
    data = { ...data, ...parsed };
    if (data.date !== todayStr) {
        data.date = todayStr;
        data.pointsEarnedToday = 0;
        data.exercisesTrained = [];
    }
  }
  return data;
};

const usePetStore = create((set, get) => ({
  ...getInitialState(),

  getCurrentLevel: () => {
    const { totalPoints } = get();
    let current = PET_LEVELS[0];
    for (const lvl of PET_LEVELS) {
      if (totalPoints >= lvl.minPoints) current = lvl;
    }
    return current;
  },

  addExp: (kcal, exerciseName) => {
    const MAX_DAILY_EXP = 300;
    
    // Đảm bảo qua ngày mới reset điểm
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

        const newState = {
            totalPoints: state.totalPoints + expGained,
            pointsEarnedToday: currentPointsToday + expGained,
            exercisesTrained,
            date: todayStr
        };

        // Lưu vào localStorage
        localStorage.setItem('pet-daily', JSON.stringify(newState));

        return { ...newState, lastExpGained: expGained, lastIsCapped: isCapped };
    });

    return { 
        exp: get().lastExpGained, 
        isCapped: get().lastIsCapped 
    };
  }
}));

export default usePetStore;
