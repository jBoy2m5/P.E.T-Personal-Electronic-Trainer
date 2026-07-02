import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePetStore from '../store/usePetStore';
import useRoadmapStore from '../store/useRoadmapStore';
import useExerciseStore from '../store/useExerciseStore';
import { getDailyMissions } from '../services/rewards';
import petChatbot from '../assets/pet_chatbot.png';
import petBgImage from '../assets/pet_bg.webp'; // File background ảnh thật

// Trang phục cho pet — mở khóa khi tổng EXP đạt ngưỡng (không trừ EXP)
const OUTFITS = [
  { id: 'cap', icon: '🧢', nameKey: 'outfit_cap', minExp: 150 },
  { id: 'glasses', icon: '🕶️', nameKey: 'outfit_glasses', minExp: 200 },
];

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

export default function PetProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { totalPoints, exercisesTrained, getCurrentLevel, claimedMissions, claimMission, checkinStreak, lastCheckinDate, performCheckin, petName, updatePetName, equippedOutfits, toggleOutfit } = usePetStore();
  const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  const [petData, setPetData] = useState({
    pet_name: 'P.E.T',
    total_exp: 0,
    checkin_streak: 0,
    level: 1,
  });

  const [tasks, setTasks] = useState([]);
  const [checkinDone, setCheckinDone] = useState(false);

  // Thử thách tập luyện hôm nay — cùng nguồn dữ liệu với trang Nhiệm vụ (Daily) nên tự đồng bộ:
  // danh sách từ getDailyMissions (bài của ngày lộ trình hôm nay), hoàn thành từ exercises_trained (server),
  // đã nhận từ claimedMissions (server)
  const roadmapData = useRoadmapStore((s) => s.roadmapData);
  const roadmapInitialized = useRoadmapStore((s) => s.initialized);
  const loadRoadmap = useRoadmapStore((s) => s.loadRoadmap);
  const allExercises = useExerciseStore((s) => s.exercises);
  useEffect(() => {
    if (!roadmapInitialized) loadRoadmap();
    useExerciseStore.getState().fetchExercises();
  }, [roadmapInitialized, loadRoadmap]);
  const todayMissions = getDailyMissions(todayKey, roadmapData, allExercises);
  const actualCompletedToday = exercisesTrained || [];
  const [checkinExpGained, setCheckinExpGained] = useState(0);

  // Modal States
  const [showEditName, setShowEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  
  const [showOutfit, setShowOutfit] = useState(false);
  
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ sender: 'ai', text: t('pet_profile.hello_ai') }]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hearts, setHearts] = useState([]);

  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-bs-theme') === 'dark');

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-bs-theme') {
          setIsDark(document.documentElement.getAttribute('data-bs-theme') === 'dark');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const exp = totalPoints || 0;
    const trainedArray = exercisesTrained || [];

    let currentLevelObj = PET_LEVELS[0];
    for (const lvl of PET_LEVELS) {
      if (exp >= lvl.minPoints) currentLevelObj = lvl;
    }

    // Tên pet lấy từ server (usePetStore), không dùng localStorage
    const pet_name = petName || (exp >= 10 ? 'Quẹc' : 'Vô Danh');

    setPetData({ pet_name, total_exp: exp, checkin_streak: 0, level: currentLevelObj.level });

    const todayClaimed = claimedMissions?.[todayKey] || [];

    // Chỉ giữ 3 nhiệm vụ cố định, không sinh thêm nhiệm vụ theo từng bài tập
    const loadedTasks = [
      { id: 'login', name: t('pet_profile.task_login'), expReward: 10, completed: true, claimed: todayClaimed.includes('login') },
      { id: 'exercise_1', name: t('pet_profile.task_complete_1'), expReward: 20, completed: trainedArray.length > 0, claimed: todayClaimed.includes('exercise_1') },
      { id: 'exercise_3', name: t('pet_profile.task_complete_3'), expReward: 50, completed: trainedArray.length >= 3, claimed: todayClaimed.includes('exercise_3') }
    ];

    setTasks(loadedTasks);

    // Sync checkin state
    setCheckinDone(lastCheckinDate === todayKey);
  }, [totalPoints, exercisesTrained, claimedMissions, lastCheckinDate, petName]);

  const currentLevelObj = PET_LEVELS.find(l => l.level === petData.level) || PET_LEVELS[0];
  const nextLevelObj = PET_LEVELS.find(l => l.minPoints > petData.total_exp);
  
  // Progress Bar Width
  const maxExp = nextLevelObj ? nextLevelObj.minPoints : petData.total_exp;
  const progressPercent = Math.min((petData.total_exp / maxExp) * 100, 100);

  const handleCheckin = async () => {
    if (checkinDone) return;
    const exp = await performCheckin();
    if (exp !== null) {
      setCheckinDone(true);
      setCheckinExpGained(exp);
    }
  };

  const handleNameSave = async () => {
    const trimmed = editNameValue.trim().slice(0, 20);
    if (trimmed) {
      // Lưu tên pet lên server
      await updatePetName(trimmed);
      setPetData(prev => ({ ...prev, pet_name: trimmed }));
    }
    setShowEditName(false);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'user', text: chatInput };
    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'ai', text: t('pet_profile.auto_reply') }]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePetClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newHeart = {
      id: Date.now(),
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 20 - 10)
    };
    
    setHearts(prev => [...prev, newHeart]);
    
    // Xóa tim sau khi animation kết thúc (khoảng 1s)
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  return (
    <div className="pet-tiktok-layout" style={{ background: isDark ? '#1a1a2e' : '#f8f9fa', minHeight: '100vh', overflow: 'hidden' }}>
      <Container fluid className="p-0 h-100">
        <Row className="m-0 h-100" style={{ minHeight: '100vh' }}>
          
          {/* CỘT TRÁI: Khu vực Thao tác & Thông tin */}
          <Col lg={5} xl={4} className={`d-flex flex-column order-2 order-lg-1 shadow-lg z-2 ${isDark ? 'bg-dark border-end border-secondary' : 'bg-white'}`} style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            
            {/* Top Bar */}
            <div className={`d-flex justify-content-between align-items-center p-4 sticky-top z-3 ${isDark ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
              <button onClick={() => navigate(-1)} className="btn p-0 d-flex align-items-center justify-content-center rounded-circle border-0" style={{ width: '40px', height: '40px', background: isDark ? 'rgba(255,255,255,0.1)' : '#f8f9fa' }}>
                <span className={`fw-bold fs-5 ${isDark ? 'text-white' : 'text-dark'}`}>✕</span>
              </button>
              
              <div 
                className={`fw-bold fs-5 d-flex align-items-center gap-2 px-4 py-2 rounded-pill border ${isDark ? 'text-white border-secondary' : 'text-dark border-light'}`}
                style={{ cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa', maxWidth: '260px' }}
                onClick={() => { setEditNameValue(petData.pet_name); setShowEditName(true); }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{petData.pet_name}</span> ✏️
              </div>

              {/* Ô trống cân đối với nút ✕ bên trái để tên pet luôn ở giữa (đổi tên bằng nút ✏️ giữa) */}
              <div style={{ width: '40px' }}></div>
            </div>

            {/* Content Left */}
            <div className="p-4 pt-0">
              {/* Premium Artistic Progress Bar */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-end fw-black mb-2 px-1">
                  <span style={{ color: '#6c757d', fontSize: '1rem', letterSpacing: '0.5px' }}>{t('pet_profile.level')} {petData.level}</span>
                  <span style={{ color: '#00b4d8', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,180,216,0.2)' }}>{petData.total_exp} / {maxExp} <span style={{ fontSize: '0.8rem' }}>EXP</span></span>
                </div>
                
                {/* Thanh chứa ngoài (Track) */}
                <div className="position-relative overflow-hidden" style={{ 
                  width: '100%', 
                  height: '24px', 
                  background: 'rgba(240, 242, 245, 0.8)', 
                  borderRadius: '12px', 
                  boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(255,255,255,1)',
                  border: '1px solid rgba(255,255,255,0.5)'
                }}>
                  {/* Thanh phần trăm bên trong (Fill) */}
                  <div className="h-100 position-relative" style={{ 
                    width: `${progressPercent}%`, 
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, #00c6ff, #0072ff, #00c6ff)', 
                    backgroundSize: '200% 100%',
                    transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', /* Hiệu ứng nảy nhẹ khi tăng */
                    animation: 'shimmer 3s linear infinite',
                    boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.1), 0 4px 10px rgba(0, 198, 255, 0.4)'
                  }}>
                    {/* Hạt sáng ở đỉnh thanh (Glowing Tip) */}
                    <div className="position-absolute bg-white rounded-circle" style={{
                      right: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      boxShadow: '0 0 12px 4px rgba(255,255,255,0.9), 0 0 20px 5px rgba(0,198,255,0.6)'
                    }}></div>
                  </div>
                </div>
                
                <div className="mt-3 text-center fw-bold" style={{ fontSize: '0.9rem', color: '#0077b6', opacity: 0.9 }}>{t('pet_profile.work_hard')}</div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-2 justify-content-center mb-4">
                <button onClick={() => setShowOutfit(true)} className="btn rounded-pill fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm flex-grow-1 justify-content-center" style={{ background: isDark ? 'rgba(0,119,182,0.1)' : '#f8f9fa', color: isDark ? '#90e0ef' : '#0077b6', border: '1px solid rgba(0,119,182,0.2)' }}>
                  👕 {t('pet_profile.outfit')}
                </button>
                <button onClick={() => setShowChat(true)} className="btn rounded-pill fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm flex-grow-1 justify-content-center" style={{ background: isDark ? 'rgba(2,62,138,0.1)' : '#f8f9fa', color: isDark ? '#caf0f8' : '#023e8a', border: '1px solid rgba(2,62,138,0.2)' }}>
                  💬 {t('pet_profile.ai_chat')}
                </button>
              </div>

              {/* Check-in Card */}
              <Card className={`border shadow-sm rounded-4 mb-4 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`}>
                <Card.Body className="p-4">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#adb5bd', letterSpacing: '1px', textTransform: 'uppercase' }}>Tiêu hao calo, tích lũy điểm số</div>
                      <h5 className="fw-black mb-0" style={{ fontSize: '1.1rem' }}>ĐIỂM DANH & <span style={{ color: '#c8f000' }}>NHIỆM VỤ</span></h5>
                    </div>
                    <div className="fw-bold rounded-pill px-3 py-1" style={{ background: '#c8f000', color: '#000', fontSize: '0.85rem' }}>
                      CHUỖI NGÀY: {checkinStreak || 0}
                    </div>
                  </div>

                  {/* Weekly progress */}
                  <div className={`rounded-3 p-3 mt-3 mb-3 ${isDark ? 'bg-black' : 'bg-light'}`}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold" style={{ fontSize: '0.9rem' }}>Tiến độ tuần này</span>
                      <span style={{ fontSize: '0.75rem', color: checkinDone ? '#c8f000' : '#adb5bd', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        Trạng thái: {checkinDone ? 'Đã điểm danh' : 'Chưa điểm danh'}
                      </span>
                    </div>
                    {(() => {
                      const expPerDay = [10, 15, 20, 25, 30, 40, 100];
                      const streak = checkinStreak || 0;
                      const dayInCycle = streak === 0 ? 0 : ((streak - 1) % 7) + 1;
                      return (
                        <div className="d-flex justify-content-between align-items-start position-relative">
                          <div className="position-absolute" style={{ top: '22px', left: '8%', right: '8%', height: '2px', background: isDark ? '#333' : '#dee2e6', zIndex: 0 }}></div>
                          {expPerDay.map((exp, i) => {
                            const day = i + 1;
                            const done = day <= dayInCycle;
                            const isCurrent = day === dayInCycle + 1 && !checkinDone;
                            return (
                              <div key={day} className="d-flex flex-column align-items-center z-1" style={{ width: '14%', minWidth: 0 }}>
                                {/* Ô tròn co theo bề rộng cột để không tràn/đè các khối khác trên màn hình nhỏ */}
                                <div className="d-flex align-items-center justify-content-center rounded-circle fw-bold mb-1" style={{
                                  width: 'min(100%, 44px)', aspectRatio: '1 / 1',
                                  background: done ? '#c8f000' : (isCurrent ? 'rgba(200,240,0,0.15)' : (isDark ? '#222' : '#f8f9fa')),
                                  border: done ? 'none' : `2px solid ${isCurrent ? '#c8f000' : (isDark ? '#444' : '#dee2e6')}`,
                                  color: done ? '#000' : (isDark ? '#fff' : '#333'),
                                  fontSize: done ? 'clamp(0.75rem, 2vw, 1.1rem)' : 'clamp(0.65rem, 1.8vw, 0.9rem)'
                                }}>
                                  {done ? '✓' : day}
                                </div>
                                <div style={{ fontSize: 'clamp(0.5rem, 1.4vw, 0.65rem)', color: '#adb5bd', textAlign: 'center', whiteSpace: 'nowrap' }}>NGÀY {day}</div>
                                <div style={{ fontSize: 'clamp(0.5rem, 1.4vw, 0.7rem)', color: done ? '#c8f000' : '#adb5bd', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+{exp} EXP</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {checkinExpGained > 0 && (
                    <div className="text-center mb-2 fw-bold" style={{ color: '#c8f000', fontSize: '0.9rem' }}>
                      +{checkinExpGained} EXP đã được cộng!
                    </div>
                  )}

                  <button
                    className="btn w-100 fw-bold py-3 rounded-3"
                    style={{
                      background: checkinDone ? (isDark ? '#333' : '#e9ecef') : '#c8f000',
                      color: checkinDone ? '#adb5bd' : '#000',
                      border: 'none',
                      cursor: checkinDone ? 'not-allowed' : 'pointer',
                      letterSpacing: '1px'
                    }}
                    disabled={checkinDone}
                    onClick={handleCheckin}
                  >
                    {checkinDone ? 'ĐÃ HOÀN THÀNH ĐIỂM DANH HÔM NAY' : 'ĐIỂM DANH NGAY'}
                  </button>
                </Card.Body>
              </Card>

              {/* Task Card */}
              <Card className={`border shadow-sm rounded-4 mb-4 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ transition: 'all 0.3s ease' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
              >
                <Card.Body className="p-4">
                  <h5 className="fw-black mb-4">{t('pet_profile.pet_missions')}</h5>
                  <div className="d-flex flex-column gap-3">
                    {tasks.map(task => (
                      <div key={task.id} className="d-flex align-items-center gap-3 justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px', background: task.claimed ? '#e8f5e9' : task.completed ? '#fff8e1' : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa'), color: task.claimed ? '#2e7d32' : task.completed ? '#f9a825' : '#adb5bd', border: task.claimed ? 'none' : task.completed ? '1px solid #f9a825' : '1px solid #dee2e6' }}>
                            {task.claimed ? '✓' : task.completed ? '!' : '•'}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ color: task.completed ? (isDark ? '#e0e0e0' : '#212529') : (isDark ? '#9e9e9e' : '#495057') }}>{task.name}</div>
                            <div style={{ color: '#00b4d8', fontSize: '0.85rem', fontWeight: 'bold' }}>+{task.expReward} EXP</div>
                          </div>
                        </div>
                        {task.completed && !task.claimed && (
                          <button className="btn btn-sm fw-bold rounded-pill flex-shrink-0" style={{ background: '#00b4d8', color: '#fff', border: 'none', padding: '4px 14px' }} onClick={() => claimMission(task.id, task.expReward)}>
                            Nhận
                          </button>
                        )}
                        {task.claimed && (
                          <span style={{ color: '#2e7d32', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>✓ Đã nhận</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Thử thách tập luyện — đồng bộ với trang Nhiệm vụ (cùng missions/claims/completion) */}
              <Card className={`border shadow-sm rounded-4 mb-4 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`}>
                <Card.Body className="p-4">
                  <h5 className="fw-black mb-4">{t('pet_profile.workout_challenges')}</h5>
                  <div className="d-flex flex-column gap-3">
                    {/* Ngày nghỉ trong lộ trình → không giao thử thách */}
                    {todayMissions.length === 0 && (
                      <div className="text-center py-2" style={{ color: '#adb5bd', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        {t('daily.rest_day_desc')}
                      </div>
                    )}
                    {todayMissions.map((mission) => {
                      const isExercised = actualCompletedToday.includes(mission.title);
                      const isClaimed = (claimedMissions?.[todayKey] || []).includes(mission.id);
                      return (
                        <div key={mission.id} className="d-flex align-items-center gap-3 justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px', background: isClaimed ? '#e8f5e9' : isExercised ? '#fff8e1' : (isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa'), color: isClaimed ? '#2e7d32' : isExercised ? '#f9a825' : '#adb5bd', border: isClaimed ? 'none' : isExercised ? '1px solid #f9a825' : '1px solid #dee2e6' }}>
                              {isClaimed ? '✓' : isExercised ? '!' : '•'}
                            </div>
                            <div>
                              <div className="fw-bold" style={{ color: isExercised || isClaimed ? (isDark ? '#e0e0e0' : '#212529') : (isDark ? '#9e9e9e' : '#495057') }}>{mission.title}</div>
                              <div style={{ color: '#00b4d8', fontSize: '0.85rem', fontWeight: 'bold' }}>+{mission.points} EXP</div>
                            </div>
                          </div>
                          {!isExercised && !isClaimed && (
                            <button className="btn btn-sm fw-bold rounded-pill flex-shrink-0" style={{ background: 'transparent', color: isDark ? '#e0e0e0' : '#495057', border: `1px solid ${isDark ? '#555' : '#ced4da'}`, padding: '4px 14px' }} onClick={() => navigate(mission.dayId ? `/daily-workout/${mission.dayId}` : (mission.group ? `/exercises/${mission.group}` : '/roadmap'))}>
                              {t('daily.workout_now')}
                            </button>
                          )}
                          {isExercised && !isClaimed && (
                            <button className="btn btn-sm fw-bold rounded-pill flex-shrink-0" style={{ background: '#00b4d8', color: '#fff', border: 'none', padding: '4px 14px' }} onClick={() => claimMission(mission.id, mission.points)}>
                              {t('daily.claim_reward')}
                            </button>
                          )}
                          {isClaimed && (
                            <span style={{ color: '#2e7d32', fontSize: '0.8rem', fontWeight: 'bold', flexShrink: 0 }}>{t('daily.claimed')}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>

            </div>
          </Col>

          {/* CỘT PHẢI: Pet Center Stage */}
          <Col lg={7} xl={8} className="d-flex flex-column align-items-center justify-content-center p-0 order-1 order-lg-2 position-relative" style={{ minHeight: '40vh', backgroundImage: `url(${petBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#e0c3fc', userSelect: 'none', WebkitUserSelect: 'none' }}>
            
            {/* Animated Glow behind Pet (Giữ lại để pet nổi bật trên nền) */}
            <div className="position-absolute rounded-circle" style={{ width: '40vw', height: '40vw', maxWidth: '500px', maxHeight: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(20px)', animation: 'pulseGlow 4s infinite alternate' }}></div>

            <div className="z-2 text-center position-relative" onClick={handlePetClick} style={{ cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}>
              {petData.level === 1 ? (
                <span style={{ fontSize: '15vw', animation: 'petFloat 3s ease-in-out infinite', display: 'inline-block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))', userSelect: 'none' }}>🥚</span>
              ) : (
                <div className="position-relative d-inline-block" style={{ animation: 'petFloat 3s ease-in-out infinite' }}>
                  <img src={petChatbot} alt="Pet" className="pet-img" draggable={false} style={{ width: '40vw', maxWidth: '400px', minWidth: '200px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.3))', userSelect: 'none', WebkitUserSelect: 'none', WebkitUserDrag: 'none' }} />
                  {/* Trang phục pet đang mặc (đồng bộ từ server qua appearance_type) */}
                  {(equippedOutfits || []).includes('cap') && (
                    <span style={{ position: 'absolute', top: '-6%', left: '50%', transform: 'translateX(-50%) rotate(-8deg)', fontSize: 'clamp(45px, 8vw, 85px)', pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.3))' }}>🧢</span>
                  )}
                  {(equippedOutfits || []).includes('glasses') && (
                    <span style={{ position: 'absolute', top: '16%', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(35px, 6vw, 65px)', pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>🕶️</span>
                  )}
                </div>
              )}
              {/* Hiển thị các trái tim */}
              {hearts.map(heart => (
                <div 
                  key={heart.id} 
                  style={{
                    position: 'absolute',
                    left: `${heart.x}px`,
                    top: `${heart.y}px`,
                    fontSize: '2rem',
                    pointerEvents: 'none',
                    animation: 'floatUpHeart 1s ease-out forwards',
                    zIndex: 10
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>

            {/* Lời thoại động dễ thương */}
            <div className={`position-absolute z-2 rounded-pill px-4 py-2 shadow fw-bold text-primary ${isDark ? 'bg-dark border border-secondary' : 'bg-white'}`} style={{ top: '20%', right: '20%', transform: 'rotate(5deg)', animation: 'petFloat 4s ease-in-out infinite' }}>
              {t('pet_profile.keep_working')}
            </div>

          </Col>
        </Row>
      </Container>

      {/* --- MODALS (Không thay đổi) --- */}

      {/* 1. Edit Name Modal */}
      <Modal show={showEditName} onHide={() => setShowEditName(false)} centered>
        <Modal.Body className="text-center p-4">
          <h5 className="fw-black mb-3">{t('pet_profile.rename_pet')}</h5>
          <Form.Control type="text" value={editNameValue} maxLength={20} onChange={(e) => setEditNameValue(e.target.value)} className="mb-1 text-center fw-bold" placeholder={t('pet_profile.enter_new_name')} autoFocus />
          <div className="text-muted small mb-3">{editNameValue.length}/20</div>
          <Button className="w-100 fw-bold rounded-pill" onClick={handleNameSave} style={{ background: '#00b4d8', border: 'none' }}>{t('pet_profile.save_name')}</Button>
        </Modal.Body>
      </Modal>

      {/* 2. Outfit Shop Modal */}
      <Modal show={showOutfit} onHide={() => setShowOutfit(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-black text-primary">👕 {t('pet_profile.outfit_store')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          <div className="mb-4">
            <span className="fw-bold text-secondary">{t('pet_profile.your_exp')}</span>
            <span className="fw-black text-primary fs-5">{petData.total_exp}</span>
          </div>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            {OUTFITS.map((item) => {
              const unlocked = petData.total_exp >= item.minExp;
              const isEquipped = (equippedOutfits || []).includes(item.id);
              return (
                <div key={item.id} className={`p-3 border rounded-3 d-flex flex-column justify-content-between ${unlocked ? 'bg-light border-primary' : 'bg-light text-muted'}`} style={{ width: '130px', minHeight: '160px', opacity: unlocked ? 1 : 0.7 }}>
                  <div>
                    <div style={{ fontSize: '3rem' }}>{item.icon}</div>
                    <div className="fw-bold mt-2 small">{t(`pet_profile.${item.nameKey}`)}</div>
                  </div>
                  {unlocked ? (
                    <Button size="sm" variant={isEquipped ? 'success' : 'primary'} className="mt-2 fw-bold w-100" onClick={() => toggleOutfit(item.id)}>
                      {isEquipped ? `✓ ${t('pet_profile.equipped')}` : t('pet_profile.equip')}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-secondary" disabled className="mt-2 fw-bold w-100">🔒 {item.minExp} EXP</Button>
                  )}
                </div>
              );
            })}
          </div>
        </Modal.Body>
      </Modal>

      {/* 3. AI Chat Modal */}
      <Modal show={showChat} onHide={() => setShowChat(false)} fullscreen="sm-down" centered size="lg">
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-black text-primary d-flex align-items-center gap-2">
            <img src={petChatbot} alt="AI" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
            {t('pet_profile.expert')} {petData.pet_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 d-flex flex-column" style={{ height: '60vh', background: '#f8f9fa' }}>
          <div className="flex-grow-1 overflow-auto d-flex flex-column gap-3 mb-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div 
                  className={`p-3 rounded-4 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                  style={{ maxWidth: '75%', borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px', borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '16px' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex justify-content-start">
                <div className="p-3 rounded-4 bg-white text-muted border shadow-sm" style={{ borderBottomLeftRadius: '4px' }}>
                  <span className="typing-dots">{t('pet_profile.typing')}</span>
                </div>
              </div>
            )}
          </div>
          <div className="d-flex gap-2">
            <Form.Control 
              type="text" 
              placeholder={t('pet_profile.ask_ai')} 
              className="rounded-pill px-4 shadow-sm border-0 py-3"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', flexShrink: 0, background: '#00b4d8', border: 'none' }}>
              ➤
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        @keyframes petFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: 0 0; }
        }
        .typing-dots {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes floatUpHeart {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        
        /* Chỉnh tỷ lệ pet trên Desktop */
        @media (min-width: 992px) {
          .pet-img {
            width: 35vw !important;
            max-width: 500px !important;
          }
        }
      `}</style>
    </div>
  );
}
