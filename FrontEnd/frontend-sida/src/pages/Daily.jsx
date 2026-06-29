import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';

import { ALL_MISSIONS, getTodayKey, getDailyMissions } from '../services/rewards';

const CHECKIN_REWARDS = [
  { day: 1, points: 10 },
  { day: 2, points: 15 },
  { day: 3, points: 20 },
  { day: 4, points: 25 },
  { day: 5, points: 30 },
  { day: 6, points: 40 },
  { day: 7, points: 100 },
];

// Loại bỏ toàn bộ icon/emoji để giao diện trông chuyên nghiệp và trực quan hơn (Typographic style)

export default function Daily() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [animateIn, setAnimateIn] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  
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
    setShowCheckinModal(true);

    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00ff88', '#00b4d8', '#ffffff'],
        zIndex: 1060
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00ff88', '#00b4d8', '#ffffff'],
        zIndex: 1060
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
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
    
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00ff88', '#ffffff'],
      zIndex: 1060
    });
  };

  return (
    <div className="bg-surface-main" style={{ minHeight: '100vh', paddingTop: '30px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

      {/* Hiệu ứng nền nhẹ nhàng */}
      <div style={{ position: 'absolute', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.08) 0%, transparent 60%)', top: '-20vw', left: '-10vw', filter: 'blur(80px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(0,180,216,0.05) 0%, transparent 60%)', bottom: '-10vw', right: '-10vw', filter: 'blur(80px)', pointerEvents: 'none' }}></div>

      <Container style={{ position: 'relative', zIndex: 1, maxWidth: '960px' }}>

        {/* Hero Header */}
        <div className="mb-5 position-relative overflow-hidden bg-surface-card border-surface gym-hero" style={{
          opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
          borderRadius: '24px', border: '1px solid', padding: '40px',
        }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-2">
            <div>
              <div className="text-secondary fw-bold text-uppercase mb-2" style={{ letterSpacing: '2px', fontSize: '0.9rem' }}>{t('daily.subtitle')}</div>
              <h1 className="text-primary-dynamic mb-0" style={{ fontSize: '2.5rem', letterSpacing: '-1px', fontWeight: '900', textTransform: 'uppercase' }}>
                {t('daily.title_1')} <span style={{ color: 'var(--brand-neon)' }}>{t('daily.title_2')}</span>
              </h1>
            </div>
            <div className="mt-4 mt-md-0">
              <div className="gym-streak-badge">
                {t('daily.streak')} <span className="fw-black" style={{ color: '#000', fontSize: '1.2rem', marginLeft: '5px' }}>{dailyData.checkinStreak}</span>
              </div>
            </div>
          </div>
        </div>

        <Row className="g-4 mb-5" style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s' }}>
          
          {/* Check-in Card */}
          <Col lg={12}>
            <div className="p-4 p-md-5 h-100 d-flex flex-column bg-surface-card border-surface gym-panel" style={{ borderRadius: '24px', border: '1px solid' }}>
              <div className="d-flex justify-content-between align-items-center mb-5">
                <h4 className="fw-bold text-primary-dynamic mb-0 text-uppercase" style={{ letterSpacing: '1px' }}>{t('daily.week_progress')}</h4>
                <div className="px-3 py-1 rounded-pill border-surface text-secondary fw-bold" style={{ fontSize: '0.85rem' }}>
                  {t('daily.status')} {hasCheckedInToday ? <span className="text-success">{t('daily.checked_in')}</span> : <span className="text-warning">{t('daily.not_checked_in')}</span>}
                </div>
              </div>

              {/* Modern Fitness Pathway với Typography */}
              <div className="d-flex align-items-center justify-content-between mb-5 position-relative" style={{ overflowX: 'auto', paddingBottom: '20px' }}>
                <div className="gym-track-line border-surface"></div>
                
                {CHECKIN_REWARDS.map((reward, idx) => {
                  const isClaimed = hasCheckedInToday ? idx < ((dailyData.checkinStreak - 1) % 7 + 1) : idx < (dailyData.checkinStreak % 7);
                  const isCurrentDay = !hasCheckedInToday && idx === (dailyData.checkinStreak % 7);

                  return (
                    <div key={idx} className="text-center" style={{ position: 'relative', zIndex: 1, minWidth: '70px', flex: '1' }}>
                      <div className={`gym-node mx-auto ${isClaimed ? 'claimed' : ''} ${isCurrentDay ? 'current' : ''}`}>
                        <div className="gym-node-content fw-black">
                          {isClaimed ? '✓' : (idx + 1)}
                        </div>
                      </div>
                      <div className={`mt-3 fw-bold ${isCurrentDay ? 'text-primary-dynamic' : 'text-secondary'}`} style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>
                         {t('daily.day')} {reward.day}
                      </div>
                      <div className="fw-bold" style={{ color: isClaimed ? 'var(--brand-neon)' : 'var(--bs-secondary-color)', fontSize: '0.8rem' }}>
                        +{reward.points} EXP
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleCheckin}
                disabled={hasCheckedInToday}
                className="gym-btn w-100 py-3 mt-auto"
              >
                {hasCheckedInToday ? t('daily.completed_checkin') : t('daily.click_checkin')}
              </button>
            </div>
          </Col>
        </Row>

        {/* Nhiệm vụ thực tế */}
        <div style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s' }}>
          <h4 className="fw-bold text-primary-dynamic mb-4 text-uppercase" style={{ letterSpacing: '1px' }}>{t('daily.challenges')}</h4>
          
          <div className="d-flex flex-column gap-3">
            {todayMissions.map((mission, idx) => {
              const isExercised = actualCompletedToday.includes(mission.title);
              const isClaimed = claimedToday.includes(mission.id);
              const taskNumber = String(idx + 1).padStart(2, '0');

              return (
                <div key={mission.id} className={`gym-quest-card bg-surface-card border-surface ${isClaimed ? 'claimed' : (isExercised ? 'completed' : '')}`}>
                  <div className="d-flex align-items-center justify-content-between w-100 flex-wrap">
                    <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                      
                      {/* Dùng Typography Index Badge thay vì Emojis */}
                      <div className="gym-quest-number-wrapper">
                        {taskNumber}
                      </div>

                      <div>
                        <div className="fw-bold text-primary-dynamic mb-1" style={{ fontSize: '1.1rem' }}>{t(`exercises.${mission.id}`, mission.title)}</div>
                        <div className="fw-bold" style={{ color: 'var(--brand-neon)', fontSize: '0.9rem' }}>{t('daily.reward')}: {mission.points} EXP</div>
                      </div>
                    </div>

                    <div className="gym-quest-action">
                      {!isExercised ? (
                        <button 
                          className="gym-action-btn"
                          onClick={() => navigate(`/exercises/${mission.group}`)}
                        >
                          {t('daily.workout_now')}
                        </button>
                      ) : !isClaimed ? (
                        <button 
                          className="gym-action-btn claim"
                          onClick={() => handleClaimMission(mission)}
                        >
                          {t('daily.claim_reward')}
                        </button>
                      ) : (
                        <div className="fw-black text-success px-3 py-2 border border-success rounded-pill" style={{ fontSize: '0.85rem' }}>
                          {t('daily.claimed')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </Container>

      {/* Modal điểm danh */}
      <Modal show={showCheckinModal} onHide={() => setShowCheckinModal(false)} centered
        contentClassName="border-0 overflow-hidden"
        style={{ '--bs-modal-bg': 'transparent' }}
      >
        <Modal.Body className="text-center p-5 position-relative bg-surface-card border-surface" style={{ borderRadius: '32px', border: '1px solid', boxShadow: 'var(--shadow-lg), var(--shadow-neon)' }}>
          <div className="d-flex justify-content-center mb-4">
            <div className="success-circle">✓</div>
          </div>
          <h3 className="fw-black text-primary-dynamic mb-2 text-uppercase">{t('daily.success_title')}</h3>
          <div className="fw-black mb-4" style={{ color: 'var(--brand-neon)', fontSize: '2.5rem' }}>
            +{CHECKIN_REWARDS[Math.max(0, dailyData.checkinStreak - 1) % 7].points} EXP
          </div>
          <button className="gym-btn w-100 py-3" onClick={() => setShowCheckinModal(false)}>
            {t('daily.awesome')}
          </button>
        </Modal.Body>
      </Modal>

      <style>{`
        /* Modern Fitness Typographic Theme CSS */
        .fw-black {
          font-weight: 900;
        }

        .gym-hero {
          box-shadow: var(--shadow-md);
        }
        
        .gym-streak-badge {
          background: var(--brand-neon);
          color: #000;
          padding: 8px 24px;
          border-radius: 30px;
          font-weight: 700;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(var(--brand-neon-rgb), 0.3);
          display: inline-flex;
          align-items: center;
        }

        .gym-panel {
          box-shadow: var(--shadow-md);
        }

        .gym-track-line {
          position: absolute;
          top: 30px; /* middle of 60px node */
          left: 5%;
          right: 5%;
          height: 6px;
          background: var(--bs-border-color, rgba(128,128,128,0.2)); 
          z-index: 0;
          border-radius: 10px;
        }

        .gym-node {
          width: 60px;
          height: 60px;
          background: var(--bs-body-bg);
          border: 3px solid var(--bs-border-color, rgba(128,128,128,0.2));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .gym-node-content {
          font-size: 1.5rem;
          color: var(--bs-secondary-color);
        }

        .gym-node.claimed {
          background: var(--brand-neon);
          border-color: var(--brand-neon);
          box-shadow: 0 0 15px rgba(var(--brand-neon-rgb), 0.4);
        }

        .gym-node.claimed .gym-node-content {
          color: #000;
        }

        .gym-node.current {
          border-color: var(--brand-neon);
          background: var(--bs-body-bg);
          box-shadow: 0 0 0 6px rgba(var(--brand-neon-rgb), 0.2);
          animation: gymPulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gym-node.current .gym-node-content {
          color: var(--brand-neon);
        }

        @keyframes gymPulse {
          0% { box-shadow: 0 0 0 0 rgba(var(--brand-neon-rgb), 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(var(--brand-neon-rgb), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--brand-neon-rgb), 0); }
        }

        .gym-btn {
          background: var(--bs-body-bg);
          color: var(--text-primary-dynamic);
          border: 2px solid var(--brand-neon);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 16px;
          transition: all 0.3s;
        }

        .gym-btn:hover:not(:disabled) {
          background: var(--brand-neon);
          color: #000;
          box-shadow: 0 8px 25px rgba(var(--brand-neon-rgb), 0.4);
          transform: translateY(-2px);
        }

        .gym-btn:disabled {
          border-color: transparent;
          background: var(--bs-tertiary-bg);
          color: var(--bs-secondary-color);
          cursor: not-allowed;
        }

        .gym-quest-card {
          border-radius: 20px;
          padding: 20px 25px;
          transition: all 0.3s;
          border-left: 6px solid transparent !important;
        }

        .gym-quest-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--brand-neon) !important;
        }

        .gym-quest-card.completed {
          border-left-color: var(--brand-neon) !important;
        }

        .gym-quest-card.claimed {
          opacity: 0.6;
          border-left-color: transparent !important;
        }

        .gym-quest-number-wrapper {
          width: 60px;
          height: 60px;
          background: transparent;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--bs-secondary-color);
          border: 2px solid var(--bs-border-color, rgba(128,128,128,0.2));
          transition: all 0.3s;
        }

        .gym-quest-card:hover .gym-quest-number-wrapper {
          border-color: var(--brand-neon);
          color: var(--brand-neon);
        }
        
        .gym-quest-card.completed .gym-quest-number-wrapper {
          border-color: var(--brand-neon);
          background: var(--brand-neon);
          color: #000;
        }

        .gym-quest-card.claimed .gym-quest-number-wrapper {
          border-color: transparent;
          background: var(--bs-tertiary-bg);
          color: var(--bs-secondary-color);
        }

        .gym-action-btn {
          background: transparent;
          color: var(--text-primary-dynamic);
          border: 2px solid var(--text-primary-dynamic);
          padding: 10px 24px;
          border-radius: 30px;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.85rem;
          transition: all 0.3s;
        }

        .gym-action-btn:hover {
          background: var(--text-primary-dynamic);
          color: var(--bs-body-bg);
          transform: scale(1.05);
        }

        .gym-action-btn.claim {
          background: var(--brand-neon);
          color: #000;
          border-color: var(--brand-neon);
          box-shadow: 0 4px 15px rgba(var(--brand-neon-rgb), 0.3);
        }
          
        .gym-action-btn.claim:hover {
          background: var(--brand-neon);
          color: #000;
          transform: scale(1.05);
        }

        .success-circle {
          width: 80px;
          height: 80px;
          background: var(--brand-neon);
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.5rem;
          font-weight: 900;
          animation: checkinScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 30px rgba(var(--brand-neon-rgb), 0.4);
        }

        @keyframes checkinScale {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
