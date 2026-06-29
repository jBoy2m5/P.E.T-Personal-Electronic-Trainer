import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useRoadmapStore from '../store/useRoadmapStore';

export default function Roadmap() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { roadmapData, initialized, loadRoadmap } = useRoadmapStore();
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');

  useEffect(() => {
    if (!initialized) {
        loadRoadmap();
    }
    const advice = localStorage.getItem('ai-roadmap-advice');
    if (advice) setAiAdvice(advice);
  }, [initialized, loadRoadmap]);

  const handleNodeClick = (day) => {
    if (day.status === 'locked') return; // Don't open locked days
    setSelectedDay(day);
    setShowModal(true);
  };

  const getTranslatedText = (type, text) => {
    const map = {
      chapter: {
        "CHƯƠNG 1: LÀNG TÂN THỦ": "chap_1",
        "CHƯƠNG 2: RỪNG THỬ THÁCH": "chap_2",
        "CHƯƠNG 3: ĐỈNH NÚI Ý CHÍ": "chap_3",
        "CHƯƠNG 4: LÂU ĐÀI VÔ CỰC": "chap_4",
        "CHƯƠNG BÍ ẨN": "chap_mystery"
      },
      quest: {
        "Trạm nghỉ chân": "quest_rest",
        "Phá vỡ Khiên Cổ Đại": "quest_chest",
        "Kéo sập Tường Thành": "quest_back",
        "Vượt qua Đầm Lầy": "quest_legs",
        "Đỡ Cột Trụ Trời": "quest_shoulders",
        "Trận chiến Sinh Tử": "quest_full",
        "Chạy trốn Quái Thú": "quest_cardio",
        "Huấn luyện Đặc biệt": "quest_special"
      },
      desc: {
        "Dừng chân tại tửu quán, hồi phục sinh lực và kiểm tra hành trang để chuẩn bị cho trận chiến tiếp theo.": "desc_rest",
        "Dùng sức mạnh thân trên đập vỡ lớp khiên cản đường của binh đoàn Mỡ Thừa.": "desc_chest",
        "Tập trung lực kéo vững chắc để hạ bệ chướng ngại vật khổng lồ.": "desc_back",
        "Sức mạnh đôi chân là thứ duy nhất giúp bạn thoát khỏi vũng lầy của sự lười biếng.": "desc_legs",
        "Cốt lõi vững chắc sẽ giúp bạn chống đỡ lại áp lực ngàn cân đang ập tới.": "desc_shoulders",
        "Vận dụng mọi nhóm cơ để đánh bại quái vật gác cổng mạnh nhất của khu vực.": "desc_full",
        "Tốc độ nhịp tim và sức bền là chìa khóa để sống sót qua vòng vây này.": "desc_cardio",
        "Đối mặt với những thử thách bí ẩn trong sương mù.": "desc_special"
      },
      mg: {
        "Ngực & Tay sau": "mg_chest",
        "Lưng & Tay trước": "mg_back",
        "Chân & Mông": "mg_legs",
        "Vai & Bụng": "mg_shoulders",
        "Full Body": "mg_full",
        "Cardio & Core": "mg_cardio",
        "NGHỈ NGƠI": "mg_rest"
      }
    };
    if (map[type] && map[type][text]) {
      return t(`roadmap_data.${map[type][text]}`);
    }
    return text;
  };

  return (
    <div className="min-vh-100 position-relative py-5 overflow-hidden bg-roadmap-gradient">

      {/* Background Decor */}
      <div className="position-absolute top-0 start-50 translate-middle-x" style={{ width: '100%', height: '100%', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--brand-neon)" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top Header */}
      <div className="position-absolute top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-center" style={{ zIndex: 10 }}>
        <Button variant="dark" className="rounded-pill px-4 border-secondary fw-bold" onClick={() => navigate(-1)}>
          <span className="me-2">←</span> {t('roadmap.back')}
        </Button>
        
        <div className="text-center">
          <h1 className="fw-black text-primary-dynamic m-0" style={{ fontSize: '2rem', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {t('roadmap.title_1')} <span className="text-neon">{t('roadmap.title_2')}</span>
          </h1>
          <p className="text-light m-0 fw-bold" style={{ fontSize: '0.9rem', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
            {t('roadmap.subtitle')}
          </p>
        </div>
        
        <div style={{ width: '100px' }}></div>
      </div>

      {/* AI Coach Advice Banner */}
      {aiAdvice && (
        <div className="position-relative mx-auto px-4 pb-2" style={{ zIndex: 1, maxWidth: '1200px', marginTop: '110px' }}>
          <div className="p-3 rounded-4 border" style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'var(--brand-neon)', backdropFilter: 'blur(10px)' }}>
            <div className="d-flex align-items-start gap-2">
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <p className="text-white fw-bold mb-0 small" style={{ lineHeight: 1.6 }}>{aiAdvice}</p>
            </div>
          </div>
        </div>
      )}

      <Container fluid className="position-relative" style={{ zIndex: 1, maxWidth: '1200px', marginTop: aiAdvice ? '8px' : '100px' }}>
        <div className="saga-map-wrapper position-relative mx-auto mt-4">
          {roadmapData.map((day, index) => {
            const isLast = index === roadmapData.length - 1;
            const isCompleted = day.status === 'completed';
            const isActive = day.status === 'active';
            const isLocked = day.status === 'locked';

            const mobileOffsets = [50, 30, 20, 30, 50, 70, 80, 70];
            const desktopOffsets = [50, 25, 10, 25, 50, 75, 90, 75];

            const mobileLeftOffset = mobileOffsets[index % 8];
            const nextMobileOffset = mobileOffsets[(index + 1) % 8];
            const worldX = desktopOffsets[index % 8];
            const nextWorldX = desktopOffsets[(index + 1) % 8];

            const nextNode = isLast ? null : roadmapData[index + 1];
            const isPathActive = isCompleted && nextNode && (nextNode.status === 'completed' || nextNode.status === 'active');
            const pathColor = isPathActive ? 'var(--brand-neon)' : 'rgba(0,0,0,0.3)';

            return (
              <div
                key={day.dayId}
                className="saga-node-container"
                style={{
                  '--mobile-left-offset': `${mobileLeftOffset}%`,
                  '--world-x': `${worldX}%`,
                  '--world-y': `auto`,
                  '--mobile-label-left': mobileLeftOffset >= 50 ? 'auto' : '85px',
                  '--mobile-label-right': mobileLeftOffset >= 50 ? '85px' : 'auto',
                  '--mobile-label-text-align': mobileLeftOffset >= 50 ? 'right' : 'left',
                  '--world-label-left': worldX >= 50 ? 'auto' : '85px',
                  '--world-label-right': worldX >= 50 ? '85px' : 'auto',
                  '--world-label-top': '50%',
                  '--world-label-transform': 'translateY(-50%)',
                  '--world-label-text-align': worldX >= 50 ? 'right' : 'left'
                }}
              >
                {!isLast && (
                  <svg className="position-absolute d-none d-lg-block" style={{ top: '50%', left: 0, width: '100%', height: '110px', zIndex: 0, overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d={`M ${worldX} 0 C ${worldX} 55, ${nextWorldX} 55, ${nextWorldX} 100`} fill="none" stroke={pathColor} strokeWidth="16" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <path d={`M ${worldX} 0 C ${worldX} 55, ${nextWorldX} 55, ${nextWorldX} 100`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                
                <div className="saga-node-positioner d-flex align-items-center justify-content-center">
                  <div
                    className="d-flex align-items-center justify-content-center position-relative"
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? 'var(--brand-neon)' : (isActive ? '#ffffff' : 'var(--surface-4, #222222)'),
                      border: `4px solid ${isActive ? 'var(--brand-neon)' : (isCompleted ? '#aacc00' : 'var(--border-default, #333)')}`,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      zIndex: 2,
                      transition: 'all 0.3s ease',
                      boxShadow: isActive 
                        ? '0 0 25px rgba(var(--brand-neon-rgb),0.4), 0 0 50px rgba(var(--brand-neon-rgb),0.15)' 
                        : isCompleted 
                          ? '0 0 15px rgba(var(--brand-neon-rgb),0.2)' 
                          : 'none',
                      animation: isActive ? 'sagaPulse 2s infinite' : 'none'
                    }}
                    onClick={() => handleNodeClick(day)}
                  >
                    {isCompleted && <span className="fs-3 text-dark fw-bold">✓</span>}
                    {isActive && <span className="fs-4 text-dark fw-bold">★</span>}
                    {isLocked && <span className="fs-5 text-muted">🔒</span>}
                  </div>

                  <div className="saga-label-container d-none d-sm-block pointer-events-none">
                     <div className="fw-black text-primary-dynamic" style={{ fontSize: '1rem', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>{t('roadmap.day')} {day.dayId}</div>
                     <div className="text-neon fw-bold mb-1" style={{ fontSize: '0.7rem' }}>{getTranslatedText('quest', day.quest)}</div>
                     <div className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>[{getTranslatedText('mg', day.muscleGroup)}]</div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="saga-modal border-0">
        {selectedDay && (
          <Modal.Body className="bg-surface-card rounded-4 p-0 overflow-hidden" style={{ border: '1px solid rgba(var(--brand-neon-rgb),0.2)', boxShadow: 'var(--shadow-lg), var(--shadow-neon)' }}>
            <div className="p-4 position-relative text-center" style={{ background: 'linear-gradient(180deg, rgba(var(--brand-neon-rgb),0.2) 0%, transparent 100%)' }}>
              <button onClick={() => setShowModal(false)} className="btn-close btn-close-white position-absolute top-0 end-0 m-3"></button>
              
              <div className="rounded-circle bg-neon d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 fw-bold text-dark">{selectedDay.dayId}</span>
              </div>
              
              <h3 className="fw-black text-primary-dynamic mb-1" style={{ fontSize: '1.25rem' }}>{getTranslatedText('quest', selectedDay.quest)}</h3>
              <p className="text-neon fw-bold small mb-2">{getTranslatedText('chapter', selectedDay.chapter)}</p>
              <p className="text-muted small mb-3 fst-italic" style={{ minHeight: '40px' }}>"{getTranslatedText('desc', selectedDay.storyDesc)}"</p>
              
              <div className="d-inline-block bg-dark px-3 py-1 rounded-pill border border-secondary">
                <span className="text-light small fw-bold">🎯 {getTranslatedText('mg', selectedDay.muscleGroup)}</span>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Row className="g-3 mb-4 text-center">
                <Col xs={4}>
                  <div className="bg-dark rounded p-2 border border-secondary h-100">
                    <div className="text-muted small fw-bold mb-1">{t('roadmap.time')}</div>
                    <div className="fw-bold text-light">{selectedDay.duration} {t('roadmap.mins')}</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="bg-dark rounded p-2 border border-secondary h-100">
                    <div className="text-muted small fw-bold mb-1">{t('roadmap.kcal')}</div>
                    <div className="fw-bold text-neon">{selectedDay.kcal}</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="bg-dark rounded p-2 border border-secondary h-100">
                    <div className="text-muted small fw-bold mb-1">{t('roadmap.week')}</div>
                    <div className="fw-bold text-light">{selectedDay.week}</div>
                  </div>
                </Col>
              </Row>

              {selectedDay.status === 'completed' ? (
                <Button variant="success" className="w-100 py-3 fw-bold rounded-pill text-dark d-flex align-items-center justify-content-center" onClick={() => navigate(`/daily-workout/${selectedDay.dayId}`, { state: { day: selectedDay } })}>
                  <span className="me-2 fs-5">✓</span> {t('roadmap.review_workout')}
                </Button>
              ) : selectedDay.status === 'active' ? (
                <Button className="w-100 btn-brand py-3 fw-bold rounded-pill" onClick={() => navigate(`/daily-workout/${selectedDay.dayId}`, { state: { day: selectedDay } })}>
                  {t('roadmap.start_workout')}
                </Button>
              ) : (
                <Button variant="secondary" className="w-100 py-3 fw-bold rounded-pill" disabled>
                  {t('roadmap.locked')}
                </Button>
              )}
            </div>
          </Modal.Body>
        )}
      </Modal>

    </div>
  );
}
