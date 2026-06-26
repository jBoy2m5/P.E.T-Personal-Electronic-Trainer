import React, { useState, useEffect } from 'react';
import { Container, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Roadmap() {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Generate or Load Roadmap
    const generateRoadmap = () => {
      const saved = localStorage.getItem('user-data');
      const goal = saved ? JSON.parse(saved).fitness_goal : 'Tăng cơ nạc';
      
      const weeks = 4;
      const daysPerWeek = 7;
      const roadmap = [];
      let globalDay = 1;
      const isFatLoss = goal.toLowerCase().includes('giảm');
      
      const muscleList = ['Ngực & Tay sau', 'Lưng & Tay trước', 'Chân & Mông', 'Vai & Bụng', 'Full Body'];
      
      for(let w = 1; w <= weeks; w++) {
        for(let d = 1; d <= daysPerWeek; d++) {
           const isRest = d === 4 || d === 7;
           let status = 'locked';
           
           // Mock data: Assume user is currently on day 4
           if (globalDay < 4) status = 'completed';
           else if (globalDay === 4) status = 'active';
           
           roadmap.push({
              dayId: globalDay,
              week: w,
              dayOfWeek: d,
              isRestDay: isRest,
              status: status,
              muscleGroup: isRest ? 'NGHỈ NGƠI' : (isFatLoss ? 'Cardio & Core' : muscleList[(globalDay-1) % muscleList.length]),
              duration: isRest ? 0 : (isFatLoss ? 45 : 60),
              kcal: isRest ? 0 : (isFatLoss ? 500 : 350)
           });
           globalDay++;
        }
      }
      return roadmap;
    };

    const savedRoadmap = localStorage.getItem('roadmap-data');
    if (savedRoadmap) {
      setRoadmapData(JSON.parse(savedRoadmap));
    } else {
      const newRoadmap = generateRoadmap();
      setRoadmapData(newRoadmap);
      localStorage.setItem('roadmap-data', JSON.stringify(newRoadmap));
    }
  }, []);

  const handleNodeClick = (day) => {
    if (day.status === 'locked') return; // Don't open locked days
    setSelectedDay(day);
    setShowModal(true);
  };

  return (
    <div className="min-vh-100 position-relative py-5 overflow-hidden" style={{ background: 'linear-gradient(180deg, #133a20 0%, #2c0f3d 30%, #4a0d0d 70%, #000000 100%)' }}>
      
      {/* Background Decor */}
      <div className="position-absolute top-0 start-50 translate-middle-x" style={{ width: '100%', height: '100%', opacity: 0.1, zIndex: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--brand-neon)" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <Container fluid className="position-relative" style={{ zIndex: 1, maxWidth: '1200px' }}>
        <div className="text-center mb-5">
          <h1 className="fw-black text-white mb-2" style={{ letterSpacing: '2px', fontSize: '2.5rem', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            HÀNH TRÌNH <span className="text-neon">30 NGÀY</span>
          </h1>
          <p className="text-light opacity-75 fw-bold">Chinh phục từng mốc để đạt được mục tiêu</p>
        </div>

        <div className="saga-map-wrapper position-relative mx-auto mt-4">
          {roadmapData.map((day, index) => {
            const isLast = index === roadmapData.length - 1;
            const isCompleted = day.status === 'completed';
            const isActive = day.status === 'active';
            const isLocked = day.status === 'locked';

            // Ziczac Sine Wave for Vertical map
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
                
                {/* Thick Curvy Path to Next Node */}
                {!isLast && (
                  <svg 
                    className="position-absolute d-none d-lg-block"
                    style={{ top: '50%', left: 0, width: '100%', height: '110px', zIndex: 0, overflow: 'visible' }}
                    viewBox="0 0 100 100" preserveAspectRatio="none"
                  >
                    <path d={`M ${worldX} 0 C ${worldX} 55, ${nextWorldX} 55, ${nextWorldX} 100`} fill="none" stroke={pathColor} strokeWidth="16" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <path d={`M ${worldX} 0 C ${worldX} 55, ${nextWorldX} 55, ${nextWorldX} 100`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
                {!isLast && (
                  <svg 
                    className="position-absolute d-lg-none"
                    style={{ top: '50%', left: 0, width: '100%', height: '110px', zIndex: 0, overflow: 'visible' }}
                    viewBox="0 0 100 100" preserveAspectRatio="none"
                  >
                    <path d={`M ${mobileLeftOffset} 0 C ${mobileLeftOffset} 55, ${nextMobileOffset} 55, ${nextMobileOffset} 100`} fill="none" stroke={pathColor} strokeWidth="12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    <path d={`M ${mobileLeftOffset} 0 C ${mobileLeftOffset} 55, ${nextMobileOffset} 55, ${nextMobileOffset} 100`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}

                {/* Node hiện tại */}
                <div className="saga-node-positioner d-flex align-items-center justify-content-center">
                   
                   {/* Tooltip HÔM NAY */}
                   {isActive && (
                     <div className="position-absolute" style={{ top: '-45px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                       <div className="bg-white text-dark fw-bold px-3 py-1 rounded-pill" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                         HÔM NAY
                         <div className="position-absolute" style={{ bottom: '-5px', left: '50%', transform: 'translateX(-50%)', borderTop: '6px solid white', borderLeft: '6px solid transparent', borderRight: '6px solid transparent' }}></div>
                       </div>
                     </div>
                   )}

                   {/* Vòng tròn chính */}
                   <div 
                     className="d-flex align-items-center justify-content-center position-relative" 
                     style={{ 
                        width: '70px', 
                        height: '70px', 
                        borderRadius: '50%', 
                        backgroundColor: isCompleted ? 'var(--brand-neon)' : (isActive ? '#ffffff' : '#222222'),
                        border: `4px solid ${isActive ? 'var(--brand-neon)' : (isCompleted ? '#aacc00' : '#333')}`,
                        boxShadow: isActive ? '0 0 0 6px rgba(204,255,0,0.2)' : '0 6px 12px rgba(0,0,0,0.4)',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        zIndex: 2
                     }}
                     onClick={() => handleNodeClick(day)}
                     onMouseOver={(e) => { if(!isLocked) e.currentTarget.style.transform = 'scale(1.1)'; }}
                     onMouseOut={(e) => { if(!isLocked) e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1)'; }}
                   >
                      {isCompleted && <span className="fs-3 text-dark fw-bold">✓</span>}
                      {isActive && <span className="fs-4 text-dark fw-bold">★</span>}
                      {isLocked && <span className="fs-5 text-muted">🔒</span>}
                   </div>

                   {/* Floating Label (Tên ngày và Bài tập) */}
                   <div className="saga-label-container d-none d-sm-block pointer-events-none">
                     <div className="fw-black text-white" style={{ fontSize: '1rem', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>NGÀY {day.dayId}</div>
                     <div className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>{day.muscleGroup}</div>
                   </div>
                </div>

              </div>
            );
          })}
        </div>
      </Container>

      {/* Modal Chi tiết */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="saga-modal border-0">
        {selectedDay && (
          <Modal.Body className="bg-surface-card rounded-4 p-0 overflow-hidden" style={{ border: '1px solid rgba(var(--brand-neon-rgb),0.3)' }}>
            <div className="p-4 position-relative text-center" style={{ background: 'linear-gradient(180deg, rgba(var(--brand-neon-rgb),0.2) 0%, transparent 100%)' }}>
              <button onClick={() => setShowModal(false)} className="btn-close btn-close-white position-absolute top-0 end-0 m-3"></button>
              
              <div className="rounded-circle bg-neon d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <span className="fs-3 fw-bold text-dark">{selectedDay.dayId}</span>
              </div>
              
              <h3 className="fw-black text-primary-dynamic mb-1">{selectedDay.muscleGroup}</h3>
              <p className="text-neon fw-bold small mb-0">TUẦN {selectedDay.week}</p>
            </div>

            <div className="p-4 pt-0">
              <div className="d-flex justify-content-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-muted small fw-bold mb-1">THỜI GIAN</div>
                  <div className="fs-5 fw-bold text-white">{selectedDay.duration} <span className="fs-6">phút</span></div>
                </div>
                <div className="text-center">
                  <div className="text-muted small fw-bold mb-1">CALO</div>
                  <div className="fs-5 fw-bold text-white">{selectedDay.kcal} <span className="fs-6">kcal</span></div>
                </div>
              </div>

              {selectedDay.status === 'completed' ? (
                <div className="d-flex flex-column gap-3 mt-4">
                  <div className="text-success fw-bold text-center fs-5">
                    🎉 Bạn đã hoàn thành xuất sắc!
                  </div>
                  <Button 
                    variant="outline-success"
                    className="w-100 fw-bold py-3 rounded-pill"
                    onClick={() => navigate(`/daily-workout/${selectedDay.dayId}`)}
                  >
                    XEM LẠI BUỔI TẬP
                  </Button>
                </div>
              ) : selectedDay.status === 'active' ? (
                <Button 
                  className="w-100 fw-bold py-3 rounded-pill bg-neon border-0 text-dark"
                  onClick={() => navigate(`/daily-workout/${selectedDay.dayId}`)}
                >
                  BẮT ĐẦU TẬP NGAY
                </Button>
              ) : (
                <div className="alert alert-secondary bg-dark border-0 text-muted text-center fw-bold py-3 mb-0">
                  🔒 Hãy hoàn thành các ngày trước
                </div>
              )}
            </div>
          </Modal.Body>
        )}
      </Modal>

    </div>
  );
}
