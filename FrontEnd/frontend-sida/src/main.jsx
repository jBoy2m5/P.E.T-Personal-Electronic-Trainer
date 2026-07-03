import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n'; // Khởi tạo i18n
import { GoogleOAuthProvider } from '@react-oauth/google';
import { sanitizeStoredUserData } from './utils/userStorage';

const clientId = "691147162344-2iulu9dr1tm8e2olaqtvsjtrq26mkj0d.apps.googleusercontent.com";

// Dọn bmi lỡ lưu trong localStorage từ phiên bản cũ — BMI chỉ được phép tồn tại ở server DB
sanitizeStoredUserData();

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
