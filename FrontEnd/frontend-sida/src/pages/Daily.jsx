import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// ALL_MISSIONS ánh xạ trực tiếp với bài tập thực tế trong ExerciseList
const ALL_MISSIONS = [
  { id: '101', title: 'Hít đất cơ bản (Standard Push-up)', icon: '💪', points: 30, group: 1 },
  { id: '102', title: 'Hít đất hẹp tay (Diamond Push-up)', icon: '💎', points: 40, group: 1 },
  { id: '201', title: 'Hít xà đơn (Pull-up)', icon: '🧗', points: 45, group: 2 },
  { id: '202', title: 'Kéo lưng với dây kháng lực', icon: '〰️', points: 25, group: 2 },
  { id: '501', title: 'Gập bụng (Crunches)', icon: '🔥', points: 25, group: 5 },
  { id: '502', title: 'Plank', icon: '🧘', points: 35, group: 5 },
  { id: '601', title: 'Squat cơ bản', icon: '🦵', points: 30, group: 6 },
  { id: '602', title: 'Lunge (Chùng chân)', icon: '🏃', points: 35, group: 6 },
  { id: '802', title: 'Muscle-up', icon: '🦍', points: 80, group: 8 },
];

const CHECKIN_REWARDS = [
  { day: 1, points: 10, label: 'Ngày 1', icon: '🎁' },
  { day: 2, points: 15, label: 'Ngày 2', icon: '🎁' },
  { day: 3, points: 20, label: 'Ngày 3', icon: '🎁' },
  { day: 4, points: 25, label: 'Ngày 4', icon: '🎁' },
  { day: 5, points: 30, label: 'Ngày 5', icon: '🎁' },
  { day: 6, points: 40, label: 'Ngày 6', icon: '🎁' },
  { day: 7, points: 100, label: 'Ngày 7', icon: '🏆' },
];

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDailyMissions = (dateKey) => {
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
  return shuffled.slice(0, 3); // Lấy 3 nhiệm vụ mỗi ngày cho nhẹ nhàng
};

