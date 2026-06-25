import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Badge, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import petChatbot from '../assets/pet_chatbot.png';

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
  const [petData, setPetData] = useState({
    pet_name: 'P.E.T',
    appearance_type: 'Cân đối',
    emotional_state: 'Bình thường',
    total_exp: 0,
    level: 1,
    last_updated: new Date().toISOString()
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    // Tải dữ liệu exp và streak từ pet-daily để tính toán trạng thái
    const dailySaved = localStorage.getItem('pet-daily');
    let exp = 0;
    let streak = 0;
    let lastCheckin = null;
    
    if (dailySaved) {
      const dailyParsed = JSON.parse(dailySaved);
      exp = dailyParsed.totalPoints || 0;
      streak = dailyParsed.checkinStreak || 0;
      lastCheckin = dailyParsed.lastCheckinDate;
    }

    // Tính toán Level
    let currentLevelObj = PET_LEVELS[0];
    for (const lvl of PET_LEVELS) {
      if (exp >= lvl.minPoints) currentLevelObj = lvl;
    }

    // Logic Cảm xúc & Thể trạng dựa trên chuỗi tập luyện (Streak)
    let emotional_state = 'Bình thường';
    let appearance_type = 'Cân đối';

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Nếu bỏ tập (không checkin hôm nay hoặc hôm qua thì streak sẽ về 0 hoặc đang 0)
    if (streak === 0 && lastCheckin !== todayStr) {
      emotional_state = 'Buồn rầu';
      appearance_type = 'Yếu ớt';
    } else if (streak >= 3) {
      emotional_state = 'Rất vui';
      appearance_type = 'Mạnh mẽ';
    } else if (streak >= 1) {
      emotional_state = 'Bình thường';
      appearance_type = 'Cân đối';
    }

    // Tải tên pet từ pet-data nếu có
    const petSaved = localStorage.getItem('pet-data');
    let pet_name = 'Trứng Vô Danh';
    if (exp >= 10) pet_name = 'P.E.T Của Tôi'; // Default sau khi nở
    
    if (petSaved) {
      const parsedPet = JSON.parse(petSaved);
      if (parsedPet.pet_name) pet_name = parsedPet.pet_name;
    }

    const newData = {
      pet_id: petSaved ? JSON.parse(petSaved).pet_id || 1 : 1,
      user_id: petSaved ? JSON.parse(petSaved).user_id || 1 : 1,
      pet_name,
      appearance_type,
      emotional_state,
      total_exp: exp,
      level: currentLevelObj.level,
      last_updated: new Date().toISOString()
    };

    setPetData(newData);
    localStorage.setItem('pet-data', JSON.stringify(newData));

  }, []);

  const handleNameSave = () => {
    if (tempName.trim()) {
      const newData = { ...petData, pet_name: tempName.trim(), last_updated: new Date().toISOString() };
      setPetData(newData);
      localStorage.setItem('pet-data', JSON.stringify(newData));
    }
    setIsEditingName(false);
  };

  const currentLevelObj = PET_LEVELS.find(l => l.level === petData.level) || PET_LEVELS[0];
  const nextLevelObj = PET_LEVELS.find(l => l.minPoints > petData.total_exp);
  const progressToNext = nextLevelObj 
    ? ((petData.total_exp - currentLevelObj.minPoints) / (nextLevelObj.minPoints - currentLevelObj.minPoints)) * 100 
    : 100;

  const emotionData = {
    label: petData.emotional_state === 'Rất vui' ? 'Rất vui 😁' : petData.emotional_state === 'Buồn rầu' ? 'Buồn rầu 😢' : 'Bình thường 😐'
  };
  const appearanceData = {
    label: petData.appearance_type,
    color: petData.appearance_type === 'Yếu ớt' ? 'text-danger' : 'text-success'
  };

  return (
    <Container className="py-5 bg-surface-main" fluid style={{ minHeight: '100vh' }}>
      <Container style={{ maxWidth: '700px' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn text-primary-dynamic mb-4 p-0 d-flex align-items-center gap-2"
          style={{ background: 'none', border: 'none' }}
        >
          <span style={{ fontSize: '1.2rem' }}>←</span> Quay lại
        </button>

        <h2 className="fw-bold text-primary-dynamic text-center mb-4" style={{ letterSpacing: '1px' }}>HỒ SƠ THÚ CƯNG</h2>

        <Card className="bg-surface-card-gradient border-surface p-4 p-md-5 overflow-hidden position-relative" style={{ borderRadius: '32px' }}>
          
          <div className="text-center mb-5 position-relative">
            {petData.level >= 4 && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.1) 0%, transparent 60%)', filter: 'blur(20px)', zIndex: 0 }}></div>
            )}
            
            <div style={{
              width: '180px', height: '180px', background: '#0a0a0c', borderRadius: '50%',
              margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative', zIndex: 1
            }}>
              {petData.level === 1 ? (
                <span style={{ fontSize: '6rem', animation: 'petBounce 3s infinite ease-in-out' }}>🥚</span>
              ) : (
                <img src={petChatbot} alt="Pet" style={{ width: '120px', height: '120px', objectFit: 'contain', animation: 'petBounce 3s infinite ease-in-out' }} />
              )}
            </div>

            <div className="mt-4">
              {isEditingName ? (
                <Form.Control
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                  autoFocus
                  className="bg-transparent text-primary-dynamic text-center border-0 fs-2 fw-bold mx-auto p-0"
                  style={{ maxWidth: '250px', boxShadow: 'none' }}
                />
              ) : (
                <div 
                  className="fs-2 fw-bold text-primary-dynamic d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsEditingName(true)}
                  title="Click để đổi tên"
                >
                  {petData.pet_name} 
                  <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)' }}>✏️</span>
                </div>
              )}
              <div style={{ color: 'var(--brand-neon)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                Level {petData.level} - {currentLevelObj.name}
              </div>
            </div>
          </div>

          <div className="px-md-3">
            <Row className="g-3 mb-5">
              <Col xs={6}>
                <div className="p-3 rounded-4 border-surface text-center" style={{ background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.03))', border: '1px solid' }}>
                  <div className="text-muted small fw-bold mb-1">CẢM XÚC</div>
                  <div className="fs-5 fw-bold text-primary-dynamic">{emotionData.label}</div>
                </div>
              </Col>
              <Col xs={6}>
                <div className="p-3 rounded-4 border-surface text-center" style={{ background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.03))', border: '1px solid' }}>
                  <div className="text-muted small fw-bold mb-1">THỂ TRẠNG</div>
                  <div className={`fs-5 fw-bold ${appearanceData.color}`}>{appearanceData.label}</div>
                </div>
              </Col>
            </Row>

            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold text-primary-dynamic">Tổng EXP: {petData.total_exp}</span>
                {nextLevelObj && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Tiếp theo: {nextLevelObj.minPoints}</span>}
              </div>
              
              {nextLevelObj ? (
                <div style={{ height: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{
                    width: `${progressToNext}%`, height: '100%',
                    background: 'linear-gradient(90deg, var(--brand-neon), #00ff88)',
                    borderRadius: '6px', transition: 'width 1s ease-in-out',
                    boxShadow: '0 0 10px rgba(var(--brand-neon-rgb),0.5)'
                  }}></div>
                </div>
              ) : (
                <div className="text-center mt-3">
                  <Badge bg="warning" className="text-dark px-4 py-2 rounded-pill fw-bold w-100">MAX LEVEL</Badge>
                </div>
              )}
            </div>
          </div>

        </Card>
      </Container>
      
      <style>{`
        @keyframes petBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </Container>
  );
}
