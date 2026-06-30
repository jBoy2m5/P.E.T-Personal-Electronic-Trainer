import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import axiosClient from '../api/axiosClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/google-login', {
        credential: credentialResponse.credential
      });
      
      // Save user data (since JWT is in HttpOnly cookie)
      localStorage.setItem('user-data', JSON.stringify(res.user));

      // Redirect based on onboarding status
      if (res.needsOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Google Login Failed", error);
      alert("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Login Failed');
    alert("Đăng nhập Google bị hủy hoặc thất bại.");
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
      background: rgba(20, 21, 26, 0.5) !important;
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.06) !important;
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05);
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
      transition: transform 0.3s ease;
    }
    .feature-item:hover {
      transform: translateX(8px);
    }
    .feature-icon-wrapper {
      width: 50px;
      height: 50px;
      background: rgba(204, 255, 0, 0.08);
      border: 1px solid rgba(204, 255, 0, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccff00;
      margin-right: 1.25rem;
      transition: all 0.3s ease;
      box-shadow: 0 0 20px rgba(204,255,0,0.05);
    }
    .feature-item:hover .feature-icon-wrapper {
      background: rgba(204, 255, 0, 0.15);
      box-shadow: 0 0 25px rgba(204,255,0,0.15);
      transform: scale(1.05);
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
      background: rgba(255, 255, 255, 0.75) !important;
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(0, 0, 0, 0.06) !important;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.8);
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

              <div className="mb-4">
                <Button 
                  variant="link" 
                  className="text-decoration-none p-0 d-flex align-items-center fw-bold" 
                  style={{ color: '#9ca3af', transition: 'color 0.2s ease' }}
                  onClick={() => navigate('/')}
                  onMouseOver={(e) => e.currentTarget.style.color = '#ccff00'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  Về trang chủ
                </Button>
              </div>

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
                <div className="d-flex justify-content-center mb-4">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess} 
                    onError={handleGoogleError}
                    theme="filled_black"
                    text={isLogin ? "signin_with" : "signup_with"}
                    shape="rectangular"
                  />
                </div>

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