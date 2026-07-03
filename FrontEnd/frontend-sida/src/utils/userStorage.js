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

// bmi + height + weight là dữ liệu cơ thể, nguồn DUY NHẤT là server DB. KHÔNG cache ở client
// (bản localStorage dễ lỗi thời khi đổi cân nặng, và từng gây rò rỉ giữa các tài khoản). Server
// vẫn trả các field này trong response (login, /users/me) nhưng khi lưu hồ sơ vào localStorage
// phải loại chúng ra; component cần số đo/BMI thì gọi GET /users/me (fetchProfile trong api/profileApi).
// Chỉ giữ lại cờ `needsOnboarding` (suy ra từ height/weight) để App.jsx biết có ép onboarding không.
const BODY_METRIC_FIELDS = ['bmi', 'height', 'weight'];

export const saveUserData = (user, needsOnboarding) => {
  if (!user || typeof user !== 'object') {
    localStorage.setItem('user-data', JSON.stringify(user));
    return;
  }
  const rest = { ...user };
  if (typeof needsOnboarding === 'boolean') {
    rest.needsOnboarding = needsOnboarding;
  } else if (rest.height != null && rest.weight != null) {
    rest.needsOnboarding = false;
  }
  // else: payload không kèm số đo (vd chỉ đổi avatar) → giữ nguyên rest.needsOnboarding sẵn có
  BODY_METRIC_FIELDS.forEach((f) => delete rest[f]);
  localStorage.setItem('user-data', JSON.stringify(rest));
};

// Dọn bmi/height/weight khỏi user-data đã lỡ lưu ở phiên bản cũ (chạy 1 lần lúc app khởi động).
// Suy ra cờ needsOnboarding từ số đo cũ trước khi xóa để không bắt user đã onboarding làm lại.
export const sanitizeStoredUserData = () => {
  try {
    const saved = localStorage.getItem('user-data');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return;
    if (!BODY_METRIC_FIELDS.some((f) => f in parsed)) return;
    if (parsed.needsOnboarding === undefined) {
      parsed.needsOnboarding = !(parsed.height != null && parsed.weight != null);
    }
    BODY_METRIC_FIELDS.forEach((f) => delete parsed[f]);
    localStorage.setItem('user-data', JSON.stringify(parsed));
  } catch { /* ignore */ }
};

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
