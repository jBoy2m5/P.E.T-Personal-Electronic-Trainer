import useAuthStore from '../store/useAuthStore';

// DỮ LIỆU CÁ NHÂN HÓA SỐNG TRÊN SERVER DB, KHÔNG Ở LOCALSTORAGE.
// localStorage chỉ được phép chứa DEVICE_KEYS: jwt-token (credential Bearer, client bắt buộc
// phải giữ) và các cài đặt thiết bị — theme (cần TRƯỚC khi React render) + i18nextLng
// (LanguageDetector của i18next tự cache ngôn ngữ đã chọn).

// userId lấy từ authStore (bootstrap từ GET /users/me) — trả null khi chưa đăng nhập.
export const getUserId = () => useAuthStore.getState().user?.userId ?? null;

const DEVICE_KEYS = ['theme', 'jwt-token', 'i18nextLng'];

// Khóa localStorage phiên bản cũ mà migration một lần (useRoadmapStore.loadRoadmap) còn cần đọc
// để đẩy lộ trình + tick cũ lên server — chỉ giữ bản của CHÍNH user hiện tại, migration xong sẽ xóa.
const MIGRATION_KEYS = (uid) => [`roadmap-data-${uid}`, `pet-schedule-${uid}`];

// Lớp bảo vệ cứng: xóa mọi khóa localStorage không thuộc DEVICE_KEYS — gồm toàn bộ khóa legacy
// (user-data, pet-daily-*, workout-sessions-*, ai-roadmap-advice-*, pet-notifications...) và
// khóa của tài khoản khác. Gọi lúc app khởi động (App.jsx) và ngay sau khi đăng nhập (Auth.jsx).
export const purgeStaleUserData = (currentUid) => {
  const keep = currentUid ? MIGRATION_KEYS(currentUid) : [];
  Object.keys(localStorage).forEach((k) => {
    if (DEVICE_KEYS.includes(k)) return;
    if (keep.includes(k)) return;
    localStorage.removeItem(k);
  });
};

// Đăng xuất: bỏ credential rồi reload cả trang để xóa sạch state Zustand trong bộ nhớ
// (tránh dữ liệu tài khoản cũ còn sót khi đăng nhập tài khoản khác ngay sau đó).
export const logout = () => {
  localStorage.removeItem('jwt-token');
  purgeStaleUserData();
  window.location.href = '/login';
};
