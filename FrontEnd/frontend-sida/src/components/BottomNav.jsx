import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUnclaimedCount } from '../services/rewards';

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const unclaimedTasks = getUnclaimedCount();

  // Không hiện BottomNav ở trang đăng nhập hoặc onboarding
  if (location.pathname === '/login' || location.pathname === '/onboarding') {
    return null;
  }

  const navItems = [
    { path: '/roadmap', label: t('nav.roadmap'), icon: '🗺️' },
    { path: '/calories', label: t('nav.calories'), icon: '🔥' },
    { path: '/schedule', label: t('nav.schedule'), icon: '📅' },
    { path: '/daily', label: t('nav.missions'), icon: '🎯', badge: unclaimedTasks > 0 ? unclaimedTasks : null }
  ];

  return (
    <div 
      className="bottom-nav d-lg-none position-fixed bottom-0 w-100" 
      style={{ 
        zIndex: 1000, 
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(10,10,12,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.3)'
      }}
    >
      <Nav className="w-100 d-flex justify-content-around align-items-center py-2">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Nav.Link 
              as={Link} 
              to={item.path} 
              key={item.path}
              className={`d-flex flex-column align-items-center position-relative text-decoration-none`}
              style={{ 
                fontSize: '0.7rem', 
                fontWeight: isActive ? '800' : '600', 
                padding: '5px 10px',
                color: isActive ? 'var(--brand-neon)' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateY(-2px)' : 'none'
              }}
            >
              <span className="mb-1 position-relative" style={{ 
                fontSize: '1.2rem', 
                filter: isActive ? 'none' : 'grayscale(100%) opacity(0.5)',
                transition: 'all 0.3s ease'
              }}>
                {item.icon}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--brand-neon)',
                    boxShadow: '0 0 8px var(--brand-neon)',
                    animation: 'neonPulse 2s infinite'
                  }}></span>
                )}
              </span>
              <span style={{ letterSpacing: '0.5px' }}>{item.label}</span>
              
              {item.badge && (
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.55rem', marginLeft: '10px' }}>
                  {item.badge}
                </span>
              )}
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );
}
