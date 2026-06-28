import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function UserProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalCalories: 0, streak: 0 });
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedData = { ...userData, pictureUrl: base64String };
        setUserData(updatedData);
        localStorage.setItem('user-data', JSON.stringify(updatedData));
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // 1. Load User Data
    const saved = localStorage.getItem('user-data');
    if (saved) {
      setUserData(JSON.parse(saved));
    } else {
      navigate('/login');
    }

    // 2. Load Stats
    const scheduleSaved = localStorage.getItem('pet-schedule');
    const sessionsSaved = localStorage.getItem('workout-sessions');
    
    let totalW = 0;
    let totalC = 0;
    let currentStreak = 0;

    if (scheduleSaved) {
        const parsed = JSON.parse(scheduleSaved);
        totalW = Object.keys(parsed).filter(k => parsed[k].trained).length;
        currentStreak = calculateStreak(parsed);
    }
    
    if (sessionsSaved) {
        const parsedSess = JSON.parse(sessionsSaved);
        totalC = parsedSess.reduce((sum, s) => sum + (s.total_calories_burned || 0), 0);
    }

    setStats({ totalWorkouts: totalW, totalCalories: Math.round(totalC), streak: currentStreak });

  }, [navigate]);

  const calculateStreak = (scheduleData) => {
    let streak = 0;
    let d = new Date();
    while(true) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (scheduleData[key] && scheduleData[key].trained) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            if (streak === 0 && d.toDateString() === new Date().toDateString()) {
                // Ignore today if not trained yet
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
    }
    return streak;
  };

  const handleLogout = () => {
    localStorage.removeItem('user-data');
    navigate('/login');
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 0;
    const h = height / 100;
    return (weight / (h * h)).toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { label: t('profile.underweight', 'Thiếu cân'), color: 'text-warning' };
    if (bmi >= 18.5 && bmi < 25) return { label: t('profile.normal', 'Bình thường'), color: 'text-success' };
    if (bmi >= 25 && bmi < 30) return { label: t('profile.overweight', 'Thừa cân'), color: 'text-warning' };
    return { label: t('profile.obese', 'Béo phì'), color: 'text-danger' };
  };

  if (!userData) return null;

  const bmi = calculateBMI(userData.weight, userData.height);
  const bmiStatus = getBMIStatus(bmi);

  return (
    <Container fluid className="py-5 bg-surface-main min-vh-100 position-relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="position-absolute rounded-circle d-none d-lg-block" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.1) 0%, transparent 70%)', top: '-100px', left: '-100px', filter: 'blur(50px)' }}></div>
        <div className="position-absolute rounded-circle d-none d-lg-block" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', bottom: '10%', right: '-50px', filter: 'blur(40px)' }}></div>

        <Container className="position-relative z-1" style={{ maxWidth: '900px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Row className="mb-4">
                    <Col>
                        <Button variant="link" className="text-decoration-none text-secondary p-0 d-flex align-items-center mb-3 fw-bold" onClick={() => navigate(-1)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                            </svg>
                            {t('profile.back', 'QUAY LẠI')}
                        </Button>
                        <h2 className="fw-extrabold text-primary-dynamic display-6 mb-0">{t('profile.title', 'Hồ Sơ Của Bạn')}</h2>
                    </Col>
                </Row>

                <Row className="g-4">
                    {/* Left Column: Avatar & Basic Info */}
                    <Col lg={4}>
                        <Card className="border-0 bg-surface-card rounded-4 shadow-lg overflow-hidden h-100" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Card.Body className="p-4 d-flex flex-column align-items-center text-center">
                                <div className="position-relative mb-4 mt-3">
                                    <img 
                                        src={userData.pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random&size=150`} 
                                        alt="Profile" 
                                        className="rounded-circle shadow" 
                                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid var(--brand-neon)' }} 
                                    />
                                    <div 
                                      className="position-absolute bottom-0 end-0 bg-neon text-dark rounded-circle d-flex align-items-center justify-content-center" 
                                      style={{ width: '40px', height: '40px', cursor: 'pointer', border: '3px solid #121214' }}
                                      onClick={() => fileInputRef.current.click()}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                        </svg>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleAvatarChange} 
                                        accept="image/*" 
                                        hidden 
                                    />
                                </div>
                                <h4 className="fw-bold text-primary-dynamic mb-1">{userData.name || 'Người dùng P.E.T'}</h4>
                                <p className="text-secondary mb-4">{userData.email || 'Thành viên mới'}</p>
                                
                                <div className="w-100 mt-auto">
                                    <Button 
                                        variant="outline-danger" 
                                        className="w-100 fw-bold rounded-pill d-flex align-items-center justify-content-center py-2"
                                        onClick={handleLogout}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                                            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                                        </svg>
                                        {t('nav.logout', 'ĐĂNG XUẤT')}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column: Stats & Settings */}
                    <Col lg={8}>
                        <Row className="g-4 mb-4">
                            <Col sm={4} xs={6}>
                                <Card className="border-0 bg-surface-card rounded-4 shadow-sm text-center h-100">
                                    <Card.Body className="p-3 p-md-4">
                                        <div className="fs-2 mb-2">🔥</div>
                                        <h3 className="fw-bold text-neon mb-1">{stats.totalCalories}</h3>
                                        <p className="text-secondary small fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem' }}>{t('profile.kcal_burned', 'KCAL ĐÃ ĐỐT')}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={4} xs={6}>
                                <Card className="border-0 bg-surface-card rounded-4 shadow-sm text-center h-100">
                                    <Card.Body className="p-3 p-md-4">
                                        <div className="fs-2 mb-2">💪</div>
                                        <h3 className="fw-bold text-primary-dynamic mb-1">{stats.totalWorkouts}</h3>
                                        <p className="text-secondary small fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem' }}>{t('profile.workouts_done', 'BUỔI TẬP')}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col sm={4} xs={12}>
                                <Card className="border-0 bg-surface-card rounded-4 shadow-sm text-center h-100">
                                    <Card.Body className="p-3 p-md-4">
                                        <div className="fs-2 mb-2">⚡</div>
                                        <h3 className="fw-bold text-warning mb-1">{stats.streak}</h3>
                                        <p className="text-secondary small fw-bold mb-0 text-uppercase" style={{ fontSize: '0.75rem' }}>{t('profile.streak', 'CHUỖI NGÀY')}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Card className="border-0 bg-surface-card rounded-4 shadow-sm mb-4">
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold text-primary-dynamic mb-0">{t('profile.body_metrics', 'Chỉ Số Cơ Thể')}</h4>
                                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 fw-bold border-2" onClick={() => navigate('/onboarding')}>
                                        {t('profile.update', 'CẬP NHẬT')}
                                    </Button>
                                </div>
                                <Row className="g-4">
                                    <Col sm={6}>
                                        <div className="p-3 bg-surface-main rounded-4 border-surface" style={{ border: '1px solid' }}>
                                            <p className="text-secondary small fw-bold text-uppercase mb-1">{t('profile.height', 'Chiều cao')}</p>
                                            <div className="fs-4 fw-bold text-primary-dynamic">{userData.height || '--'} <span className="fs-6 text-muted">cm</span></div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="p-3 bg-surface-main rounded-4 border-surface" style={{ border: '1px solid' }}>
                                            <p className="text-secondary small fw-bold text-uppercase mb-1">{t('profile.weight', 'Cân nặng')}</p>
                                            <div className="fs-4 fw-bold text-primary-dynamic">{userData.weight || '--'} <span className="fs-6 text-muted">kg</span></div>
                                        </div>
                                    </Col>
                                    <Col sm={12}>
                                        <div className="p-4 bg-surface-main rounded-4 border-surface d-flex justify-content-between align-items-center" style={{ border: '1px solid' }}>
                                            <div>
                                                <p className="text-secondary small fw-bold text-uppercase mb-1">BMI</p>
                                                <div className="fs-3 fw-bold text-primary-dynamic">{bmi || '--'}</div>
                                            </div>
                                            <div className="text-end">
                                                <Badge bg="dark" className={`border border-secondary px-3 py-2 rounded-pill ${bmiStatus.color}`}>
                                                    {bmiStatus.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 bg-surface-card rounded-4 shadow-sm">
                            <Card.Body className="p-4 p-md-5">
                                <h4 className="fw-bold text-primary-dynamic mb-4">{t('profile.workout_plan', 'Kế Hoạch Tập Luyện')}</h4>
                                <Row className="g-4">
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-surface-main p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                🎯
                                            </div>
                                            <div>
                                                <p className="text-secondary small fw-bold text-uppercase mb-0">{t('profile.goal', 'Mục tiêu')}</p>
                                                <p className="fw-bold text-primary-dynamic mb-0">{userData.goal || '--'}</p>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-surface-main p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                📅
                                            </div>
                                            <div>
                                                <p className="text-secondary small fw-bold text-uppercase mb-0">{t('profile.frequency', 'Tần suất')}</p>
                                                <p className="fw-bold text-primary-dynamic mb-0">{userData.sessionsPerWeek ? `${userData.sessionsPerWeek} buổi/tuần` : '--'}</p>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={12}>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-surface-main p-3 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                ⭐
                                            </div>
                                            <div>
                                                <p className="text-secondary small fw-bold text-uppercase mb-0">{t('profile.level', 'Kinh nghiệm')}</p>
                                                <p className="fw-bold text-primary-dynamic mb-0">{userData.fitnessLevel || '--'}</p>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </motion.div>
        </Container>
    </Container>
  );
}
