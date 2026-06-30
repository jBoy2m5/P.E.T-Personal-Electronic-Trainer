import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Tilt from 'react-parallax-tilt';
import heroBanner from '../assets/hero_banner.png';
import petChatbot from '../assets/pet_chatbot.png';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-bs-theme') !== 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
    return () => observer.disconnect();
  }, []);

  const [showInfoModal, setShowInfoModal] = useState(false);

  const [burnedCalories, setBurnedCalories] = useState(0);
  const [displayCalories, setDisplayCalories] = useState(0);

  useEffect(() => {
    // 1. Load User Data
    const saved = localStorage.getItem('user-data');
    if (saved) {
      setUserData(JSON.parse(saved));
    }

    // 3. Load Calories
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

  // Animated counter for calories
  useEffect(() => {
    if (burnedCalories === 0) return;
    let start = 0;
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCalories(Math.round(eased * burnedCalories));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [burnedCalories]);

  // Mock data 8 nhóm cơ theo thiết kế Figma
  const muscleGroups = [
    { id: 1, name: t('home.muscles.chest'), img: "https://cdn.thehinh.com/2016/06/cac-bai-tap-tang-kich-thuoc-co-nguc-cho-nam-lan-nu.jpg" },
    { id: 2, name: t('home.muscles.back'), img: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=600" },
    { id: 3, name: t('home.muscles.shoulder'), img: "https://n7media.coolmate.me/image/June2025/cac-bai-tap-gym-co-vai-cho-nam-gymer-358_225.jpg" },
    { id: 4, name: t('home.muscles.arm'), img: "https://file.hstatic.net/200001007715/article/bai-tap-tang-co-tay_thumb_848a93e9f8404e63888b26e7e52cc412.webp" },
    { id: 5, name: t('home.muscles.core'), img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6NGm438DYyvcuFwavjUKe1PM24x3JrdS2ddXbcQ8h0g&s=10" },
    { id: 6, name: t('home.muscles.leg'), img: "https://thanhnien.mediacdn.vn/Uploaded/ngocquy/2022_03_14/1-tap-dui-shutterstock-7679.jpg" },
    { id: 7, name: t('home.muscles.glute'), img: "https://www.thethaodaiviet.vn/upload/top-8-cac-bai-tap-mong-to-danh-cho-nam-gioi-5.jpg?v=1.0.0" },
    { id: 8, name: t('home.muscles.skills'), img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4KdsSVoUyajhhke9Dr6XNT0_7h9J12fZcNV8seyxT_NqptCkbAmrKF_M&s=10" },
  ];

  return (
    <div className="bg-surface-main min-vh-100">
      {/* FULL WIDTH HERO BANNER - PREMIUM */}
      <div
        className="w-100 position-relative d-flex align-items-center bg-hero-banner"
        style={{
          minHeight: '620px',
          paddingTop: '60px',
          paddingBottom: '60px',
          overflow: 'hidden'
        }}
      >
        {/* Animated gradient orbs */}
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.08) 0%, transparent 70%)', top: '-150px', right: '10%', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)', bottom: '-100px', left: '5%', filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite reverse', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', top: '30%', left: '30%', filter: 'blur(40px)', animation: 'float 6s ease-in-out infinite 2s', pointerEvents: 'none' }}></div>
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="align-items-center">
            {/* Cột trái: Text & CTA */}
            <Col lg={6} className="text-start">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <h2 className="fw-bold text-primary-dynamic mb-3">{t('home.hero_subtitle')}</h2>
                <h1 className="fw-bold text-primary-dynamic mb-4" style={{ fontSize: '4.5rem', lineHeight: '1.1', letterSpacing: '-2px' }}>
                  {t('home.hero_title_1')} <br />
                  <span className="text-gradient" style={{ fontWeight: '900' }}>{t('home.hero_title_2')}</span>
                </h1>
                <p className="text-primary-dynamic mb-5" style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '500px', lineHeight: '1.6' }}>
                  {t('home.hero_desc')}
                </p>

                <div className="d-flex gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/roadmap')}
                    className="btn fw-bold px-5 py-3 rounded-pill"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-neon), #88ff44)',
                      color: '#000',
                      border: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 25px rgba(var(--brand-neon-rgb),0.4)',
                      transition: 'all 0.3s ease',
                      letterSpacing: '0.5px'
                    }}
                    onMouseOver={e => { e.target.style.boxShadow = '0 8px 35px rgba(var(--brand-neon-rgb),0.6)'; }}
                    onMouseOut={e => { e.target.style.boxShadow = '0 4px 25px rgba(var(--brand-neon-rgb),0.4)'; }}
                  >
                    {t('home.start_now')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowInfoModal(true)}
                    className={`btn fw-bold px-4 py-3 rounded-pill ${isDark ? 'text-white' : 'text-dark'}`}
                    style={{
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      letterSpacing: '0.5px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(0, 0, 0, 0.45)'
                    }}
                    onMouseOver={e => { e.target.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'; }}
                    onMouseOut={e => { e.target.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'; }}
                  >
                    {t('home.learn_more')}
                  </motion.button>
                </div>
              </motion.div>
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



        {/* PHẦN 2: LƯỚI CÁC NHÓM CƠ */}
        <div className="mt-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="d-flex align-items-center gap-3 mb-4"
          >
            <div style={{ width: '4px', height: '32px', borderRadius: '2px', background: 'linear-gradient(180deg, var(--brand-neon), transparent)' }}></div>
            <h3 className="fw-bold mb-0 text-primary-dynamic" style={{ letterSpacing: '-0.5px' }}>{t('home.exercise_list')}</h3>
          </motion.div>
          <Row className="g-4">
            {muscleGroups.map((muscle, index) => (
              <Col md={6} lg={3} key={muscle.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05} transitionSpeed={2500}>
                    <div className="muscle-card glass-panel" onClick={() => navigate(`/exercises/${muscle.id}`)} style={{ cursor: 'pointer', borderRadius: '16px' }}>
                      <img src={muscle.img} alt={muscle.name} style={{ borderRadius: '16px' }} />
                      <div className="muscle-title">{muscle.name}</div>
                    </div>
                  </Tilt>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>

        {/* THỐNG KÊ CALO TRONG NGÀY CAO CẤP */}
        <div className="mt-5 mb-5 p-4 p-md-5 position-relative overflow-hidden"
          style={{
            borderRadius: '28px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,26,0.95) 0%, rgba(10,10,14,0.98) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8faf5 100%)',
            border: `1px solid ${isDark ? 'rgba(var(--brand-neon-rgb),0.15)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: isDark
              ? '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 10px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
          }}>
          {/* Background glow effects */}
          <div className="position-absolute" style={{ width: '400px', height: '400px', background: `radial-gradient(circle, rgba(var(--brand-neon-rgb),${isDark ? '0.12' : '0.08'}) 0%, transparent 65%)`, top: '-150px', right: '-100px', filter: 'blur(60px)' }}></div>
          <div className="position-absolute" style={{ width: '250px', height: '250px', background: `radial-gradient(circle, ${isDark ? 'rgba(0,229,255,0.08)' : 'rgba(25,135,84,0.06)'} 0%, transparent 65%)`, bottom: '-80px', left: '-60px', filter: 'blur(50px)' }}></div>
          <div className="position-absolute" style={{ width: '150px', height: '150px', background: `radial-gradient(circle, rgba(var(--brand-neon-rgb),${isDark ? '0.1' : '0.06'}) 0%, transparent 70%)`, top: '50%', left: '48%', transform: 'translate(-50%,-50%)', filter: 'blur(40px)' }}></div>

          <Row className="align-items-center position-relative" style={{ zIndex: 2 }}>
            <Col md={6} className="d-flex flex-column justify-content-center mb-4 mb-md-0">
              {/* Badge */}
              <div className="mb-3 d-inline-flex align-items-center align-self-start gap-2 px-3 py-2"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(var(--brand-neon-rgb),0.15), rgba(var(--brand-neon-rgb),0.05))'
                    : 'linear-gradient(135deg, rgba(var(--brand-neon-rgb),0.12), rgba(var(--brand-neon-rgb),0.04))',
                  borderRadius: '50px',
                  border: `1px solid rgba(var(--brand-neon-rgb),${isDark ? '0.2' : '0.15'})`
                }}>
                <span className="fw-bold text-uppercase" style={{
                  color: 'var(--brand-neon)',
                  letterSpacing: '2px',
                  fontSize: '0.75rem'
                }}>
                  {t('home.calorie_badge')}
                </span>
              </div>

              {/* Title */}
              <h3 className="fw-bold mb-3" style={{
                fontSize: '2.2rem',
                color: isDark ? '#fff' : '#1a1a2e',
                lineHeight: '1.2'
              }}>
                {t('home.calorie_title')}
              </h3>

              {/* Description */}
              <p className="mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.7', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }}>
                {t('home.calorie_desc')}
              </p>

              {/* Mini stat cards */}
              <div className="d-flex gap-3 flex-wrap">
                <div className="px-3 py-2" style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(var(--brand-neon-rgb),0.06)',
                  borderRadius: '14px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
                }}>
                  <div className="fw-bold" style={{ color: 'var(--brand-neon)', fontSize: '1.3rem' }}>{displayCalories}</div>
                  <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.75rem', letterSpacing: '1px' }}>KCAL HÔM NAY</div>
                </div>
                <div className="px-3 py-2" style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,150,200,0.06)',
                  borderRadius: '14px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
                }}>
                  <div className="fw-bold" style={{ color: isDark ? '#00e5ff' : '#0891b2', fontSize: '1.3rem' }}>0</div>
                  <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.75rem', letterSpacing: '1px' }}>PHÚT TẬP</div>
                </div>
                <div className="px-3 py-2" style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(168,85,247,0.06)',
                  borderRadius: '14px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
                }}>
                  <div className="fw-bold" style={{ color: isDark ? '#a855f7' : '#7c3aed', fontSize: '1.3rem' }}>0</div>
                  <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.75rem', letterSpacing: '1px' }}>BÀI TẬP</div>
                </div>
              </div>
            </Col>

            <Col md={6} className="d-flex justify-content-center">
              <div className="position-relative d-inline-block mx-auto" style={{ width: '280px', height: '280px' }}>
                <svg viewBox="0 0 100 100" className="w-100 h-100" style={{ filter: `drop-shadow(0 0 20px rgba(var(--brand-neon-rgb),${isDark ? '0.35' : '0.2'}))` }}>
                  <defs>
                    <linearGradient id="kcalGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--brand-neon)" />
                      <stop offset="50%" stopColor={isDark ? '#99ff00' : '#22c55e'} />
                      <stop offset="100%" stopColor={isDark ? '#00ff88' : '#10b981'} />
                    </linearGradient>
                    <linearGradient id="kcalTrack" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'} />
                      <stop offset="100%" stopColor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} />
                    </linearGradient>
                  </defs>
                  {/* Outer glow ring */}
                  <circle cx="50" cy="50" r="46" fill="none" stroke={`rgba(var(--brand-neon-rgb),${isDark ? '0.06' : '0.08'})`} strokeWidth="1" />
                  {/* Track */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#kcalTrack)" strokeWidth="7" strokeLinecap="round" />
                  {/* Inner detail dashed line */}
                  <circle cx="50" cy="50" r="34" fill="none" stroke={`rgba(var(--brand-neon-rgb),${isDark ? '0.15' : '0.12'})`} strokeWidth="1" strokeDasharray="2 3" />
                  {/* Progress */}
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="url(#kcalGradientPremium)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={0}
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>

                {/* Glowing center pulse */}
                <div className="position-absolute top-50 start-50 translate-middle rounded-circle" style={{ width: '120px', height: '120px', background: `radial-gradient(circle, rgba(var(--brand-neon-rgb),${isDark ? '0.12' : '0.08'}) 0%, transparent 65%)`, animation: 'pulse 3s infinite ease-in-out' }}></div>

                <div className="position-absolute top-50 start-50 translate-middle text-center w-100" style={{ zIndex: 2 }}>
                  <div className="fw-bold mb-0" style={{ fontSize: '3.2rem', lineHeight: '1', color: isDark ? '#fff' : '#1a1a2e', textShadow: isDark ? '0 0 30px rgba(var(--brand-neon-rgb),0.3)' : 'none' }}>{displayCalories}</div>
                  <div className="fw-bold mt-1 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '3px', color: 'var(--brand-neon)' }}>{t('home.kcal_burned')}</div>
                </div>
              </div>
            </Col>
          </Row>
          <style>{`
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.4; }
                    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.7; }
                    100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.4; }
                }
            `}</style>
        </div>
      </Container>

      {/* TÌM HIỂU THÊM MODAL */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
        <Modal.Header closeButton className="bg-surface-card border-bottom border-secondary">
          <Modal.Title className="text-primary-dynamic fw-bold">{t('home.modal_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-surface-card text-primary-dynamic" style={{ lineHeight: '1.6' }}>
          <p className="mb-3">
            {t('home.modal_p1')}
          </p>
          <ul className="mb-3 ps-3">
            <li className="mb-2">{t('home.modal_li1')}</li>
            <li className="mb-2">{t('home.modal_li2')}</li>
            <li className="mb-0">{t('home.modal_li3')}</li>
          </ul>
          <p className="mb-0 text-neon fw-bold">
            {t('home.modal_p2')}
          </p>
        </Modal.Body>
      </Modal>

    </div>
  );
}