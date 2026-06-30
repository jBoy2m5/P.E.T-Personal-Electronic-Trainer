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

export const getDailyMissions = (dateKey) => {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash) + dateKey.charCodeAt(i);
    hash |= 0;
  }
  const shuffled = [...ALL_MISSIONS].sort((a, b) => {
    const ha = ((hash * 31 + a.id.charCodeAt(0)) % 1000);
    const hb = ((hash * 31 + b.id.charCodeAt(0)) % 1000);
    return ha - hb;
  });
  return shuffled.slice(0, 3);
};

export const getUnclaimedCount = () => {
  let count = 0;
  const todayKey = getTodayKey();
  
  const dailySaved = localStorage.getItem('pet-daily');
  let dailyData = { checkinHistory: [], claimedMissions: {} };
  if (dailySaved) dailyData = JSON.parse(dailySaved);
  
  if (!dailyData.checkinHistory?.includes(todayKey)) {
    count += 1;
  }

  const scheduleSaved = localStorage.getItem('pet-schedule');
  let actualCompletedToday = [];
  if (scheduleSaved) {
    const schedule = JSON.parse(scheduleSaved);
    actualCompletedToday = schedule[todayKey]?.completedExercises || [];
  }

  const todayMissions = getDailyMissions(todayKey);
  const claimedToday = dailyData.claimedMissions?.[todayKey] || [];

  todayMissions.forEach(mission => {
    if (actualCompletedToday.includes(mission.title) && !claimedToday.includes(mission.id)) {
      count += 1;
    }
  });

  return count;
};
