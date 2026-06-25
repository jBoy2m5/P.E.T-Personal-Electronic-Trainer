import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import heroBanner from '../assets/hero_banner.png';
import petChatbot from '../assets/pet_chatbot.png';

export default function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    user_id: 1,
    email: 'user@example.com',
    height: 175,
    weight: 72,
    bmi: 23.5,
    fitness_goal: 'Tăng cơ nạc'
  });

  const [burnedCalories, setBurnedCalories] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('user-data');
    if (saved) {
      setUserData(JSON.parse(saved));
    } else {
      localStorage.setItem('user-data', JSON.stringify(userData));
    }

    const loadCalories = () => {
      const sessionsStr = localStorage.getItem('workout-sessions');
      if (sessionsStr) {
        const sessions = JSON.parse(sessionsStr);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayBurn = sessions
          .filter(s => s.start_time.startsWith(todayStr))
          .reduce((sum, s) => sum + (s.total_calories_burned || 0), 0);
        setBurnedCalories(Math.round(todayBurn));
      }
    };

    loadCalories();
    window.addEventListener('storage', loadCalories);
    return () => window.removeEventListener('storage', loadCalories);
  }, []);

  // Mock data 8 nhóm cơ theo thiết kế Figma
  const muscleGroups = [
    { id: 1, name: "NGỰC", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2KdiiCQ-3r8D3eOw0taiTQ7d4UwJHpXinF71rGL25jb01RZC_GzcB5ayg&s=10" },
    { id: 2, name: "LƯNG", img: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=600" },
    { id: 3, name: "VAI", img: "https://n7media.coolmate.me/image/June2025/cac-bai-tap-gym-co-vai-cho-nam-gymer-358_225.jpg" },
    { id: 4, name: "TAY", img: "https://file.hstatic.net/200001007715/article/bai-tap-tang-co-tay_thumb_848a93e9f8404e63888b26e7e52cc412.webp" },
    { id: 5, name: "BỤNG / CORE", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6NGm438DYyvcuFwavjUKe1PM24x3JrdS2ddXbcQ8h0g&s=10" },
    { id: 6, name: "CHÂN", img: "https://thanhnien.mediacdn.vn/Uploaded/ngocquy/2022_03_14/1-tap-dui-shutterstock-7679.jpg" },
    { id: 7, name: "MÔNG", img: "https://thammy.vn/wp-content/uploads/2019/02/assman4.jpg" },
    { id: 8, name: "SKILLS", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4KdsSVoUyajhhke9Dr6XNT0_7h9J12fZcNV8seyxT_NqptCkbAmrKF_M&s=10" },
  ];

  return (
    <div className="bg-surface-main min-vh-100">
      {/* FULL WIDTH HERO BANNER - NETLIFY STYLE */}
      <div
        className="w-100 position-relative d-flex align-items-center bg-hero-banner"
        style={{
          minHeight: '600px',
          paddingTop: '60px',
          paddingBottom: '60px',
          overflow: 'hidden'
        }}
      >
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="align-items-center">
            {/* Cột trái: Text & CTA */}
            <Col lg={6} className="text-start">
              <h2 className="fw-bold text-primary-dynamic mb-3">Hôm nay tập gì?</h2>
              <h1 className="fw-bold text-primary-dynamic mb-4" style={{ fontSize: '4.5rem', lineHeight: '1.1', letterSpacing: '-1px' }}>
                Khai Phá Giới Hạn <br />
                <span className="text-neon">Bản Thân Bạn</span>
              </h1>
              <p className="text-primary-dynamic mb-5" style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '500px', lineHeight: '1.6' }}>
                P.E.T tự động thiết kế lộ trình tập luyện và dinh dưỡng chuẩn xác dựa trên chỉ số sinh học và mục tiêu của riêng bạn. Một nền tảng duy nhất để xây dựng vóc dáng.
              </p>

              <div className="d-flex gap-3 mb-4">
                <button
                  className="btn fw-bold px-4 py-3 rounded-pill"
                  style={{
                    backgroundColor: 'var(--brand-neon)',
                    color: '#000',
                    border: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => { e.target.style.backgroundColor = '#b3e600'; e.target.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.target.style.backgroundColor = 'var(--brand-neon)'; e.target.style.transform = 'translateY(0)'; }}
                >
                  Bắt đầu ngay
                </button>
                <button
                  className="btn text-primary-dynamic fw-bold px-4 py-3 rounded-pill"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => { e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.target.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.target.style.transform = 'translateY(0)'; }}
                >
                  Tìm hiểu thêm
                </button>
              </div>


            </Col>

            {/* Cột phải: Hình ảnh minh họa */}
            <Col lg={6} className="d-none d-lg-flex justify-content-end position-relative">
              <div style={{ position: 'relative', width: '100%', height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img 
                  src={heroBanner} 
                  alt="Hero illustration" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '500px', 
                    objectFit: 'contain', 
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))', 
                    borderRadius: '24px', 
                    zIndex: 2 
                  }} 
                />
              </div>
            </Col>
          </Row>
        </Container>

        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
        `}</style>
      </div>

      <Container className="py-5">

        {/* PHẦN 1: LỘ TRÌNH CÁ NHÂN (Hero Section) */}
        <div className="mb-5">
          <h2 className="fw-bold mb-1 text-primary-dynamic">LỘ TRÌNH CÁ NHÂN</h2>
          <p className="text-muted">TẠO TỰ ĐỘNG DỰA TRÊN CHỈ SỐ CƠ THỂ CỦA BẠN</p>

          <Card className="hero-card p-4 mt-4 border-0 bg-surface-card text-primary-dynamic">
            <Row>
              <Col lg={8}>
                <h1 className="fw-bold display-5 mb-3">Giáo án <span className="text-neon">TĂNG CƠ TỐI ƯU</span></h1>
                <p className="text-muted mb-4" style={{ maxWidth: '600px' }}>
                  Dựa trên mục tiêu tăng 3kg cơ nạc trong 2 tháng của bạn. Hôm nay chúng ta sẽ tập trung vào nhóm cơ lớn với cường độ cao (Hypertrophy).
                </p>

                {/* Thông số user */}
                <Row className="text-muted small fw-bold">
                  <Col xs={4}>
                    <div className="mb-1 text-uppercase" style={{ letterSpacing: '1px' }}>Chiều cao</div>
                    <div className="fs-5 text-primary-dynamic">{userData.height} <span className="fs-6 text-muted">cm</span></div>
                  </Col>
                  <Col xs={4}>
                    <div className="mb-1 text-uppercase" style={{ letterSpacing: '1px' }}>Cân nặng</div>
                    <div className="fs-5 text-primary-dynamic">{userData.weight} <span className="fs-6 text-muted">kg</span></div>
                  </Col>
                  <Col xs={4}>
                    <div className="mb-1 text-uppercase" style={{ letterSpacing: '1px' }}>Mục tiêu</div>
                    <div className="text-neon fs-5" style={{ fontSize: '1rem' }}>{userData.fitness_goal}</div>
                  </Col>
                </Row>
              </Col>

              {/* Card Tiến độ bên phải */}
              <Col lg={4} className="mt-4 mt-lg-0">
                <Card className="bg-surface-main border-0 p-3 h-100" style={{ borderRadius: '12px' }}>
                  <div className="d-flex justify-content-between align-items-end mb-2">
                    <span className="text-muted fw-bold small">TIẾN ĐỘ KHÓA HỌC</span>
                    <span className="text-neon fw-bold fs-4">46%</span>
                  </div>
                  <div className="progress-custom mb-3">
                    <div className="progress-bar-neon" style={{ width: '46%' }}></div>
                  </div>
                  <div className="d-flex justify-content-between text-muted small fw-bold mb-4">
                    <span>NGÀY 1</span>
                    <span >NGÀY 14</span>
                    <span>NGÀY 30</span>
                  </div>

                  <div className="mt-auto">
                    <div className="text-neon small fw-bold mb-1">BÀI TẬP HÔM NAY</div>
                    <h4 className="fw-bold text-primary-dynamic">SỨC MẠNH TOÀN THÂN</h4>
                    <div className="text-muted small fw-bold" style={{ letterSpacing: '0.5px' }}>
                      <span className="me-3">5 Bài tập</span>
                      <span>450 kcal</span>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>



        {/* PHẦN 2: LƯỚI CÁC NHÓM CƠ */}
        <div className="mt-5">
          <h3 className="fw-bold mb-4 text-primary-dynamic">DANH SÁCH BÀI TẬP</h3>
          <Row className="g-4">
            {muscleGroups.map((muscle) => (
              <Col md={6} lg={3} key={muscle.id}>
                <div className="muscle-card" onClick={() => navigate(`/exercises/${muscle.id}`)} style={{ cursor: 'pointer' }}>
                  <img src={muscle.img} alt={muscle.name} />
                  <div className="muscle-title">{muscle.name}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* THỐNG KÊ CALO TRONG NGÀY CAO CẤP */}
        <div className="mt-5 mb-5 p-4 p-md-5 rounded-5 position-relative overflow-hidden bg-surface-card"
          style={{
            border: '1px solid rgba(var(--brand-neon-rgb),0.2)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
          }}>
          {/* Background glow effects */}
          <div className="position-absolute rounded-circle" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.15) 0%, transparent 70%)', top: '-100px', right: '-100px', filter: 'blur(40px)' }}></div>
          <div className="position-absolute rounded-circle" style={{ width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', bottom: '-50px', left: '-50px', filter: 'blur(30px)' }}></div>

          <Row className="align-items-center position-relative z-1">
            <Col md={6} className="d-flex flex-column justify-content-center">
              <Badge bg="dark" className="text-neon border border-secondary mb-3 align-self-start px-3 py-2 rounded-pill">
                🔥 THEO DÕI NĂNG LƯỢNG (KCAL)
              </Badge>
              <h3 className="fw-bold text-primary-dynamic mb-2" style={{ fontSize: '2rem' }}>Bạn Đã Đốt Cháy Bao Nhiêu?</h3>
              <p className="text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                Hệ thống AI tự động phân tích mức tiêu hao calo dựa trên độ chuẩn xác và cường độ bài tập. Mọi chỉ số đều được tính toán gắt gao.
              </p>
            </Col>

            <Col md={6} className="d-flex justify-content-center">
              <div className="position-relative d-inline-block mx-auto" style={{ width: '280px', height: '280px' }}>
                <svg viewBox="0 0 100 100" className="w-100 h-100" style={{ filter: 'drop-shadow(0 0 15px rgba(var(--brand-neon-rgb),0.4))' }}>
                  <defs>
                    <linearGradient id="kcalGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--brand-neon)" />
                      <stop offset="50%" stopColor="#99ff00" />
                      <stop offset="100%" stopColor="#00ff88" />
                    </linearGradient>
                    <linearGradient id="kcalTrack" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#kcalTrack)" strokeWidth="8" />
                  {/* Inner detail dashed line */}
                  <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(var(--brand-neon-rgb),0.2)" strokeWidth="1.5" strokeDasharray="3 4" />
                  {/* Progress */}
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="url(#kcalGradientPremium)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={0}
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>

                {/* Glowing center pulse */}
                <div className="position-absolute top-50 start-50 translate-middle rounded-circle" style={{ width: '130px', height: '130px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.15) 0%, transparent 60%)', animation: 'pulse 2.5s infinite' }}></div>

                <div className="position-absolute top-50 start-50 translate-middle text-center w-100" style={{ zIndex: 2 }}>
                  <div className="fw-bold text-primary-dynamic mb-0" style={{ fontSize: '3.5rem', lineHeight: '1', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{burnedCalories}</div>
                  <div className="text-neon fw-bold mt-1" style={{ fontSize: '0.9rem', letterSpacing: '2px' }}>KCAL ĐỐT</div>
                </div>
              </div>
            </Col>
          </Row>
          <style>{`
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
                }
            `}</style>
        </div>
      </Container>

    </div>
  );
}