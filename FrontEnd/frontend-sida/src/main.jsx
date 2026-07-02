import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n'; // Khởi tạo i18n
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = "691147162344-2iulu9dr1tm8e2olaqtvsjtrq26mkj0d.apps.googleusercontent.com";

// Áp theme TRƯỚC khi React render — TopNav (nơi toggle theme) không có mặt ở mọi trang
// (vd /pet), nên refresh tại trang không có TopNav sẽ mất data-bs-theme và rơi về light
document.documentElement.setAttribute('data-bs-theme', localStorage.getItem('theme') === 'light' ? 'light' : 'dark');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
