import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Lịch tập lấy hoàn toàn từ server (workout-sessions + schedule-notes), không dùng localStorage
const useScheduleStore = create((set, get) => ({
  scheduleData: {}, // { 'YYYY-MM-DD': { trained, completedExercises: [], note } }
  loaded: false,

  loadSchedule: async () => {
    try {
      const [sessions, notes] = await Promise.all([
        axiosClient.get('/workout-sessions/me'),
        axiosClient.get('/schedule-notes/me'),
      ]);
      const map = {};
      (sessions || []).forEach((s) => {
        const key = s.start_time ? s.start_time.slice(0, 10) : null;
        if (!key) return;
        if (!map[key]) map[key] = { trained: true, completedExercises: [], note: '' };
        map[key].trained = true;
        const exName = s.workout_details?.[0]?.exercise?.name;
        if (exName && !map[key].completedExercises.includes(exName)) {
          map[key].completedExercises.push(exName);
        }
      });
      (notes || []).forEach((n) => {
        const key = n.date_key;
        if (!key) return;
        if (!map[key]) map[key] = { trained: false, completedExercises: [], note: '' };
        map[key].note = n.note || '';
      });
      set({ scheduleData: map, loaded: true });
      return map;
    } catch (err) {
      console.error('Không thể tải lịch tập từ server:', err);
      return {};
    }
  },

  saveNote: async (dateKey, note) => {
    try {
      await axiosClient.put('/schedule-notes', { date_key: dateKey, note });
      set((state) => {
        const map = { ...state.scheduleData };
        const existing = map[dateKey] || { trained: false, completedExercises: [], note: '' };
        const trimmed = (note || '').trim();
        if (!trimmed && !existing.trained) {
          delete map[dateKey];
        } else {
          map[dateKey] = { ...existing, note: trimmed };
        }
        return { scheduleData: map };
      });
      return true;
    } catch (err) {
      console.error('Không thể lưu ghi chú lên server:', err);
      return false;
    }
  },

  getCompletedToday: () => get().scheduleData[getTodayKey()]?.completedExercises || [],
}));

export default useScheduleStore;
