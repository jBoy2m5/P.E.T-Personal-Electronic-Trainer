import { create } from 'zustand';
import { generateDynamicRoadmap } from '../services/roadmapGenerator';
import useExerciseStore from './useExerciseStore';
import axiosClient from '../api/axiosClient';

const getUserId = () => {
  try {
    const saved = localStorage.getItem('user-data');
    return saved ? JSON.parse(saved)?.userId : null;
  } catch { return null; }
};

const getRoadmapKey = (userId) => {
  const uid = userId || getUserId();
  return uid ? `roadmap-data-${uid}` : 'roadmap-data';
};

const deriveStatuses = (roadmap) => {
  const updated = roadmap.map(d => ({ ...d }));
  const lastCompletedIdx = updated.map(d => d.status === 'completed').lastIndexOf(true);
  if (lastCompletedIdx === -1) {
    // Nothing completed — day 1 active
    if (updated.length > 0) updated[0].status = 'active';
    for (let i = 1; i < updated.length; i++) updated[i].status = 'locked';
  } else {
    for (let i = 0; i <= lastCompletedIdx; i++) updated[i].status = 'completed';
    if (lastCompletedIdx + 1 < updated.length) updated[lastCompletedIdx + 1].status = 'active';
    for (let i = lastCompletedIdx + 2; i < updated.length; i++) updated[i].status = 'locked';
  }
  return updated;
};

const useRoadmapStore = create((set, get) => ({
  roadmapData: [],
  initialized: false,

  loadRoadmap: async () => {
    const userId = getUserId();
    const key = getRoadmapKey(userId);
    const saved = localStorage.getItem(key);

    if (saved) {
      const parsed = JSON.parse(saved);
      set({ roadmapData: parsed, initialized: true });
      // Sync completion from backend in background
      if (userId) get()._syncCompletionFromBackend(userId, parsed);
      return;
    }

    if (userId) {
      await get()._fetchOrCreate(userId);
    } else {
      await get().generateRoadmap();
    }
  },

  generateRoadmap: async () => {
    const userId = getUserId();
    const key = getRoadmapKey(userId);
    const saved = localStorage.getItem('user-data');
    let userData = { gender: 'Nam', height: 170, weight: 65, fitnessLevel: 'Mới bắt đầu', goal: 'Giữ dáng' };
    if (saved) {
      const p = JSON.parse(saved);
      userData = { gender: p.gender || 'Nam', height: p.height || 170, weight: p.weight || 65, fitnessLevel: p.fitnessLevel || 'Mới bắt đầu', goal: p.goal || p.fitness_goal || 'Giữ dáng' };
    }
    const exercises = await useExerciseStore.getState().fetchExercises();
    const roadmap = generateDynamicRoadmap(userData, exercises);

    localStorage.setItem(key, JSON.stringify(roadmap));
    set({ roadmapData: roadmap, initialized: true });

    // Save to backend (fire-and-forget)
    if (userId) get()._saveToBackend(userId, roadmap, userData.goal);

    axiosClient.get('/ai/roadmap-advice').then(res => {
      if (res?.advice) localStorage.setItem('ai-roadmap-advice', res.advice);
    }).catch(() => {});
  },

  markDayComplete: (localDayId) => {
    const { roadmapData } = get();
    const idx = roadmapData.findIndex(d => d.dayId.toString() === localDayId.toString());
    if (idx === -1) return;

    const updated = roadmapData.map(d => ({ ...d }));
    updated[idx].status = 'completed';
    if (idx + 1 < updated.length) updated[idx + 1].status = 'active';

    const key = getRoadmapKey();
    localStorage.setItem(key, JSON.stringify(updated));
    set({ roadmapData: updated });

    // Sync to backend
    const backendDayId = updated[idx].backendDayId;
    if (backendDayId) {
      axiosClient.put(`/roadmaps/days/${backendDayId}`, { is_completed: true }).catch(() => {});
    }
  },

  _syncCompletionFromBackend: async (userId, localRoadmap) => {
    try {
      const userRoadmaps = await axiosClient.get(`/roadmaps/user/${userId}`);
      if (!userRoadmaps?.length) return;

      const days = userRoadmaps[0].days || [];
      if (!days.length) return;

      const merged = localRoadmap.map(localDay => {
        const backendDay = days.find(d => d.day_number === localDay.dayId);
        if (!backendDay) return localDay;
        return {
          ...localDay,
          backendDayId: backendDay.id,
          status: backendDay.is_completed ? 'completed' : localDay.status
        };
      });

      const withStatuses = deriveStatuses(merged);
      const key = getRoadmapKey(userId);
      localStorage.setItem(key, JSON.stringify(withStatuses));
      set({ roadmapData: withStatuses });
    } catch { /* ignore, use local data */ }
  },

  _fetchOrCreate: async (userId) => {
    try {
      const userRoadmaps = await axiosClient.get(`/roadmaps/user/${userId}`);
      const saved = localStorage.getItem('user-data');
      const p = saved ? JSON.parse(saved) : {};
      const userData = { gender: p.gender || 'Nam', height: p.height || 170, weight: p.weight || 65, fitnessLevel: p.fitnessLevel || 'Mới bắt đầu', goal: p.goal || p.fitness_goal || 'Giữ dáng' };
      const exercises = await useExerciseStore.getState().fetchExercises();
      const localRoadmap = generateDynamicRoadmap(userData, exercises);

      if (userRoadmaps?.length) {
        const days = userRoadmaps[0].days || [];
        const merged = localRoadmap.map(localDay => {
          const bd = days.find(d => d.day_number === localDay.dayId);
          return bd ? { ...localDay, backendDayId: bd.id, status: bd.is_completed ? 'completed' : localDay.status } : localDay;
        });
        const withStatuses = deriveStatuses(merged);
        const key = getRoadmapKey(userId);
        localStorage.setItem(key, JSON.stringify(withStatuses));
        set({ roadmapData: withStatuses, initialized: true });
      } else {
        const key = getRoadmapKey(userId);
        localStorage.setItem(key, JSON.stringify(localRoadmap));
        set({ roadmapData: localRoadmap, initialized: true });
        get()._saveToBackend(userId, localRoadmap, userData.goal);
      }
    } catch {
      await get().generateRoadmap();
    }
  },

  _saveToBackend: async (userId, roadmap, goal) => {
    try {
      const created = await axiosClient.post('/roadmaps', { user_id: userId, goal });
      const roadmapId = created.id;
      const days = await Promise.all(
        roadmap.map(day =>
          axiosClient.post(`/roadmaps/${roadmapId}/days`, {
            day_number: day.dayId,
            challenge_name: day.quest || day.muscleGroup,
            duration: day.duration || 0,
            is_completed: false,
            kcal: day.kcal || 0,
            muscle_group: day.muscleGroup
          }).catch(() => null)
        )
      );

      // Store backendDayIds in local roadmap
      const key = getRoadmapKey(userId);
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = local.map(localDay => {
        const bd = days.find(d => d?.day_number === localDay.dayId);
        return bd ? { ...localDay, backendDayId: bd.id } : localDay;
      });
      localStorage.setItem(key, JSON.stringify(updated));
      set({ roadmapData: updated });
    } catch { /* backend unavailable, continue with local */ }
  }
}));

export default useRoadmapStore;
