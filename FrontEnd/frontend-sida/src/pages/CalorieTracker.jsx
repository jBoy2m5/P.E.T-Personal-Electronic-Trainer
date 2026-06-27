import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Dữ liệu mock mapping để lấy thông tin bài tập từ exercise_id
const exerciseMockDB = {
    101: { name: 'Hít đất cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
    102: { name: 'Hít đất hẹp tay', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
    103: { name: 'Đẩy ngực với tạ đơn', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
    201: { name: 'Hít xà đơn', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
    202: { name: 'Kéo lưng với dây kháng lực', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
    301: { name: 'Đẩy vai tạ đơn', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
    302: { name: 'Nâng vai ngang', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
    401: { name: 'Cuốn tạ đơn', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
    402: { name: 'Đẩy tay sau', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
    501: { name: 'Gập bụng', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
    502: { name: 'Plank', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
    601: { name: 'Squat cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
    602: { name: 'Lunge (Chùng chân)', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
    701: { name: 'Glute Bridge', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
    702: { name: 'Kickback', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
    801: { name: 'Handstand', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
    802: { name: 'Muscle-up', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' }
};

export default function CalorieTracker() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [burnedCalories, setBurnedCalories] = useState(0);
    const [todaySessions, setTodaySessions] = useState([]);
    const [todayDetails, setTodayDetails] = useState([]);

    useEffect(() => {
        const loadCaloriesData = () => {
            const todayStr = new Date().toISOString().split('T')[0];

            // Load Sessions
            const sessionsStr = localStorage.getItem('workout-sessions');
            let sessions = [];
            if (sessionsStr) {
                sessions = JSON.parse(sessionsStr).filter(s => s.start_time.startsWith(todayStr));
                const todayBurn = sessions.reduce((sum, s) => sum + (s.total_calories_burned || 0), 0);
                setBurnedCalories(Math.round(todayBurn));
                setTodaySessions(sessions);
            }

            // Load Details
            const detailsStr = localStorage.getItem('workout-details');
            if (detailsStr) {
                const sessionIds = sessions.map(s => s.session_id);
                const details = JSON.parse(detailsStr).filter(d => sessionIds.includes(d.session_id));
                setTodayDetails(details);
            }
        };

        loadCaloriesData();
        window.addEventListener('storage', loadCaloriesData);
        return () => window.removeEventListener('storage', loadCaloriesData);
    }, []);

    return (
        <div className="bg-surface-main" style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '100px' }}>
            <Container style={{ maxWidth: '800px' }}>
                <div className="d-flex align-items-center mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn text-white p-0 me-3 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}
                    >
                        <span className="fs-5">←</span>
                    </button>
                    <h2 className="fw-bold text-primary-dynamic mb-0" style={{ letterSpacing: '1px' }}>{t('calorie_tracker.title')}</h2>
                </div>

                <Row className="g-4 mb-5">
                    {/* Card Tổng Quan */}
                    <Col lg={5}>
                        <Card className="bg-surface-card-gradient border-surface p-4 text-center h-100 d-flex flex-column justify-content-center" style={{ borderRadius: '32px' }}>

                            <h5 className="text-muted fw-bold mb-4" style={{ letterSpacing: '1px' }}>{t('calorie_tracker.today')}</h5>

                            <div className="position-relative d-inline-block mx-auto mb-4" style={{ width: '220px', height: '220px' }}>
                                <svg viewBox="0 0 100 100" className="w-100 h-100" style={{ filter: 'drop-shadow(0 0 10px rgba(204,255,0,0.3))' }}>
                                    <defs>
                                        <linearGradient id="kcalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ccff00" />
                                            <stop offset="100%" stopColor="#00ff88" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(204,255,0,0.1)" strokeWidth="1" strokeDasharray="2 3" />
                                    <circle
                                        cx="50" cy="50" r="42" fill="none" stroke="url(#kcalGrad)" strokeWidth="8" strokeLinecap="round"
                                        strokeDasharray="264"
                                        strokeDashoffset={0}
                                        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1s ease' }}
                                    />
                                </svg>
                                <div className="position-absolute top-50 start-50 translate-middle w-100">
                                    <div className="fw-bold text-primary-dynamic" style={{ fontSize: '3rem', lineHeight: '1' }}>{burnedCalories}</div>
                                    <div className="text-neon fw-bold mt-1" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>{t('calorie_tracker.kcal_burned')}</div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Chi Tiết Tập Luyện */}
                    <Col lg={7}>
                        <Card className="bg-surface-card border-surface p-4 h-100" style={{ borderRadius: '32px' }}>
                            <h5 className="text-primary-dynamic fw-bold mb-4" style={{ fontSize: '1.1rem' }}>{t('calorie_tracker.details')}</h5>

                            {todayDetails.length === 0 ? (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                    <div className="fs-1 mb-2">😴</div>
                                    <p className="mb-0">{t('calorie_tracker.no_data')}</p>
                                    <p className="small">{t('calorie_tracker.start_workout')}</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }} className="custom-scroll">
                                    {todayDetails.map((detail, index) => {
                                        // Tìm session tương ứng để lấy calo của bài đó
                                        const parentSession = todaySessions.find(s => s.session_id === detail.session_id);
                                        const exData = exerciseMockDB[detail.exercise_id] || { name: t('calorie_tracker.anonymous_exercise'), img: '' };
                                        
                                        // Thời gian tập (mô phỏng từ start/end time của session)
                                        let durationStr = `1 ${t('calorie_tracker.mins')}`;
                                        if (parentSession && parentSession.start_time && parentSession.end_time) {
                                            const start = new Date(parentSession.start_time);
                                            const end = new Date(parentSession.end_time);
                                            const diffMs = end - start;
                                            const diffMins = Math.max(1, Math.round(diffMs / 60000));
                                            durationStr = `${diffMins} ${t('calorie_tracker.mins')}`;
                                        }

                                        return (
                                            <div key={index} className="d-flex align-items-center p-3 mb-3 rounded-4 border-surface" style={{ background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.03))', border: '1px solid' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }} className="me-3">
                                                    <img src={exData.img} alt="ex" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-primary-dynamic mb-1">{exData.name}</div>
                                                    <div className="d-flex gap-3 text-muted small">
                                                        <span>⏱ {durationStr}</span>
                                                        <span>🔄 {detail.reps_completed} Reps</span>
                                                    </div>
                                                </div>
                                                <div className="text-end ms-2">
                                                    <div className="fw-bold text-neon fs-5">+{parentSession?.total_calories_burned || 0}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>KCAL</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(204,255,0,0.5); border-radius: 10px; }
            `}</style>
        </div>
    );
}
