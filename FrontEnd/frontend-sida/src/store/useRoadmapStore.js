import { create } from 'zustand';
import { generateDynamicRoadmap } from '../services/roadmapGenerator';

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

  generateRoadmap: () => {
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

    // Call the dynamic assembly engine
    const roadmap = generateDynamicRoadmap(userData);

    localStorage.setItem('roadmap-data', JSON.stringify(roadmap));
    set({ roadmapData: roadmap, initialized: true });
  }
}));

export default useRoadmapStore;
