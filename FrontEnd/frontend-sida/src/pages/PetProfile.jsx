import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePetStore from '../store/usePetStore';
import petChatbot from '../assets/pet_chatbot.png';
import petBgImage from '../assets/pet_bg.png'; // File background ảnh thật

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
  const { totalPoints, exercisesTrained, getCurrentLevel, claimedMissions, claimMission } = usePetStore();
  const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  const [petData, setPetData] = useState({
    pet_name: 'P.E.T',
    total_exp: 0,
    checkin_streak: 0,
    level: 1,
  });

  const [tasks, setTasks] = useState([]);

  // Modal States
  const [showEditName, setShowEditName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  
  const [showOutfit, setShowOutfit] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  
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

    const petSaved = localStorage.getItem('pet-data');
    let pet_name = 'Vô Danh';
    if (exp >= 10) pet_name = 'Quẹc';
    if (petSaved) {
      const parsedPet = JSON.parse(petSaved);
      if (parsedPet.pet_name) pet_name = parsedPet.pet_name;
    }

    setPetData({ pet_name, total_exp: exp, checkin_streak: 0, level: currentLevelObj.level });

    const todayClaimed = claimedMissions?.[todayKey] || [];

    let loadedTasks = [
      { id: 'login', name: t('pet_profile.task_login'), expReward: 10, completed: true, claimed: todayClaimed.includes('login') },
      { id: 'exercise_1', name: t('pet_profile.task_complete_1'), expReward: 20, completed: trainedArray.length > 0, claimed: todayClaimed.includes('exercise_1') },
      { id: 'exercise_3', name: t('pet_profile.task_complete_3'), expReward: 50, completed: trainedArray.length >= 3, claimed: todayClaimed.includes('exercise_3') }
    ];

    if (trainedArray.length > 0) {
      trainedArray.slice(0, 2).forEach((ex) => {
        const id = `ex_${ex}`;
        loadedTasks.push({
          id,
          name: t('pet_profile.task_complete_ex', { ex }),
          expReward: 15,
          completed: true,
          claimed: todayClaimed.includes(id)
        });
      });
    }

    setTasks(loadedTasks);

    // Auto-claim login mission
    if (!todayClaimed.includes('login')) {
      claimMission('login', 10);
    }
  }, [totalPoints, exercisesTrained, claimedMissions]);

  const currentLevelObj = PET_LEVELS.find(l => l.level === petData.level) || PET_LEVELS[0];
  const nextLevelObj = PET_LEVELS.find(l => l.minPoints > petData.total_exp);
  
  // Progress Bar Width
  const maxExp = nextLevelObj ? nextLevelObj.minPoints : petData.total_exp;
  const progressPercent = Math.min((petData.total_exp / maxExp) * 100, 100);

  const handleNameSave = () => {
    if (editNameValue.trim()) {
      const newData = { ...petData, pet_name: editNameValue.trim() };
      setPetData(newData);
      localStorage.setItem('pet-data', JSON.stringify(newData));
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
                style={{ cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa' }}
                onClick={() => { setEditNameValue(petData.pet_name); setShowEditName(true); }}
              >
                {petData.pet_name} ✏️
              </div>

              <div className="position-relative">
                <button 
                  className="btn p-0 d-flex align-items-center justify-content-center rounded-circle border-0" 
                  style={{ width: '40px', height: '40px', background: isDark ? 'rgba(255,255,255,0.1)' : '#f8f9fa' }}
                  onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling;
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                  }}
                >
                  <span className={`fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>...</span>
                </button>
                <div className="pet-dropdown-menu" style={{
                  display: 'none',
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  background: isDark ? '#2b2b40' : '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                  minWidth: '200px',
                  zIndex: 999,
                  overflow: 'hidden'
                }}>
                  <button 
                    className="btn w-100 text-start px-4 py-3 d-flex align-items-center gap-2 border-0"
                    style={{ fontSize: '0.95rem', color: isDark ? '#fff' : '#333' }}
                    onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f8f9fa'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => { 
                      setEditNameValue(petData.pet_name); 
                      setShowEditName(true);
                      document.querySelectorAll('.pet-dropdown-menu').forEach(el => el.style.display = 'none');
                    }}
                  >
                    ✏️ {t('pet_profile.rename_pet') || 'Đặt lại tên thú cưng'}
                  </button>
                </div>
              </div>
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
                <button onClick={() => setShowDonation(true)} className="btn rounded-pill fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm flex-grow-1 justify-content-center" style={{ background: isDark ? 'rgba(230,57,70,0.1)' : '#f8f9fa', color: isDark ? '#ffb3c6' : '#e63946', border: '1px solid rgba(230,57,70,0.2)' }}>
                  💖 {t('pet_profile.donation')}
                </button>
              </div>

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

              {/* Streak Card */}
              <Card className={`border shadow-sm rounded-4 mb-5 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-white text-dark'}`} style={{ transition: 'all 0.3s ease' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
              >
                <Card.Body className="p-4">
                  <h5 className="fw-black mb-4">{t('pet_profile.streak_badges')}</h5>
                  <div className="d-flex justify-content-between align-items-center position-relative">
                    <div className="position-absolute" style={{ top: '35%', left: '10%', right: '10%', height: '2px', background: isDark ? '#424242' : '#e9ecef', zIndex: 0 }}></div>
                    {[3, 10, 30, 100, 200].map(days => {
                      const achieved = petData.checkin_streak >= days;
                      return (
                        <div key={days} className="d-flex flex-column align-items-center position-relative z-1" style={{ width: '50px' }}>
                          <div className={`mb-2 d-flex align-items-center justify-content-center ${isDark ? 'bg-dark' : 'bg-white'}`} style={{ 
                            width: '45px', height: '45px', borderRadius: '50%',
                            border: achieved ? '2px solid #ff9900' : `2px solid ${isDark ? '#424242' : '#e9ecef'}`,
                            boxShadow: achieved ? '0 5px 15px rgba(255,153,0,0.3)' : 'none'
                          }}>
                            <span style={{ fontSize: '1.5rem', filter: achieved ? 'none' : 'grayscale(100%) opacity(0.3)' }}>🔥</span>
                          </div>
                          <span className="fw-bold" style={{ fontSize: '0.8rem', color: achieved ? '#ff9900' : '#adb5bd' }}>{days}d</span>
                        </div>
                      )
                    })}
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* CỘT PHẢI: Pet Center Stage */}
          <Col lg={7} xl={8} className="d-flex flex-column align-items-center justify-content-center p-0 order-1 order-lg-2 position-relative" style={{ minHeight: '40vh', backgroundImage: `url(${petBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#e0c3fc' }}>
            
            {/* Animated Glow behind Pet (Giữ lại để pet nổi bật trên nền) */}
            <div className="position-absolute rounded-circle" style={{ width: '40vw', height: '40vw', maxWidth: '500px', maxHeight: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(20px)', animation: 'pulseGlow 4s infinite alternate' }}></div>

            <div className="z-2 text-center position-relative" onClick={handlePetClick} style={{ cursor: 'pointer' }}>
              {petData.level === 1 ? (
                <span style={{ fontSize: '15vw', animation: 'petFloat 3s ease-in-out infinite', display: 'inline-block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))' }}>🥚</span>
              ) : (
                <img src={petChatbot} alt="Pet" className="pet-img" style={{ width: '40vw', maxWidth: '400px', minWidth: '200px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.3))', animation: 'petFloat 3s ease-in-out infinite' }} />
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
          <Form.Control type="text" value={editNameValue} onChange={(e) => setEditNameValue(e.target.value)} className="mb-3 text-center fw-bold" placeholder={t('pet_profile.enter_new_name')} autoFocus />
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
            <div className={`p-3 border rounded-3 ${petData.total_exp >= 150 ? 'bg-light border-primary' : 'bg-light text-muted'}`} style={{ width: '120px', opacity: petData.total_exp >= 150 ? 1 : 0.7 }}>
              <div style={{ fontSize: '3rem' }}>🧢</div>
              <div className="fw-bold mt-2 small">Mũ Snapback</div>
              {petData.total_exp >= 150 ? (
                <Button size="sm" variant="primary" className="mt-2 fw-bold w-100">Trang bị</Button>
              ) : (
                <Button size="sm" variant="outline-secondary" disabled className="mt-2 fw-bold w-100">🔒 150 EXP</Button>
              )}
            </div>
            <div className={`p-3 border rounded-3 ${petData.total_exp >= 200 ? 'bg-light border-primary' : 'bg-light text-muted'}`} style={{ width: '120px', opacity: petData.total_exp >= 200 ? 1 : 0.7 }}>
              <div style={{ fontSize: '3rem' }}>🕶️</div>
              <div className="fw-bold mt-2 small">Kính râm</div>
              {petData.total_exp >= 200 ? (
                <Button size="sm" variant="primary" className="mt-2 fw-bold w-100">Trang bị</Button>
              ) : (
                <Button size="sm" variant="outline-secondary" disabled className="mt-2 fw-bold w-100">🔒 200 EXP</Button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* 3. Donation Modal */}
      <Modal show={showDonation} onHide={() => setShowDonation(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-black text-danger">💖 {t('pet_profile.charity_donation')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          <p className="text-muted fw-bold mb-4">{t('pet_profile.charity_desc')}</p>
          <div className="d-flex flex-column gap-3">
            <Card className={`border-0 bg-light ${petData.total_exp >= 500 ? '' : 'opacity-75'}`}>
              <Card.Body className="d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-1">🌳</div>
                  <div className="text-start">
                    <div className="fw-bold">{t('pet_profile.donate_tree')}</div>
                    <div className="text-muted small">{t('pet_profile.tree_project')}</div>
                  </div>
                </div>
                {petData.total_exp >= 500 ? (
                  <Button variant="danger" className="fw-bold rounded-pill px-3">❤️ Quyên góp</Button>
                ) : (
                  <Button variant="outline-secondary" disabled className="fw-bold rounded-pill px-3">🔒 Cần 500 EXP</Button>
                )}
              </Card.Body>
            </Card>
            <Card className={`border-0 bg-light ${petData.total_exp >= 1000 ? '' : 'opacity-75'}`}>
              <Card.Body className="d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-1">🍱</div>
                  <div className="text-start">
                    <div className="fw-bold">{t('pet_profile.donate_meal')}</div>
                    <div className="text-muted small">{t('pet_profile.meal_project')}</div>
                  </div>
                </div>
                {petData.total_exp >= 1000 ? (
                  <Button variant="danger" className="fw-bold rounded-pill px-3">❤️ Quyên góp</Button>
                ) : (
                  <Button variant="outline-secondary" disabled className="fw-bold rounded-pill px-3">🔒 Cần 1000 EXP</Button>
                )}
              </Card.Body>
            </Card>
          </div>
        </Modal.Body>
      </Modal>

      {/* 4. AI Chat Modal */}
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
