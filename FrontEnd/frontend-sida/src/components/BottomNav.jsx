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
    <div className="bottom-nav d-lg-none bg-surface-main border-top border-surface position-fixed bottom-0 w-100" style={{ zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <Nav className="w-100 d-flex justify-content-around align-items-center py-2">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Nav.Link 
              as={Link} 
              to={item.path} 
              key={item.path}
              className={`d-flex flex-column align-items-center position-relative text-decoration-none ${isActive ? 'text-neon' : 'text-secondary'}`}
              style={{ fontSize: '0.75rem', fontWeight: isActive ? '900' : 'bold', padding: '5px 10px' }}
            >
              <span className="mb-1" style={{ fontSize: '1.2rem', filter: isActive ? 'drop-shadow(0 0 5px var(--brand-neon))' : 'grayscale(100%)' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              
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
