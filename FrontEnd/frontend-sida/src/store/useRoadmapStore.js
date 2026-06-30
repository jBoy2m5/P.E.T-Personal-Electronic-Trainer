import { create } from 'zustand';
import { generateDynamicRoadmap } from '../services/roadmapGenerator';
import useExerciseStore from './useExerciseStore';
import axiosClient from '../api/axiosClient';

const useRoadmapStore = create((set, get) => ({
  roadmapData: [],
  initialized: false,

  loadRoadmap: () => {
    const savedRoadmap = localStorage.getItem('roadmap-data');
    if (savedRoadmap) {
      set({ roadmapData: JSON.parse(savedRoadmap), initialized: true });
    } else {
      get().generateRoadmap();
    }
  },

  generateRoadmap: async () => {
    const saved = localStorage.getItem('user-data');
    let userData = {
      gender: 'Nam',
      height: 170,
      weight: 65,
      fitnessLevel: 'Mới bắt đầu',
      goal: 'Giữ dáng'
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      userData = {
        gender: parsed.gender || 'Nam',
        height: parsed.height || 170,
        weight: parsed.weight || 65,
        fitnessLevel: parsed.fitnessLevel || 'Mới bắt đầu',
        goal: parsed.goal || parsed.fitness_goal || 'Giữ dáng'
      };
    }

    const exercises = await useExerciseStore.getState().fetchExercises();
    const roadmap = generateDynamicRoadmap(userData, exercises);

    localStorage.setItem('roadmap-data', JSON.stringify(roadmap));
    set({ roadmapData: roadmap, initialized: true });

    // Fetch Gemini AI advice in background (fire-and-forget)
    axiosClient.get('/ai/roadmap-advice')
      .then(res => {
        if (res && res.advice) {
          localStorage.setItem('ai-roadmap-advice', res.advice);
        }
      })
      .catch(() => {});
  }
}));

export default useRoadmapStore;
