import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import heroBanner from '../assets/hero_banner.png';
import petChatbot from '../assets/pet_chatbot.png';

export default function Home() {
  const navigate = useNavigate();
  // Mock data 8 nhóm cơ theo thiết kế Figma
  const muscleGroups = [
    { id: 1, name: "NGỰC", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQeuM4fjr9iAYaik1DiYyRfSPKPpM9QEDBswmFT7YHRBdxnc3AswTD2qm&s=10" },
    { id: 2, name: "LƯNG", img: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=600" },
    { id: 3, name: "VAI", img: "https://n7media.coolmate.me/image/June2025/cac-bai-tap-gym-co-vai-cho-nam-gymer-358_225.jpg" },
    { id: 4, name: "TAY", img: "https://file.hstatic.net/200001007715/article/bai-tap-tang-co-tay_thumb_848a93e9f8404e63888b26e7e52cc412.webp" },
    { id: 5, name: "BỤNG / CORE", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6NGm438DYyvcuFwavjUKe1PM24x3JrdS2ddXbcQ8h0g&s=10" },
    { id: 6, name: "CHÂN", img: "https://thanhnien.mediacdn.vn/Uploaded/ngocquy/2022_03_14/1-tap-dui-shutterstock-7679.jpg" },
    { id: 7, name: "MÔNG", img: "https://thammy.vn/wp-content/uploads/2019/02/assman4.jpg" },
    { id: 8, name: "SKILLS", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4KdsSVoUyajhhke9Dr6XNT0_7h9J12fZcNV8seyxT_NqptCkbAmrKF_M&s=10" },
  ];

  return (
    <>
      {/* FULL WIDTH HERO BANNER TỰ NHIÊN HƠN */}
      <div
        className="w-100 position-relative d-flex align-items-center justify-content-center"
        style={{
          height: '500px',
          backgroundImage: `url(${heroBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: '-1px' /* Tránh vệt trắng nhỏ nếu có */
        }}
      >
        {/* Lớp phủ gradient mượt mà: Trên cùng hơi tối, dưới cùng tiệp hoàn toàn vào màu nền web (#121212) */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(18,18,18,0.3) 0%, rgba(18,18,18,0.7) 60%, rgba(18,18,18,1) 100%)'
        }}></div>

        <Container className="position-relative" style={{ zIndex: 2, top: '-20px' }}>
          <Row className="align-items-center">
            {/* Cột trái: Text & CTA */}
            <Col lg={7} className="text-start">
              <div
                className="d-inline-block px-3 py-1 mb-3 rounded-pill"
                style={{ backgroundColor: 'rgba(204, 255, 0, 0.1)', border: '1px solid rgba(204, 255, 0, 0.3)', color: '#ccff00', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' }}
              >
                HUẤN LUYỆN VIÊN AI THẾ HỆ MỚI
              </div>
              <h1 className="display-4 fw-bold text-white mb-3" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)', lineHeight: '1.2' }}>
                Khai Phá Giới Hạn <br />
                <span className="text-neon">Bản Thân Bạn</span>
              </h1>
              <p className="text-light mb-4" style={{ fontSize: '1.1rem', opacity: 0.85, maxWidth: '500px', lineHeight: '1.6' }}>
                P.E.T tự động thiết kế lộ trình tập luyện và dinh dưỡng chuẩn xác dựa trên chỉ số sinh học và mục tiêu của riêng bạn.
              </p>
              <div className="d-flex gap-3">
                <button
                  className="btn fw-bold px-4 py-2 rounded-pill"
                  style={{
                    backgroundColor: '#ccff00',
                    color: '#000000',
                    border: 'none',
                    boxShadow: '0 0 20px rgba(204,255,0,0.5)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 0 30px rgba(204,255,0,0.8)'; }}
                  onMouseOut={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 20px rgba(204,255,0,0.5)'; }}
                >
                  BẮT ĐẦU NGAY
                </button>
                <button
                  className="btn text-white fw-bold px-4 py-2 rounded-pill"
                  style={{ transition: 'all 0.2s ease', backdropFilter: 'blur(5px)', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.3)' }}
                  onMouseOver={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; e.target.style.borderColor = 'rgba(255,255,255,0.8)'; }}
                  onMouseOut={e => { e.target.style.transform = 'scale(1)'; e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                >
                  TÌM HIỂU THÊM
                </button>
              </div>
            </Col>

            {/* Cột phải: Floating Badges tạo chiều sâu */}
            <Col lg={5} className="d-none d-lg-block position-relative" style={{ height: '300px' }}>
              <div
                className="position-absolute"
                style={{ top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '16px', transform: 'rotate(5deg)', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', transition: 'transform 0.3s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'rotate(5deg) scale(1)'}
              >
                <div className="text-neon fw-bold fs-3 mb-0">100%</div>
                <div className="text-white small fw-bold" style={{ opacity: 0.8, letterSpacing: '1px' }}>CÁ NHÂN HÓA</div>
              </div>

              <div
                className="position-absolute"
                style={{ bottom: '40px', left: '10px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(204,255,0,0.3)', padding: '15px 25px', borderRadius: '16px', transform: 'rotate(-3deg)', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', transition: 'transform 0.3s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'rotate(-3deg) scale(1)'}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-neon rounded-circle d-flex align-items-center justify-content-center text-dark fw-bold" style={{ width: '45px', height: '45px' }}>
                    AI
                  </div>
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: '1.1rem' }}>Theo Dõi Real-time</div>
                    <div className="text-neon small fw-bold opacity-75">Hệ Thống Phân Tích</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">

        {/* PHẦN 1: LỘ TRÌNH CÁ NHÂN (Hero Section) */}
        <div className="mb-5">
          <h2 className="fw-bold mb-1">LỘ TRÌNH CÁ NHÂN</h2>
          <p className="text-muted">TẠO TỰ ĐỘNG DỰA TRÊN CHỈ SỐ CƠ THỂ CỦA BẠN</p>

          <Card className="hero-card p-4 mt-4 border-0">
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
                    <div className="fs-5 text-white">175 <span className="fs-6 text-muted">cm</span></div>
                  </Col>
                  <Col xs={4}>
                    <div className="mb-1 text-uppercase" style={{ letterSpacing: '1px' }}>Cân nặng</div>
                    <div className="fs-5 text-white">72 <span className="fs-6 text-muted">kg</span></div>
                  </Col>
                  <Col xs={4}>
                    <div className="mb-1 text-uppercase" style={{ letterSpacing: '1px' }}>Mục tiêu</div>
                    <div className="text-neon fs-5">75 <span className="fs-6">kg</span></div>
                  </Col>
                </Row>
              </Col>

              {/* Card Tiến độ bên phải */}
              <Col lg={4} className="mt-4 mt-lg-0">
                <Card className="bg-body-secondary border-0 p-3 h-100" style={{ borderRadius: '12px' }}>
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
                    <h4 className="fw-bold">SỨC MẠNH TOÀN THÂN</h4>
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
          <h3 className="fw-bold mb-4">DANH SÁCH BÀI TẬP</h3>
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
        <div className="mt-5 mb-5 p-4 p-md-5 rounded-5 position-relative overflow-hidden" 
            style={{ 
                background: 'linear-gradient(145deg, #111 0%, #000 100%)',
                border: '1px solid rgba(204,255,0,0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)'
            }}>
            {/* Background glow effects */}
            <div className="position-absolute rounded-circle" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 70%)', top: '-100px', right: '-100px', filter: 'blur(40px)' }}></div>
            <div className="position-absolute rounded-circle" style={{ width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', bottom: '-50px', left: '-50px', filter: 'blur(30px)' }}></div>

            <Row className="align-items-center position-relative z-1">
                <Col md={6} className="text-md-start text-center mb-5 mb-md-0">
                    <div className="d-inline-flex align-items-center mb-3 px-3 py-2 rounded-pill" style={{ background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)' }}>
                        <span className="fs-5 me-2">🔥</span>
                        <span className="text-neon fw-bold small" style={{ letterSpacing: '1px' }}>KẾT QUẢ TẬP LUYỆN</span>
                    </div>
                    <h2 className="display-5 fw-bold text-white mb-3" style={{ lineHeight: '1.2' }}>Năng Lượng <br/><span className="text-neon">Đã Đốt Cháy</span></h2>
                    <p className="text-secondary mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '400px' }}>
                        Mỗi khi hoàn thành 1 bài tập, lượng calo tương ứng sẽ tự động cộng dồn vào hệ thống. Hãy lấp đầy vòng tròn mục tiêu hôm nay!
                    </p>
                    <div className="d-flex gap-4 mt-2 justify-content-center justify-content-md-start">
                        <div>
                            <div className="text-muted small fw-bold mb-1">MỤC TIÊU NGÀY</div>
                            <div className="fs-4 text-white fw-bold">500 <span className="fs-6 text-muted">KCAL</span></div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                        <div>
                            <div className="text-muted small fw-bold mb-1">HOÀN THÀNH</div>
                            <div className="fs-4 text-neon fw-bold">64<span className="fs-6 text-muted">%</span></div>
                        </div>
                    </div>
                </Col>

                <Col md={6} className="d-flex justify-content-center">
                    <div className="position-relative d-inline-block mx-auto" style={{ width: '280px', height: '280px' }}>
                        <svg viewBox="0 0 100 100" className="w-100 h-100" style={{ filter: 'drop-shadow(0 0 15px rgba(204,255,0,0.4))' }}>
                            <defs>
                                <linearGradient id="kcalGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ccff00" />
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
                            <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(204,255,0,0.2)" strokeWidth="1.5" strokeDasharray="3 4" />
                            {/* Progress */}
                            <circle
                                cx="50" cy="50" r="42" fill="none" stroke="url(#kcalGradientPremium)" strokeWidth="8" strokeLinecap="round"
                                strokeDasharray="264"
                                strokeDashoffset="95"
                                style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                        </svg>
                        
                        {/* Glowing center pulse */}
                        <div className="position-absolute top-50 start-50 translate-middle rounded-circle" style={{ width: '130px', height: '130px', background: 'radial-gradient(circle, rgba(204,255,0,0.15) 0%, transparent 60%)', animation: 'pulse 2.5s infinite' }}></div>

                        <div className="position-absolute top-50 start-50 translate-middle text-center w-100" style={{ zIndex: 2 }}>
                            <div className="fw-bold text-white mb-0" style={{ fontSize: '3.5rem', lineHeight: '1', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>320</div>
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

      {/* PET CHATBOT FLOAT */}
      <div
        className="position-fixed"
        style={{
          bottom: '30px',
          right: '30px',
          zIndex: 1050,
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <img
          src={petChatbot}
          alt="P.E.T Chatbot"
          width="80"
          height="80"
          style={{
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(204, 255, 0, 0.4)',
            border: '2px solid var(--neon-green)',
            objectFit: 'cover'
          }}
        />
        <div
          className="bg-neon px-2 py-1 fw-bold rounded-pill text-center position-absolute"
          style={{ top: '-10px', right: '-10px', fontSize: '0.75rem', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
        >
          Trợ lý P.E.T
        </div>
      </div>
    </>
  );
}