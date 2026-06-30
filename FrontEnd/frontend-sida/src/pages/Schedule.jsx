import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form } from 'react-bootstrap';

import { useTranslation } from 'react-i18next';

export default function Schedule() {
  const { t } = useTranslation();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [animateIn, setAnimateIn] = useState(false);

  const DAYS_OF_WEEK = t('schedule.days', { returnObjects: true }) || ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const MONTHS = t('schedule.months', { returnObjects: true }) || [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  // State lưu dữ liệu ngày tập & ghi chú (đọc từ localStorage - được ExerciseList tự động ghi vào)
  const [scheduleData, setScheduleData] = useState(() => {
    const saved = localStorage.getItem('pet-schedule');
    return saved ? JSON.parse(saved) : {};
  });

  // Modal state (chỉ dùng để xem chi tiết + thêm ghi chú)
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Hover state for calendar cells
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Lắng nghe thay đổi từ localStorage (khi ExerciseList ghi vào)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('pet-schedule');
      if (saved) setScheduleData(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    // Cũng poll mỗi 2 giây để bắt thay đổi cùng tab
    const interval = setInterval(() => {
      const saved = localStorage.getItem('pet-schedule');
      if (saved) {
        const parsed = JSON.parse(saved);
        setScheduleData(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsed)) return parsed;
          return prev;
        });
      }
    }, 2000);
    return () => { window.removeEventListener('storage', handleStorageChange); clearInterval(interval); };
  }, []);

  // Helpers
  const getDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  // Navigation
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Handle click ngày → mở modal xem chi tiết + thêm ghi chú
  const handleDayClick = (day) => {
    const key = getDateKey(currentYear, currentMonth, day);
    setSelectedDate({ day, month: currentMonth, year: currentYear, key });
    const existing = scheduleData[key];
    setNoteText(existing?.note || '');
    setShowModal(true);
  };

  // Lưu ghi chú (chỉ ghi chú, không thay đổi trained status)
  const handleSaveNote = () => {
    const updated = { ...scheduleData };
    const existing = updated[selectedDate.key] || {};
    if (noteText.trim()) {
      updated[selectedDate.key] = { ...existing, note: noteText.trim() };
    } else if (!existing.trained) {
      // Nếu không có ghi chú và chưa tập → xóa luôn
      delete updated[selectedDate.key];
    } else {
      // Có trained nhưng xóa ghi chú
      updated[selectedDate.key] = { ...existing, note: '' };
    }
    setScheduleData(updated);
    localStorage.setItem('pet-schedule', JSON.stringify(updated));
    setShowModal(false);
  };

  // Tính thống kê
  const monthDays = getDaysInMonth(currentYear, currentMonth);
  let trainedCount = 0;
  let notesCount = 0;
  for (let d = 1; d <= monthDays; d++) {
    const key = getDateKey(currentYear, currentMonth, d);
    if (scheduleData[key]?.trained) trainedCount++;
    if (scheduleData[key]?.note) notesCount++;
  }

  // Streak tính từ hôm nay
  let streak = 0;
  const streakDate = new Date(today);
  while (true) {
    const key = getDateKey(streakDate.getFullYear(), streakDate.getMonth(), streakDate.getDate());
    if (scheduleData[key]?.trained) {
      streak++;
      streakDate.setDate(streakDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Build calendar grid
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth === 0 ? 11 : currentMonth - 1);
  const calendarCells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, type: 'prev' });
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push({ day: d, type: 'current' });
  }
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({ day: i, type: 'next' });
  }

  return (
    <div className="bg-surface-main" style={{ minHeight: '100vh', paddingTop: '30px', paddingBottom: '100px', position: 'relative', overflow: 'hidden' }}>

      {/* Background decorative elements */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.04) 0%, transparent 70%)', top: '-150px', right: '-100px', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,180,216,0.04) 0%, transparent 70%)', bottom: '-100px', left: '-100px', filter: 'blur(60px)', pointerEvents: 'none' }}></div>

      <Container style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Header Banner */}
        <div className="mb-5 rounded-4 position-relative overflow-hidden bg-surface-card-gradient border-surface" style={{
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid',
          padding: '50px 40px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Animated gradient orbs */}
          <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.12) 0%, transparent 70%)', top: '-100px', right: '-50px', filter: 'blur(50px)', pointerEvents: 'none', animation: 'headerFloat 6s ease-in-out infinite' }}></div>
          <div style={{ position: 'absolute', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)', bottom: '-80px', left: '20%', filter: 'blur(40px)', pointerEvents: 'none', animation: 'headerFloat 8s ease-in-out infinite reverse' }}></div>

          {/* Grid pattern overlay */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', opacity: 0.03,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>

          {/* Floating decorative icons */}
          <div style={{ position: 'absolute', top: '20px', right: '40px', fontSize: '2rem', opacity: 0.15, animation: 'headerFloat 4s ease-in-out infinite' }}>📅</div>
          <div style={{ position: 'absolute', bottom: '20px', right: '120px', fontSize: '1.5rem', opacity: 0.1, animation: 'headerFloat 5s ease-in-out infinite 1s' }}>🔥</div>
          <div style={{ position: 'absolute', top: '30px', right: '200px', fontSize: '1.2rem', opacity: 0.08, animation: 'headerFloat 7s ease-in-out infinite 0.5s' }}>💪</div>

          <Row className="align-items-center position-relative" style={{ zIndex: 1 }}>
            <Col lg={12}>
              {/* Breadcrumb tag */}
              <div className="d-inline-flex align-items-center mb-3 px-2 py-1 rounded"
                style={{ background: 'rgba(var(--brand-neon-rgb),0.06)', border: '1px solid rgba(var(--brand-neon-rgb),0.12)' }}>
                <span style={{ color: 'rgba(var(--brand-neon-rgb),0.6)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '2px' }}>{t('schedule.breadcrumb')}</span>
              </div>

              <h1 className="fw-bold text-primary-dynamic mb-3" style={{ fontSize: '3.2rem', letterSpacing: '-1px', lineHeight: '1.15' }}>
                {t('schedule.title_1')}
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, var(--brand-neon), #88ff44, #00ff88)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 20px rgba(var(--brand-neon-rgb),0.2))'
                }}>{t('schedule.title_2')}</span>
              </h1>
              <p className="text-secondary" style={{ maxWidth: '480px', fontSize: '1rem', lineHeight: '1.7' }}>
                {t('schedule.description')}
              </p>
            </Col>
          </Row>
        </div>

        {/* Stats Cards Row */}
        <Row className="g-3 mb-4" style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s' }}>
          <Col xs={6} lg={3}>
            <div className="p-3 p-lg-4 rounded-4 h-100 position-relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(var(--brand-neon-rgb),0.12) 0%, rgba(var(--brand-neon-rgb),0.02) 100%)',
              border: '1px solid rgba(var(--brand-neon-rgb),0.15)', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.08, pointerEvents: 'none' }}>🔥</div>
              <div className="text-secondary" style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '8px' }}>{t('schedule.streak')}</div>
              <div className="fw-bold" style={{ color: 'var(--brand-neon)', fontSize: '2.5rem', lineHeight: 1, textShadow: '0 0 20px rgba(var(--brand-neon-rgb),0.3)' }}>{streak}</div>
              <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{t('schedule.consecutive_days')}</div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3 p-lg-4 rounded-4 h-100 position-relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(0,180,216,0.1) 0%, rgba(0,180,216,0.02) 100%)',
              border: '1px solid rgba(0,180,216,0.15)', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.08, pointerEvents: 'none' }}>💪</div>
              <div className="text-secondary" style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '8px' }}>{t('schedule.trained')}</div>
              <div className="fw-bold" style={{ color: '#00b4d8', fontSize: '2.5rem', lineHeight: 1 }}>{trainedCount}</div>
              <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{t('schedule.out_of_days', { days: monthDays })}</div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3 p-lg-4 rounded-4 h-100 position-relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(255,107,157,0.02) 100%)',
              border: '1px solid rgba(255,107,157,0.15)', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.08, pointerEvents: 'none' }}>📝</div>
              <div className="text-secondary" style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '8px' }}>{t('schedule.notes')}</div>
              <div className="fw-bold" style={{ color: '#ff6b9d', fontSize: '2.5rem', lineHeight: 1 }}>{notesCount}</div>
              <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{t('schedule.notes_count')}</div>
            </div>
          </Col>
          <Col xs={6} lg={3}>
            <div className="p-3 p-lg-4 rounded-4 h-100 position-relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(255,217,61,0.1) 0%, rgba(255,217,61,0.02) 100%)',
              border: '1px solid rgba(255,217,61,0.15)', backdropFilter: 'blur(10px)'
            }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '5rem', opacity: 0.08, pointerEvents: 'none' }}>🎯</div>
              <div className="text-secondary" style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '8px' }}>{t('schedule.completed')}</div>
              <div className="fw-bold" style={{ color: '#ffd93d', fontSize: '2.5rem', lineHeight: 1 }}>{monthDays > 0 ? Math.round((trainedCount / monthDays) * 100) : 0}%</div>
              <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{t('schedule.monthly_goal')}</div>
            </div>
          </Col>
        </Row>

        <Row className="g-4" style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' }}>
          {/* Cột trái: Lịch */}
          <Col lg={8}>
            <div className="p-4 rounded-4 bg-surface-card border-surface" style={{
              border: '1px solid',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {/* Navigation tháng */}
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-surface" style={{ borderBottom: '1px solid' }}>
                <div className="d-flex align-items-center gap-3">
                  <h3 className="fw-bold text-primary-dynamic mb-0" style={{ fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
                    {MONTHS[currentMonth]} <span className="text-secondary">{currentYear}</span>
                  </h3>
                  <button onClick={goToToday} className="btn btn-sm rounded-pill px-3 py-1 text-neon border-neon"
                    style={{ background: 'var(--bs-tertiary-bg, rgba(var(--brand-neon-rgb),0.08))', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bs-secondary-bg, rgba(var(--brand-neon-rgb),0.15))'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--bs-tertiary-bg, rgba(var(--brand-neon-rgb),0.08))'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >{t('schedule.today')}</button>
                </div>
                <div className="d-flex gap-2">
                  <button onClick={prevMonth} className="btn btn-sm rounded-3 d-flex align-items-center justify-content-center text-primary-dynamic"
                    style={{ width: '38px', height: '38px', background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.04))', border: '1px solid var(--bs-border-color, rgba(255,255,255,0.08))', transition: 'all 0.2s', fontSize: '1.2rem' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bs-secondary-bg, rgba(255,255,255,0.1))'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--bs-tertiary-bg, rgba(255,255,255,0.04))'; }}
                  >‹</button>
                  <button onClick={nextMonth} className="btn btn-sm rounded-3 d-flex align-items-center justify-content-center text-primary-dynamic"
                    style={{ width: '38px', height: '38px', background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.04))', border: '1px solid var(--bs-border-color, rgba(255,255,255,0.08))', transition: 'all 0.2s', fontSize: '1.2rem' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--bs-secondary-bg, rgba(255,255,255,0.1))'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--bs-tertiary-bg, rgba(255,255,255,0.04))'; }}
                  >›</button>
                </div>
              </div>

              {/* Header ngày trong tuần */}
              <div className="d-grid mb-3" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="text-center text-secondary fw-bold mb-3 pb-2 border-surface" style={{ fontSize: '0.8rem', borderBottom: '1px solid', letterSpacing: '1px' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Lưới ngày */}
              <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {calendarCells.map((cell, idx) => {
                  const key = cell.type === 'current' ? getDateKey(currentYear, currentMonth, cell.day) : null;
                  const data = key ? scheduleData[key] : null;
                  const todayHighlight = cell.type === 'current' && isToday(cell.day);
                  const isSunday = idx % 7 === 0;
                  const isHovered = hoveredCell === idx && cell.type === 'current';

                  return (
                    <div
                      key={idx}
                      onClick={() => cell.type === 'current' && handleDayClick(cell.day)}
                      onMouseEnter={() => cell.type === 'current' && setHoveredCell(idx)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className="position-relative d-flex flex-column align-items-center justify-content-center rounded-3"
                      style={{
                        aspectRatio: '1',
                        cursor: cell.type === 'current' ? 'pointer' : 'default',
                        background: todayHighlight
                          ? 'linear-gradient(135deg, rgba(var(--brand-neon-rgb),0.15) 0%, rgba(var(--brand-neon-rgb),0.03) 100%)'
                          : data?.trained
                            ? 'rgba(var(--brand-neon-rgb),0.08)'
                            : isHovered
                              ? 'var(--bs-tertiary-bg, rgba(255,255,255,0.04))'
                              : 'transparent',
                        border: todayHighlight
                          ? '2px solid var(--brand-neon)'
                          : data?.trained
                            ? '1px solid rgba(var(--brand-neon-rgb),0.25)'
                            : isHovered
                              ? '1px solid var(--bs-border-color, rgba(255,255,255,0.1))'
                              : '1px solid var(--bs-border-color-translucent, rgba(255,255,255,0.03))',
                        opacity: cell.type !== 'current' ? 0.3 : 1,
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: todayHighlight
                          ? '0 0 15px rgba(var(--brand-neon-rgb),0.15), inset 0 0 15px rgba(var(--brand-neon-rgb),0.05)'
                          : data?.trained
                            ? '0 4px 12px rgba(var(--brand-neon-rgb),0.08)'
                            : isHovered ? '0 4px 15px rgba(0,0,0,0.3)' : 'none',
                        ...(cell.type === 'current' ? {} : { pointerEvents: 'none' })
                      }}
                    >
                      <span className={todayHighlight || data?.trained || isSunday ? "" : "text-secondary"} style={{
                        fontSize: '0.95rem',
                        fontWeight: todayHighlight ? '800' : data?.trained ? '600' : '400',
                        color: todayHighlight ? 'var(--brand-neon)' : data?.trained ? 'var(--brand-neon)' : isSunday ? '#ff6b6b' : 'inherit',
                        textShadow: todayHighlight ? '0 0 10px rgba(var(--brand-neon-rgb),0.4)' : 'none'
                      }}>
                        {cell.day}
                      </span>

                      <div className="d-flex gap-1 mt-1" style={{ height: '6px' }}>
                        {data?.trained && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-neon)', boxShadow: '0 0 8px rgba(var(--brand-neon-rgb),0.6)', animation: todayHighlight ? 'glow-pulse 2s infinite' : 'none' }}></div>
                        )}
                        {data?.note && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00b4d8', boxShadow: '0 0 6px rgba(0,180,216,0.5)' }}></div>
                        )}
                      </div>

                      {/* Tooltip on hover */}
                      {isHovered && data && (
                        <div style={{
                          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                          background: '#222', borderRadius: '8px', padding: '6px 12px',
                          fontSize: '0.7rem', color: '#fff', whiteSpace: 'nowrap', zIndex: 10,
                          border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                          animation: 'fadeIn 0.15s ease'
                        }}>
                          {data.trained ? t('schedule.tooltip_trained') : ''}
                          {data.completedExercises?.length > 0 && ` ${t('schedule.tooltip_exercises', { count: data.completedExercises.length })}`}
                          <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '8px', height: '8px', background: '#222', borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              {/* Legend */}
              <div className="d-flex flex-wrap gap-4 mt-4 pt-3 border-surface" style={{ borderTop: '1px solid' }}>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-neon)', boxShadow: '0 0 6px rgba(var(--brand-neon-rgb),0.6)' }}></div>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{t('schedule.trained_auto')}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00b4d8', boxShadow: '0 0 6px rgba(0,180,216,0.5)' }}></div>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{t('schedule.has_note')}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', border: '2px solid var(--brand-neon)' }}></div>
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{t('schedule.today')}</span>
                </div>
              </div>

              {/* Monthly Progress Bar */}
              <div className="mt-4 pt-3 border-surface" style={{ borderTop: '1px solid' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: '600' }}>{t('schedule.progress', { month: MONTHS[currentMonth] })}</span>
                  <span style={{ color: 'var(--brand-neon)', fontSize: '0.8rem', fontWeight: 'bold' }}>{trainedCount}/{monthDays}</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.04))', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${monthDays > 0 ? (trainedCount / monthDays) * 100 : 0}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--brand-neon), #00ff88)',
                    borderRadius: '4px',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 10px rgba(var(--brand-neon-rgb),0.3)'
                  }}></div>
                </div>
              </div>
            </div>
          </Col>

          {/* Cột phải: Ghi chú gần đây */}
          <Col lg={4}>
            <div className="p-4 rounded-4 h-100 bg-surface-card border-surface" style={{
                border: '1px solid',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
              }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '1.2rem' }}>📝</span>
                <h5 className="fw-bold text-primary-dynamic mb-0" style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>{t('schedule.log')}</h5>
              </div>
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {Object.entries(scheduleData)
                  .filter(([, v]) => v.trained || v.note)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 10)
                  .map(([dateKey, data]) => {
                    const [y, m, d] = dateKey.split('-');
                    return (
                      <div key={dateKey} className="p-3 rounded-3 mb-2" style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderLeft: `3px solid ${data.trained ? 'var(--brand-neon)' : '#00b4d8'}`,
                        transition: 'all 0.2s'
                      }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: '600' }}>{d}/{m}/{y}</span>
                          {data.trained && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(var(--brand-neon-rgb),0.15)', color: 'var(--brand-neon)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', border: '1px solid rgba(var(--brand-neon-rgb),0.25)' }}>
                              💪 {t('schedule.trained')}
                            </span>
                          )}
                        </div>
                        {data.completedExercises?.length > 0 && (
                          <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '6px' }}>
                            <span style={{ color: '#00b4d8', marginRight: '4px' }}>✓</span>
                            {t('schedule.completed_exercises', { count: data.completedExercises.length })}
                          </div>
                        )}
                        {data.note && (
                          <p className="text-secondary" style={{ fontSize: '0.82rem', lineHeight: '1.5', marginBottom: 0 }}>{data.note}</p>
                        )}
                      </div>
                    );
                  })}
                {Object.keys(scheduleData).length === 0 && (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.2 }}>🏋️</div>
                    <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                      {t('schedule.no_activity')}
                    </p>
                    <p className="text-secondary" style={{ fontSize: '0.75rem', marginBottom: 0 }}>
                      {t('schedule.do_exercise_to_record')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal xem chi tiết ngày + thêm ghi chú */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered
        contentClassName="border-0 rounded-4 overflow-hidden bg-surface-card border-surface"
      >
        <Modal.Header closeButton className="border-0 pb-0 bg-surface-card border-surface" closeVariant="white">
          <Modal.Title className="fw-bold text-primary-dynamic d-flex align-items-center gap-2" style={{ fontSize: '1.15rem' }}>
            <span style={{ fontSize: '1.3rem' }}>📅</span>
            {selectedDate && `${selectedDate.day}/${selectedDate.month + 1}/${selectedDate.year}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-surface-card">
          {/* Trạng thái tập luyện (chỉ hiển thị, không cho chỉnh) */}
          {selectedDate && scheduleData[selectedDate.key]?.trained ? (
            <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bs-tertiary-bg, rgba(var(--brand-neon-rgb),0.08))', border: '1px solid rgba(var(--brand-neon-rgb),0.2)' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span style={{ fontSize: '1.3rem' }}>💪</span>
                <span className="fw-bold text-neon" style={{ fontSize: '0.9rem' }}>{t('schedule.trained_this_day')}</span>
              </div>
              {scheduleData[selectedDate.key]?.completedExercises?.length > 0 && (
                <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  {scheduleData[selectedDate.key].completedExercises.map((ex, i) => (
                    <div key={i} className="d-flex align-items-center gap-1 mb-1">
                      <span className="text-neon">✓</span> {ex}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.02))', border: '1px solid var(--bs-border-color, rgba(255,255,255,0.06))' }}>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '1.3rem' }}>😴</span>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>{t('schedule.not_trained')}</span>
              </div>
            </div>
          )}

          {/* Ghi chú */}
          <Form.Group>
            <Form.Label className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>{t('schedule.personal_note')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={t('schedule.note_placeholder')}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="border-0 rounded-3 text-primary-dynamic"
              style={{ background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.04))', resize: 'none', fontSize: '0.9rem', padding: '12px' }}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-surface-card border-surface">
          <Button size="sm" className="rounded-pill px-3 text-secondary" onClick={() => setShowModal(false)}
            style={{ background: 'var(--bs-tertiary-bg, rgba(255,255,255,0.05))', border: '1px solid var(--bs-border-color, rgba(255,255,255,0.1))', fontSize: '0.8rem' }}>
            {t('schedule.cancel')}
          </Button>
          <Button size="sm" className="rounded-pill fw-bold px-4" onClick={handleSaveNote}
            style={{ background: 'var(--brand-neon)', color: '#000', border: 'none', fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(var(--brand-neon-rgb),0.3)' }}>
            {t('schedule.save_note')}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 6px rgba(var(--brand-neon-rgb),0.4); }
          50% { box-shadow: 0 0 12px rgba(var(--brand-neon-rgb),0.8); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
