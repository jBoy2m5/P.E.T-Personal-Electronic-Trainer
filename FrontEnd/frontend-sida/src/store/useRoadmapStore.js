import { create } from 'zustand';

const useRoadmapStore = create((set, get) => ({
  roadmapData: [],
  initialized: false,
  
  loadRoadmap: async () => {
    try {
      // Lazy load axiosClient to avoid circular dependency if any
      const { default: axiosClient } = await import('../api/axiosClient');
      
      const response = await axiosClient.get('/roadmaps/my-roadmap');
      
      if (response && response.days && response.days.length > 0) {
        let firstUncompletedFound = false;
        
        const mappedRoadmap = response.days.map((day) => {
          const globalDay = day.dayNumber;
          const isRest = day.muscleGroup.toLowerCase().includes('nghỉ') || day.muscleGroup.toLowerCase().includes('rest');
          
          let status = 'locked';
          if (day.isCompleted) {
            status = 'completed';
          } else if (!firstUncompletedFound) {
            status = 'active';
            firstUncompletedFound = true;
          }

          // Calculate chapter (7 days per chapter)
          const chapterIndex = Math.floor((globalDay - 1) / 7);
          const chapters = [
            "CHƯƠNG 1: LÀNG TÂN THỦ",
            "CHƯƠNG 2: RỪNG THỬ THÁCH",
            "CHƯƠNG 3: ĐỈNH NÚI Ý CHÍ",
            "CHƯƠNG 4: LÂU ĐÀI VÔ CỰC"
          ];
          const chapter = chapters[chapterIndex] || "CHƯƠNG BÍ ẨN";

          return {
            dbId: day.id,
            dayId: globalDay,
            week: Math.floor((globalDay - 1) / 7) + 1,
            dayOfWeek: ((globalDay - 1) % 7) + 1,
            isRestDay: isRest,
            status: status,
            muscleGroup: day.muscleGroup,
            chapter: chapter,
            quest: day.challengeName,
            storyDesc: isRest ? "Nghỉ ngơi phục hồi cơ bắp để chuẩn bị cho thử thách tiếp theo." : "Hoàn thành bài tập để chinh phục thử thách này.",
            duration: day.duration || 0,
            kcal: day.kcal || 0,
          };
        });
        
        set({ roadmapData: mappedRoadmap, initialized: true });
      } else {
        // Fallback or handle missing roadmap
        set({ roadmapData: [], initialized: true });
      }
    } catch (error) {
      console.error("Failed to load roadmap from API:", error);
      // Fallback to empty
      set({ roadmapData: [], initialized: true });
    }
  },

  generateRoadmap: () => {
      // Deprecated since generation is now done on the backend
      get().loadRoadmap();
  }
}));

export default useRoadmapStore;
