import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

// Hồ sơ user đang đăng nhập — nguồn DUY NHẤT là server (GET /users/me), giữ in-memory.
// KHÔNG còn localStorage 'user-data': client chỉ giữ jwt-token; mọi thông tin cá nhân
// (kể cả userId để scope dữ liệu) bootstrap lại từ server mỗi lần tải app.
const useAuthStore = create((set) => ({
  user: null, // { userId, name, email, pictureUrl, gender, goal, fitnessLevel, sessionsPerWeek, needsOnboarding }
  status: 'loading', // 'loading' | 'authenticated' | 'anonymous' — App.jsx chặn render khi 'loading'

  bootstrap: async () => {
    if (!localStorage.getItem('jwt-token')) {
      set({ user: null, status: 'anonymous' });
      return;
    }
    try {
      const me = await axiosClient.get('/users/me');
      set({
        user: {
          userId: me.user_id,
          name: me.name || null,
          email: me.email || null,
          pictureUrl: me.picture_url || null,
          gender: me.gender || null,
          goal: me.fitness_goal || null,
          fitnessLevel: me.fitness_level || null,
          sessionsPerWeek: me.sessions_per_week ?? null,
          // Có hồ sơ (goal + gender) = đã onboarding — khớp tiêu chí backend.
          // KHÔNG dùng height/weight: user legacy có thể NULL số đo (trước chỉ lưu localStorage).
          needsOnboarding: !(me.fitness_goal && me.gender),
        },
        status: 'authenticated',
      });
    } catch {
      // 401 → interceptor của axiosClient đã xóa token + đá về /login;
      // lỗi mạng/khác → coi như chưa đăng nhập, không treo app
      set({ user: null, status: 'anonymous' });
    }
  },

  // Cập nhật tại chỗ sau khi server đã nhận thay đổi (vd đổi avatar) — tránh refetch cả hồ sơ
  updateUser: (partial) =>
    set((s) => (s.user ? { user: { ...s.user, ...partial } } : s)),
}));

export default useAuthStore;
