import axiosClient from './axiosClient';

// Hồ sơ cơ thể (height/weight/bmi) chỉ tồn tại ở server DB — component/store cần thì gọi hàm này,
// KHÔNG đọc từ localStorage (localStorage không còn lưu số đo). Chuẩn hóa field snake_case của
// GET /users/me (User entity: fitness_goal, fitness_level...) về camelCase dùng trong app.
export const fetchProfile = async () => {
  const me = await axiosClient.get('/users/me');
  return {
    gender: me?.gender || null,
    height: me?.height ?? null,
    weight: me?.weight ?? null,
    bmi: me?.bmi ?? null,
    fitnessLevel: me?.fitness_level || me?.fitnessLevel || null,
    goal: me?.fitness_goal || me?.goal || null,
    sessionsPerWeek: me?.sessions_per_week ?? me?.sessionsPerWeek ?? null,
  };
};