export default function Daily() {
  const navigate = useNavigate();
  const [animateIn, setAnimateIn] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinAnimation, setCheckinAnimation] = useState(false);
  
  // Lấy dữ liệu bài tập thực tế đã hoàn thành trong ngày
  const [actualCompletedToday, setActualCompletedToday] = useState([]);

  const [dailyData, setDailyData] = useState(() => {
    const saved = localStorage.getItem('pet-daily');
    const defaultData = {
      totalPoints: 0,
      checkinStreak: 0,
      lastCheckinDate: null,
      claimedMissions: {},
      checkinHistory: [],
    };
    if (!saved) return defaultData;
    const parsed = JSON.parse(saved);
    return { ...defaultData, ...parsed, claimedMissions: parsed.claimedMissions || {}, checkinHistory: parsed.checkinHistory || [] };
  });

  const todayKey = getTodayKey();
  const todayMissions = getDailyMissions(todayKey);
  const claimedToday = dailyData.claimedMissions[todayKey] || [];
  const hasCheckedInToday = dailyData.checkinHistory.includes(todayKey);

  // Sync với lịch tập (pet-schedule)
  useEffect(() => {
    const syncSchedule = () => {
      const scheduleSaved = localStorage.getItem('pet-schedule');
      if (scheduleSaved) {
        const schedule = JSON.parse(scheduleSaved);
        setActualCompletedToday(schedule[todayKey]?.completedExercises || []);
      }
    };
    syncSchedule();
    window.addEventListener('storage', syncSchedule);
    return () => window.removeEventListener('storage', syncSchedule);
  }, [todayKey]);

  useEffect(() => { setAnimateIn(true); }, []);

  const saveData = (newData) => {
    setDailyData(newData);
    localStorage.setItem('pet-daily', JSON.stringify(newData));
    // Thông báo cho component FloatingPet biết
    window.dispatchEvent(new Event('storage'));
  };

  const handleCheckin = () => {
    if (hasCheckedInToday) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const isConsecutive = dailyData.lastCheckinDate === yesterdayKey;
    const newStreak = isConsecutive ? dailyData.checkinStreak + 1 : 1;
    const rewardDay = Math.max(0, newStreak - 1) % 7;
    const rewardPoints = CHECKIN_REWARDS[rewardDay].points;

    const newData = {
      ...dailyData,
      totalPoints: dailyData.totalPoints + rewardPoints,
      checkinStreak: newStreak,
      lastCheckinDate: todayKey,
      checkinHistory: [...dailyData.checkinHistory, todayKey],
    };

    saveData(newData);
    setCheckinAnimation(true);
    setShowCheckinModal(true);
    setTimeout(() => setCheckinAnimation(false), 1500);
  };

  const handleClaimMission = (mission) => {
    if (claimedToday.includes(mission.id)) return;
    if (!actualCompletedToday.includes(mission.title)) return;

    const newClaimed = { ...dailyData.claimedMissions };
    newClaimed[todayKey] = [...claimedToday, mission.id];

    const newData = {
      ...dailyData,
      totalPoints: dailyData.totalPoints + mission.points,
      claimedMissions: newClaimed,
    };

    saveData(newData);
  };

  return (
    <div className="bg-surface-main" style={{ minHeight: '100vh', paddingTop: '30px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

      {/* Gradients nền */}
      <div style={{ position: 'absolute', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.02) 0%, transparent 60%)', top: '-20vw', left: '-10vw', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(0,180,216,0.02) 0%, transparent 60%)', bottom: '-10vw', right: '-10vw', filter: 'blur(80px)', pointerEvents: 'none' }}></div>

      <Container style={{ position: 'relative', zIndex: 1, maxWidth: '960px' }}>

        {/* Hero Header */}
        <div className="mb-5 position-relative overflow-hidden bg-surface-card border-surface" style={{
          opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          borderRadius: '24px', border: '1px solid', padding: '40px',
        }}>
          <div className="position-relative" style={{ zIndex: 1 }}>
            <h1 className="fw-bold text-primary-dynamic mb-2" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px' }}>
              Nhiệm Vụ <span style={{
                background: 'linear-gradient(90deg, var(--brand-neon), #00ff88)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>& Điểm Danh</span>
            </h1>
            <p className="text-secondary" style={{ maxWidth: '500px', fontSize: '1rem', lineHeight: '1.6', marginBottom: 0 }}>
              Hoàn thành các thử thách mỗi ngày và điểm danh đều đặn để tích lũy thật nhiều điểm EXP nuôi Thú Cưng.
            </p>
          </div>
        </div>

        <Row className="g-4 mb-4" style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s' }}>
          
          {/* Check-in Card */}
          <Col lg={12}>
            <div className="p-4 h-100 d-flex flex-column bg-surface-card border-surface" style={{
              borderRadius: '24px', border: '1px solid',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-primary-dynamic mb-0" style={{ fontSize: '1.1rem' }}>Điểm Danh Tuần</h5>
                <div style={{ color: '#ff6b9d', fontSize: '0.85rem', fontWeight: 'bold', background: 'rgba(255,107,157,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                  🔥 {dailyData.checkinStreak} ngày liên tục
                </div>
              </div>

              <div className="d-grid mb-auto" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {CHECKIN_REWARDS.map((reward, idx) => {
                  const isClaimed = hasCheckedInToday ? idx < ((dailyData.checkinStreak - 1) % 7 + 1) : idx < (dailyData.checkinStreak % 7);
                  const isCurrentDay = !hasCheckedInToday && idx === (dailyData.checkinStreak % 7);

                  return (
                    <div key={idx} className="text-center p-3" style={{
                      background: isClaimed ? 'rgba(var(--brand-neon-rgb),0.05)' : isCurrentDay ? 'rgba(var(--brand-neon-rgb),0.1)' : 'var(--bs-tertiary-bg, rgba(255,255,255,0.02))',
                      borderRadius: '16px',
                      border: isCurrentDay ? '1px solid rgba(var(--brand-neon-rgb),0.3)' : '1px solid transparent',
                      opacity: (isClaimed || isCurrentDay) ? 1 : 0.4,
                      transition: 'all 0.3s'
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                        {isClaimed ? '✅' : reward.icon}
                      </div>
                      <div className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isClaimed ? 'var(--brand-neon)' : 'inherit' }}>
                        {isClaimed ? 'Đã Nhận' : `+${reward.points} ⭐`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleCheckin}
                disabled={hasCheckedInToday}
                className="btn w-100 mt-4 py-3 fw-bold"
                style={{
                  background: hasCheckedInToday ? 'var(--bs-tertiary-bg, rgba(255,255,255,0.03))' : 'var(--brand-neon)',
                  color: hasCheckedInToday ? 'var(--bs-secondary-color, rgba(255,255,255,0.3))' : '#000',
                  borderRadius: '16px', border: 'none',
                  transition: 'all 0.3s',
                  boxShadow: hasCheckedInToday ? 'none' : '0 4px 15px rgba(var(--brand-neon-rgb),0.3)'
                }}
              >
                {hasCheckedInToday ? 'Đã điểm danh hôm nay' : 'Điểm danh nhận thưởng ngay'}
              </button>
            </div>
          </Col>
        </Row>

        {/* Nhiệm vụ thực tế */}
        <div style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s' }}>
          <div className="p-4 p-md-5 mb-5 bg-surface-card border-surface" style={{
            borderRadius: '24px', border: '1px solid',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h4 className="fw-bold text-primary-dynamic mb-4 d-flex align-items-center" style={{ fontSize: '1.1rem' }}>Thử Thách Tập Luyện Hôm Nay</h4>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
              Hoàn thành bài tập thực tế qua AI Camera để được công nhận.
            </p>

            <div className="d-flex flex-column gap-3">
              {todayMissions.map((mission) => {
                const isExercised = actualCompletedToday.includes(mission.title);
                const isClaimed = claimedToday.includes(mission.id);

                return (
                  <div key={mission.id} className="d-flex align-items-center justify-content-between p-3 border-surface" style={{
                    background: isClaimed ? 'rgba(var(--brand-neon-rgb),0.03)' : 'var(--bs-tertiary-bg, rgba(255,255,255,0.02))',
                    borderRadius: '16px', border: isClaimed ? '1px solid rgba(var(--brand-neon-rgb),0.1)' : '1px solid transparent',
                    transition: 'all 0.3s'
                  }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center" style={{
                        width: '50px', height: '50px', fontSize: '1.5rem', background: '#1c1c1e', borderRadius: '14px'
                      }}>
                        {mission.icon}
                      </div>
                      <div>
                        <div className="fw-bold text-primary-dynamic mb-1" style={{ fontSize: '1rem' }}>{mission.title}</div>
                        <div style={{ color: '#ffd93d', fontSize: '0.85rem', fontWeight: '600' }}>Phần thưởng: +{mission.points} EXP</div>
                      </div>
                    </div>

                    <div>
                      {!isExercised ? (
                        <Button 
                          variant="dark" 
                          size="md" 
                          className="rounded-pill px-4 fw-bold" 
                          style={{ fontSize: '0.85rem', background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}
                          onClick={() => navigate(`/exercises/${mission.group}`)}
                        >
                          Đến bài tập
                        </Button>
                      ) : !isClaimed ? (
                        <Button 
                          variant="success" 
                          size="md" 
                          className="rounded-pill px-4 fw-bold shadow-sm" 
                          style={{ fontSize: '0.85rem', background: 'var(--brand-neon)', color: '#000', border: 'none' }}
                          onClick={() => handleClaimMission(mission)}
                        >
                          Nhận thưởng
                        </Button>
                      ) : (
                        <Badge bg="transparent" className="border border-success text-success rounded-pill px-4 py-2" style={{ fontSize: '0.8rem' }}>
                          ✓ ĐÃ NHẬN
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </Container>

      {/* Modal điểm danh */}
      <Modal show={showCheckinModal} onHide={() => setShowCheckinModal(false)} centered
        contentClassName="border-0 overflow-hidden"
        style={{ '--bs-modal-bg': 'transparent' }}
      >
        <Modal.Body className="text-center p-5 position-relative" style={{ background: '#1c1c1e', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: '4rem', animation: 'checkinBounce 0.6s ease', marginBottom: '16px' }}>🎁</div>
          <h4 className="fw-bold text-white mb-2">Điểm danh thành công!</h4>
          <div className="fw-bold mb-4" style={{ color: 'var(--brand-neon)', fontSize: '2rem' }}>
            +{CHECKIN_REWARDS[Math.max(0, dailyData.checkinStreak - 1) % 7].points} ⭐
          </div>
          <Button className="rounded-pill fw-bold w-100 py-3" onClick={() => setShowCheckinModal(false)}
            style={{ background: '#fff', color: '#000', border: 'none', fontSize: '1rem' }}>
            Tuyệt vời
          </Button>
        </Modal.Body>
      </Modal>

      <style>{`
        @keyframes checkinBounce {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
