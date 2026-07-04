export const ALL_MISSIONS = [
  { id: '101', title: 'Hít đất cơ bản (Standard Push-up)', points: 30, group: 1 },
  { id: '102', title: 'Hít đất hẹp tay (Diamond Push-up)', points: 40, group: 1 },
  { id: '201', title: 'Hít xà đơn (Pull-up)', points: 45, group: 2 },
  { id: '202', title: 'Kéo lưng với dây kháng lực', points: 25, group: 2 },
  { id: '501', title: 'Gập bụng (Crunches)', points: 25, group: 5 },
  { id: '502', title: 'Plank', points: 35, group: 5 },
  { id: '601', title: 'Squat cơ bản', points: 30, group: 6 },
  { id: '602', title: 'Lunge (Chùng chân)', points: 35, group: 6 },
  { id: '802', title: 'Muscle-up', points: 80, group: 8 },
];

export const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// EXP thưởng nhiệm vụ theo độ khó bài tập
const POINTS_BY_LEVEL = { 'Cơ bản': 25, 'Trung bình': 35, 'Nâng cao': 45 };

const hashDate = (dateKey) => {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash) + dateKey.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Thử thách tập luyện hôm nay — đồng bộ với lộ trình 28 ngày:
// - Ngày lộ trình của hôm nay (ngày đã hoàn thành trong hôm nay, nếu chưa thì ngày chưa xong đầu tiên)
//   là ngày TẬP → nhiệm vụ = toàn bộ bài tập của ngày đó (dayId để dẫn vào /daily-workout/{dayId}).
// - Ngày NGHỈ → không giao thử thách (trả mảng rỗng, UI hiện thông báo nghỉ ngơi).
// - Hết 28 ngày / chưa có lộ trình → random cố định theo ngày 3 bài từ các nhóm cơ khác nhau
//   trong DB (group để dẫn vào /exercises/{group}).
// Trang Nhiệm vụ (Daily) và card thử thách trên trang Pet phải cùng gọi hàm này với cùng dữ liệu.
export const getDailyMissions = (dateKey, roadmapData = [], allExercises = []) => {
  const todayDay =
    roadmapData.find(d => d.completedDate === dateKey) ||
    roadmapData.find(d => d.status !== 'completed');

  if (todayDay && todayDay.isRestDay) return [];

  if (todayDay && (todayDay.exercises || []).length > 0) {
    const missions = todayDay.exercises.map(ex => ({
      id: `ex_${ex.exercise_id || ex.id}`,
      title: ex.name,
      points: POINTS_BY_LEVEL[ex.level] || 30,
      dayId: todayDay.dayId,
      group: ex.muscle_group_id || ex.groupId || null
    }));
    // Loại bài trùng trong ngày (id nhiệm vụ phải duy nhất để nhận thưởng đúng)
    return missions.filter((m, i) => missions.findIndex(x => x.id === m.id) === i);
  }

  if (allExercises.length > 0) {
    const hash = hashDate(dateKey);
    const byGroup = new Map();
    allExercises.forEach(ex => {
      const g = ex.target || 'Khác';
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(ex);
    });
    const groups = [...byGroup.keys()].sort();
    const start = hash % groups.length;
    const picked = [];
    for (let i = 0; i < groups.length && picked.length < 3; i++) {
      const pool = byGroup.get(groups[(start + i) % groups.length]);
      const ex = pool[(hash + i * 13) % pool.length];
      picked.push({
        id: `ex_${ex.id}`,
        title: ex.name,
        points: POINTS_BY_LEVEL[ex.level] || 30,
        dayId: null,
        group: ex.groupId || null
      });
    }
    if (picked.length > 0) return picked;
  }

  // Fallback cuối khi chưa tải được lộ trình lẫn danh sách bài tập (giữ hành vi cũ)
  const hash = hashDate(dateKey);
  const shuffled = [...ALL_MISSIONS].sort((a, b) => {
    const ha = ((hash * 31 + a.id.charCodeAt(0)) % 1000);
    const hb = ((hash * 31 + b.id.charCodeAt(0)) % 1000);
    return ha - hb;
  });
  return shuffled.slice(0, 3);
};

// Đọc userId + lộ trình + trạng thái pet daily (bài đã tập / nhiệm vụ đã nhận hôm nay) từ localStorage.
const readDailyState = () => {
  const todayKey = getTodayKey();
  try {
    const userData = localStorage.getItem('user-data');
    const userId = userData ? JSON.parse(userData)?.userId : null;
    const pet = JSON.parse(localStorage.getItem(userId ? `pet-daily-${userId}` : 'pet-daily') || '{}');
    const roadmapData = JSON.parse(localStorage.getItem(userId ? `roadmap-data-${userId}` : 'roadmap-data') || '[]');
    // exercisesTrained chỉ tính nếu là của HÔM NAY (pet.date), tránh dính dữ liệu ngày cũ
    const trainedToday = pet.date === todayKey ? (pet.exercisesTrained || []) : [];
    const claimedToday = pet.claimedMissions?.[todayKey] || [];
    return { roadmapData, trainedToday, claimedToday };
  } catch {
    return { roadmapData: [], trainedToday: [], claimedToday: [] };
  }
};

// Nhiệm vụ PET (login / hoàn thành 1 bài / hoàn thành 3 bài) — nhận Ở TRANG PET.
// Hàm thuần: nhận trạng thái đã tập/đã nhận hôm nay, trả về số nhiệm vụ đủ điều kiện nhưng CHƯA nhận
// → dùng để hiện chấm đỏ TRÊN CON PET (không phải trên nav Missions).
export const getUnclaimedPetMissionCount = (trainedToday = [], claimedToday = []) => {
  let count = 0;
  if (!claimedToday.includes('login')) count += 1;
  if (trainedToday.length > 0 && !claimedToday.includes('exercise_1')) count += 1;
  if (trainedToday.length >= 3 && !claimedToday.includes('exercise_3')) count += 1;
  return count;
};

// Nhiệm vụ MISSIONS (bài của lộ trình hôm nay) — nhận Ở TRANG MISSIONS.
// Trả về số nhiệm vụ đã TẬP nhưng CHƯA nhận thưởng → dùng cho chấm đỏ TRÊN NAV MISSIONS.
// Đọc thẳng localStorage nên đúng ở mọi trang (không phụ thuộc store đã load hay chưa).
export const getUnclaimedDailyMissionCount = () => {
  const { roadmapData, trainedToday, claimedToday } = readDailyState();
  const missions = getDailyMissions(getTodayKey(), roadmapData, []);
  return missions.filter(m => trainedToday.includes(m.title) && !claimedToday.includes(m.id)).length;
};
