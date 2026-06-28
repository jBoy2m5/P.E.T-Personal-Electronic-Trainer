import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GoogleIcon = () => (
  <svg className="me-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Giả lập xử lý đăng nhập Google
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('jwt-token', 'fake-jwt-token-123456');
      navigate('/');
    }, 1200);
  };

  const styleTag = `
    .auth-container {
      min-height: 100vh;
      background-color: #0b0c10;
      color: #fff;
      font-family: 'Outfit', 'Inter', sans-serif;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .auth-left {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 3rem;
      min-height: 100vh;
      background: linear-gradient(180deg, #0b0c10 0%, #06070a 100%);
      transition: background 0.3s ease;
    }
    .auth-right {
      min-height: 100vh;
      background: radial-gradient(circle at center, #0f766e 0%, #022c22 40%, #000000 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 4rem;
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
    }
    .auth-right::before {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: rgba(204, 255, 0, 0.08);
      filter: blur(100px);
      border-radius: 50%;
      top: 10%;
      right: 10%;
    }
    .brand-logo {
      max-height: 50px;
      width: auto;
      object-fit: contain;
      filter: invert(1);
    }
    .brand-title {
      font-weight: 800;
      letter-spacing: 2px;
      color: #fff;
    }
    .auth-card {
      background: rgba(20, 21, 26, 0.6) !important;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      transition: background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease;
    }
    .btn-google {
      background-color: #ffffff !important;
      color: #1f2937 !important;
      font-weight: 600;
      border: 1px solid #e5e7eb !important;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-size: 1rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .btn-google:hover {
      background-color: #f9fafb !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }
    .feature-item {
      margin-bottom: 2rem;
      position: relative;
      z-index: 2;
    }
    .feature-icon-wrapper {
      width: 48px;
      height: 48px;
      background: rgba(204, 255, 0, 0.1);
      border: 1px solid rgba(204, 255, 0, 0.3);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccff00;
      margin-right: 1.25rem;
      transition: all 0.3s ease;
    }
    .feature-title {
      font-weight: 700;
      font-size: 1.2rem;
      color: #fff;
      margin-bottom: 0.25rem;
      transition: color 0.3s ease;
    }
    .feature-desc {
      color: #9ca3af;
      font-size: 0.95rem;
      line-height: 1.5;
      transition: color 0.3s ease;
    }
    .toggle-link {
      color: #ccff00;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .toggle-link:hover {
      color: #e6ff66;
      text-shadow: 0 0 8px rgba(204, 255, 0, 0.4);
    }
    @media (max-width: 991.98px) {
      .auth-left {
        padding: 2rem 1.5rem;
      }
    }

    /* Light Theme Overrides */
    [data-bs-theme="light"] .auth-container {
      background-color: #f4f6f8;
      color: #1f2937;
    }
    [data-bs-theme="light"] .auth-left {
      background: linear-gradient(180deg, #f4f6f8 0%, #e5e7eb 100%);
    }
    [data-bs-theme="light"] .auth-card {
      background: rgba(255, 255, 255, 0.8) !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    }
    [data-bs-theme="light"] .auth-card h1 {
      color: #111827 !important;
    }
    [data-bs-theme="light"] .auth-right {
      background: radial-gradient(circle at center, #d1fae5 0%, #ecfdf5 60%, #f4f6f8 100%);
    }
    [data-bs-theme="light"] .feature-title {
      color: #111827;
    }
    [data-bs-theme="light"] .feature-desc {
      color: #4b5563;
    }
    [data-bs-theme="light"] .feature-icon-wrapper {
      background: rgba(25, 135, 84, 0.1);
      border: 1px solid rgba(25, 135, 84, 0.3);
      color: #198754;
    }
    [data-bs-theme="light"] .toggle-link {
      color: #198754;
    }
    [data-bs-theme="light"] .toggle-link:hover {
      color: #146c43;
      text-shadow: 0 0 8px rgba(25, 135, 84, 0.4);
    }
    [data-bs-theme="light"] .display-5 {
      color: #111827 !important;
    }
    [data-bs-theme="light"] .text-neon {
      color: #198754 !important;
    }
  `;

  return (
    <div className="auth-container">
      <style>{styleTag}</style>
      <Container fluid className="p-0">
        <Row className="g-0 min-vh-100">
          {/* Left Column - Auth Interaction */}
          <Col lg={5} className="auth-left">
            <div className="mx-auto w-100" style={{ maxWidth: '440px' }}>

              {/* Card Form */}
              <Card className="auth-card">
                <h1 className="fw-extrabold fs-2 mb-2 text-white">
                  {isLogin ? t('auth.login_title') : t('auth.register_title')}
                </h1>
                <p className="text-muted mb-4 small">
                  {isLogin 
                    ? t('auth.login_welcome')
                    : t('auth.register_welcome')}
                </p>

                {/* Google Sign In Button */}
                <Button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-100 btn-google d-flex align-items-center justify-content-center mb-4"
                >
                  <GoogleIcon />
                  {loading 
                    ? t('auth.processing') 
                    : isLogin ? t('auth.continue_google') : t('auth.register_google')}
                </Button>

                <div className="text-center mt-3">
                  <span className="text-muted small">
                    {isLogin ? t('auth.no_account') : t('auth.has_account')}
                  </span>
                  <a 
                    href="#toggle" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLogin(!isLogin);
                    }}
                    className="toggle-link small"
                  >
                    {isLogin ? t('auth.register_now') : t('auth.login_now')}
                  </a>
                </div>
              </Card>
            </div>
          </Col>

          {/* Right Column - Showcase panel */}
          <Col lg={7} className="auth-right d-none d-lg-flex">
            <div className="mx-auto" style={{ maxWidth: '600px' }}>
              <div className="mb-5">
                <span className="badge bg-neon text-dark px-3 py-2 rounded-pill fw-bold mb-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                  {t('auth.badge_future')}
                </span>
                <h2 className="display-5 fw-extrabold text-white lh-base">
                  {t('auth.discover')} <br />
                  <span className="text-neon">{t('auth.best_version')}</span>{t('auth.with_pet')}
                </h2>
              </div>

              <div className="features-list">
                {/* Feature 1 */}
                <div className="d-flex feature-item">
                  <div className="feature-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 7l-7 5 7 5V7z" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="feature-title">{t('auth.feature_1_title')}</h3>
                    <p className="feature-desc">
                      {t('auth.feature_1_desc')}
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="d-flex feature-item">
                  <div className="feature-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="feature-title">{t('auth.feature_2_title')}</h3>
                    <p className="feature-desc">
                      {t('auth.feature_2_desc')}
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="d-flex feature-item">
                  <div className="feature-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="feature-title">{t('auth.feature_3_title')}</h3>
                    <p className="feature-desc">
                      {t('auth.feature_3_desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}