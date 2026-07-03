import useAuthStore from '../store/useAuthStore';

// userId lấy từ authStore (bootstrap từ GET /users/me) — KHÔNG còn đọc localStorage 'user-data'.
// Trả null khi chưa bootstrap xong/chưa đăng nhập.
export const getUserId = () => useAuthStore.getState().user?.userId ?? null;

// Thêm hậu tố userId; chưa đăng nhập (không có userId) thì giữ khóa gốc.
const scopedKey = (base) => {
  const uid = getUserId();
  return uid ? `${base}-${uid}` : base;
};

// Lịch tập theo ngày (trained + completedExercises) — nguồn của dấu tick bài tập trong lộ trình.
export const getScheduleKey = () => scopedKey('pet-schedule');

// Cache buổi tập cục bộ (calo/rep) — dữ liệu hiển thị chính lấy từ server, đây chỉ là cache.
export const getSessionsKey = () => scopedKey('workout-sessions');

// Khóa duy nhất được phép tồn tại trong localStorage: credential + cài đặt thiết bị
// (theme cần TRƯỚC khi React render). Mọi dữ liệu cá nhân hóa khác sống trên server DB.
const DEVICE_KEYS = ['theme', 'jwt-token'];

// Lớp bảo vệ cứng chống rò rỉ dữ liệu giữa các tài khoản: gọi lúc app khởi động và ngay sau
// khi đăng nhập. Xóa mọi khóa localStorage không thuộc DEVICE_KEYS — gồm khóa legacy
// (user-data, pet-daily-*, roadmap-data-*...) và khóa của tài khoản khác.
// `currentUid` (tùy chọn): userId vừa đăng nhập — tạm giữ khóa -{uid} của chính tài khoản đó
// để bước migration (đẩy roadmap/tick cũ lên server) còn đọc được trước khi xóa hẳn.
export const purgeStaleUserData = (currentUid) => {
  Object.keys(localStorage).forEach((k) => {
    if (DEVICE_KEYS.includes(k)) return;
    if (currentUid && k.endsWith(`-${currentUid}`)) return;
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
