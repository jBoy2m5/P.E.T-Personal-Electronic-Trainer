// Các khóa localStorage chứa dữ liệu riêng của từng tài khoản (lịch tập, buổi tập,
// lời khuyên AI) PHẢI được tách theo userId. Nếu dùng khóa chung, khi đăng nhập một
// tài khoản khác trên cùng trình duyệt, dữ liệu của tài khoản trước sẽ hiển thị nhầm
// (vd: bài tập trong lộ trình bị tick "đã tập" dù tài khoản mới chưa tập gì).
// Giống quy ước của roadmap (`roadmap-data-{userId}`) và pet (`pet-daily-{userId}`).
export const getUserId = () => {
  try {
    const saved = localStorage.getItem('user-data');
    return saved ? JSON.parse(saved)?.userId : null;
  } catch { return null; }
};

// Thêm hậu tố userId; chưa đăng nhập (không có userId) thì giữ khóa gốc.
const scopedKey = (base) => {
  const uid = getUserId();
  return uid ? `${base}-${uid}` : base;
};

// Lịch tập theo ngày (trained + completedExercises) — nguồn của dấu tick bài tập trong lộ trình.
export const getScheduleKey = () => scopedKey('pet-schedule');

// Cache buổi tập cục bộ (calo/rep) — dữ liệu hiển thị chính lấy từ server, đây chỉ là cache.
export const getSessionsKey = () => scopedKey('workout-sessions');

// Lời khuyên AI cho lộ trình (tóm tắt thể trạng + mục tiêu của user) — cache theo ngôn ngữ + user.
export const getAdviceKey = (langKey) => scopedKey(`ai-roadmap-advice-v2-${langKey}`);

// Khóa dùng chung cho cả thiết bị (không gắn userId), luôn được giữ lại khi dọn dữ liệu.
const DEVICE_KEYS = ['theme', 'user-data', 'jwt-token'];

// Lớp bảo vệ cứng chống rò rỉ dữ liệu giữa các tài khoản: gọi NGAY SAU khi đăng nhập
// (user-data đã là tài khoản mới). Xóa mọi khóa localStorage KHÔNG thuộc tài khoản hiện tại —
// gồm khóa của tài khoản khác (hậu tố -{userId khác}), khóa global cũ còn sót, và cả những
// khóa per-user tương lai lỡ quên gắn userId. Chỉ giữ DEVICE_KEYS và khóa có hậu tố -{userId hiện tại}.
export const purgeStaleUserData = () => {
  const uid = getUserId();
  Object.keys(localStorage).forEach((k) => {
    if (DEVICE_KEYS.includes(k)) return;
    if (uid && k.endsWith(`-${uid}`)) return;
    localStorage.removeItem(k);
  });
};
