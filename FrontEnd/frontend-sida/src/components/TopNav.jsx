import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo-black.png';
import { getUnclaimedDailyMissionCount } from '../services/rewards';

export default function TopNav() {
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    return true;
  });
  
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [unclaimedTasks, setUnclaimedTasks] = useState(0);
  const [userData, setUserData] = useState(() => {
    const data = localStorage.getItem('user-data');
    return data ? JSON.parse(data) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('user-data'));

  useEffect(() => {
    const handleStorageChange = () => {
      const data = localStorage.getItem('user-data');
      setUserData(data ? JSON.parse(data) : null);
      setIsAuthenticated(!!data);
      // Cập nhật badge nhiệm vụ Missions mỗi nhịp để phản ánh việc vừa tập/nhận ở trang khác
      setUnclaimedTasks(getUnclaimedDailyMissionCount());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000); // Check every second to respond inside the same tab
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const loadNotifs = () => {
      const saved = localStorage.getItem('pet-notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
      setUnclaimedTasks(getUnclaimedDailyMissionCount());
    };
    loadNotifs();
    window.addEventListener('storage', loadNotifs);
    return () => window.removeEventListener('storage', loadNotifs);
  }, []);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('pet-notifications', JSON.stringify(updated));
  };

  if (location.pathname.startsWith('/roadmap')) {
    return null;
  }

  return (
    <Navbar 
      expand="lg" 
      className={`sticky-top py-2`}
      style={{ 
        zIndex: 1000,
        background: isDark ? 'rgba(10,10,12,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: isDark ? '0 4px 30px rgba(0,0,0,0.3)' : '0 4px 30px rgba(0,0,0,0.04)'
      }}
    >
      <Container className="d-flex justify-content-between align-items-center">
        {!isLoginPage ? (
          <>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center logo-brand">
              <img 
                src={logo} 
                alt="P.E.T Logo" 
                height="48" 
                className="me-2" 
                style={{
                  width: 'auto',
                  objectFit: 'contain',
                  filter: isDark ? 'invert(1) drop-shadow(0 0 1px rgba(255,255,255,0.3))' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <span className="text-secondary mx-2 fs-4">|</span>
              <span className={`fw-bold fs-4 ms-1 ${isDark ? 'text-white' : 'text-dark'}`} style={{ letterSpacing: '2px' }}>P.E.T</span>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" className={isDark ? "border-secondary text-white" : "border-secondary text-dark"} />
            
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto fw-bold d-none d-lg-flex" style={{ fontSize: '0.85rem' }}>
                <Nav.Link as={Link} to="/roadmap" className={`px-4 nav-link-custom ${location.pathname.startsWith('/roadmap') ? 'nav-link-active' : ''} ${isDark ? 'text-white' : 'text-dark'}`}>{t('nav.roadmap')}</Nav.Link>
                <Nav.Link as={Link} to="/calories" className={`px-4 nav-link-custom ${location.pathname.startsWith('/calories') ? 'nav-link-active' : ''} ${isDark ? 'text-white' : 'text-dark'}`}>{t('nav.calories')}</Nav.Link>
                <Nav.Link as={Link} to="/schedule" className={`px-4 nav-link-custom ${location.pathname.startsWith('/schedule') ? 'nav-link-active' : ''} ${isDark ? 'text-white' : 'text-dark'}`}>{t('nav.schedule')}</Nav.Link>
                <Nav.Link as={Link} to="/daily" className={`px-4 nav-link-custom position-relative ${location.pathname.startsWith('/daily') ? 'nav-link-active' : ''} ${isDark ? 'text-white' : 'text-dark'}`}>
                  {t('nav.missions')}
                  {isAuthenticated && unclaimedTasks > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.55rem', marginLeft: '-15px', marginTop: '10px' }}>
                      {unclaimedTasks}
                    </span>
                  )}
                </Nav.Link>
              </Nav>

              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                <button className="tool-btn me-2" onClick={handleLanguageToggle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5c.035.887.14 1.73.318 2.5H1.674A6.958 6.958 0 0 1 1.018 8.5h2.492zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.941 2.461c-.246-.35-.47-.765-.67-1.24E5.244 12.5 5.09 11.5 5.09 11h-2.8a7.024 7.024 0 0 0 3.238 3.461zm3.873-1.24c-.198.475-.423.89-.669 1.24A7.024 7.024 0 0 0 12.545 11h-2.8c-.015.5-.17 1.5-.331 2.22zM11.153 11c.187-.765.306-1.608.338-2.5h2.836c-.053.864-.265 1.72-.656 2.5h-2.518zm1.026-6.5c.174.782.282 1.623.312 2.5h2.49a6.958 6.958 0 0 0-.656-2.5h-2.146zm-1.09-1.539a9.267 9.267 0 0 1 .64 1.539h1.835a7.025 7.025 0 0 0-3.072-2.472c.214.331.41.696.597.933zM8.5 1.077v2.923h2.355c-.552-1.035-1.217-1.65-1.887-1.855z"/>
                  </svg>
                  {i18n.language === 'en' ? 'VN' : 'EN'}
                </button>

                <button className="tool-btn me-2" onClick={handleThemeToggle}>
                  {isDark ? '☀️' : '🌙'}
                </button>
                
                <div className={`nav-divider d-none d-lg-block mx-2 ${!isDark && 'bg-secondary'}`}></div>

                {/* Notification Bell */}
                {isAuthenticated && (
                  <div className="position-relative d-flex align-items-center me-1">
                    <button 
                      className="tool-btn position-relative" 
                      onClick={() => {
                        setShowNotif(!showNotif);
                        if (!showNotif && unreadCount > 0) markAllAsRead();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
                      </svg>
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {showNotif && (
                      <div 
                        className={`position-absolute top-100 end-0 mt-2 rounded-4`} 
                        style={{ 
                          width: '320px', zIndex: 1050, overflow: 'hidden',
                          background: isDark ? 'rgba(20,20,22,0.95)' : 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)',
                          animation: 'fadeSlideIn 0.2s ease'
                        }}
                      >
                        <div className={`p-3 border-bottom fw-bold ${isDark ? 'text-white border-secondary' : 'text-dark border-light'}`}>
                          {t('nav.notifications')}
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted small">{t('nav.no_notifications')}</div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className={`p-3 border-bottom ${isDark ? 'border-secondary' : 'border-light'} hover-bg`} style={{ cursor: 'pointer' }}>
                                <div className={`small fw-bold mb-1 ${isDark ? 'text-white' : 'text-dark'}`}>{n.message}</div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(n.time).toLocaleString()}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isAuthenticated ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle as="div" className="d-flex align-items-center bg-transparent border-0 p-0" style={{ cursor: 'pointer' }}>
                      <img 
                        src={userData?.pictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=random`} 
                        alt="Profile" 
                        className="rounded-circle border border-2 border-success" 
                        style={{ width: '38px', height: '38px', objectFit: 'cover' }} 
                      />
                      <span className={`ms-2 d-none d-lg-block fw-bold ${isDark ? 'text-white' : 'text-dark'}`}>
                        {userData?.name || 'Người dùng'}
                      </span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className={`mt-2 rounded-4 ${isDark ? 'dropdown-menu-dark' : ''}`} style={{ minWidth: '220px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)', background: isDark ? 'rgba(20,20,22,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
                      <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                        </svg>
                        Trang cá nhân
                      </Dropdown.Item>
                      <Dropdown.Divider className={isDark ? 'border-secondary' : ''} />
                      <Dropdown.Item 
                        className="d-flex align-items-center py-2 text-danger"
                        onClick={() => {
                          localStorage.removeItem('user-data');
                          localStorage.removeItem('jwt-token');
                          window.location.href = '/login';
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                          <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                        </svg>
                        {t('nav.logout', 'ĐĂNG XUẤT')}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Link to="/login" className="text-decoration-none">
                    <button className="btn-login p-2 px-3 rounded-3" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                        <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                        <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                      </svg>
                      {t('nav.login')}
                    </button>
                  </Link>
                )}
              </div>
            </Navbar.Collapse>
          </>
        ) : null}
      </Container>
    </Navbar>
  );
}