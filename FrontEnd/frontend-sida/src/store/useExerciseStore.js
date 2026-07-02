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
      const levelMap = { '1': 'Cơ bản', '2': 'Trung bình', '3': 'Nâng cao' };
      const mapped = (data || []).map(ex => ({
        id: ex.exercise_id,
        name: ex.name,
        target: ex.muscle_group_name,
        isJump: ex.is_jump || false,
        level: levelMap[ex.level] || ex.level || 'Cơ bản',
        img: ex.media_url || DEFAULT_IMG,
        desc: ex.technical_description || '',
        safetyNotes: ex.safety_notes || '',
        kcalPerRep: ex.estimated_calories_per_rep || 1.0,
        aiMode: ex.ai_mode || null
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
