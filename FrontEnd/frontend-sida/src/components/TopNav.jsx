import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import logo from '../assets/logo.png'; 

export default function TopNav() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <Navbar 
      expand="lg" 
      className={`border-bottom sticky-top py-3 ${isDark ? 'bg-black border-dark' : 'bg-white border-light'}`} 
      style={{ zIndex: 1000 }}
    >
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center logo-brand">
          <img 
            src={logo} 
            alt="P.E.T Logo" 
            height="48" 
            className="me-2" 
            style={{ 
              width: 'auto', 
              objectFit: 'contain',
              filter: isDark ? 'invert(1)' : 'none',
              transition: 'all 0.3s ease'
            }} 
          />
          <span className="text-secondary mx-2 fs-4">|</span>
          <span className={`fw-bold fs-4 ms-1 ${isDark ? 'text-white' : 'text-dark'}`} style={{ letterSpacing: '2px' }}>P.E.T</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className={isDark ? "border-secondary text-white" : "border-secondary text-dark"} />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto fw-bold" style={{ fontSize: '0.85rem' }}>
            <Nav.Link href="#routines" className={`px-4 nav-link-custom nav-link-active ${isDark ? 'text-white' : 'text-dark'}`}>LỘ TRÌNH</Nav.Link>
            <Nav.Link href="#calories" className={`px-4 nav-link-custom ${isDark ? 'text-white' : 'text-dark'}`}>QUẢN LÝ CALO</Nav.Link>
          </Nav>

          <Nav className="align-items-center mt-3 mt-lg-0">
            <button className="tool-btn me-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5c.035.887.14 1.73.318 2.5H1.674A6.958 6.958 0 0 1 1.018 8.5h2.492zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.941 2.461c-.246-.35-.47-.765-.67-1.24E5.244 12.5 5.09 11.5 5.09 11h-2.8a7.024 7.024 0 0 0 3.238 3.461zm3.873-1.24c-.198.475-.423.89-.669 1.24A7.024 7.024 0 0 0 12.545 11h-2.8c-.015.5-.17 1.5-.331 2.22zM11.153 11c.187-.765.306-1.608.338-2.5h2.836c-.053.864-.265 1.72-.656 2.5h-2.518zm1.026-6.5c.174.782.282 1.623.312 2.5h2.49a6.958 6.958 0 0 0-.656-2.5h-2.146zm-1.09-1.539a9.267 9.267 0 0 1 .64 1.539h1.835a7.025 7.025 0 0 0-3.072-2.472c.214.331.41.696.597.933zM8.5 1.077v2.923h2.355c-.552-1.035-1.217-1.65-1.887-1.855z"/>
              </svg>
              VN
            </button>

            <button className="tool-btn me-2" onClick={handleThemeToggle}>
              {isDark ? '☀️' : '🌙'}
            </button>
            
            <div className={`nav-divider d-none d-lg-block mx-2 ${!isDark && 'bg-secondary'}`}></div>

            <Nav.Link href="#login" className="p-0 mt-2 mt-lg-0">
              <button className="btn-login" style={{ fontSize: '0.85rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-2">
                  <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                  <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
                ĐĂNG NHẬP
              </button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}