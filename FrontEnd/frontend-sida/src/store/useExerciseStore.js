import { create } from 'zustand';
import { getAllExercises } from '../api/exerciseApi';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600';

const useExerciseStore = create((set, get) => ({
  exercises: [],
  loaded: false,

  fetchExercises: async () => {
    if (get().loaded) return get().exercises;
    try {
      const data = await getAllExercises();
      const mapped = (data || []).map(ex => ({
        id: ex.exercise_id,
        name: ex.name,
        target: ex.muscle_group_name,
        isJump: ex.is_jump || false,
        level: ex.level || 'Cơ bản',
        img: ex.media_url || DEFAULT_IMG,
        desc: ex.technical_description || '',
        kcalPerRep: ex.estimated_calories_per_rep || 1.0
      }));
      set({ exercises: mapped, loaded: true });
      return mapped;
    } catch (err) {
      console.error('Không thể tải danh sách bài tập:', err);
      return [];
    }
  }
}));

export default useExerciseStore;
