import { create } from 'zustand';

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
      const goal = saved ? JSON.parse(saved).fitness_goal : 'Tăng cơ nạc';

      const weeks = 4;
      const daysPerWeek = 7;
      const roadmap = [];
      let globalDay = 1;
      const isFatLoss = goal.toLowerCase().includes('giảm');

      const muscleList = ['Ngực & Tay sau', 'Lưng & Tay trước', 'Chân & Mông', 'Vai & Bụng', 'Full Body'];

      const getStoryForDay = (globalDay, muscleGroup, isRest) => {
         const chapterIndex = Math.floor((globalDay - 1) / 7);
         const chapters = [
            "CHƯƠNG 1: LÀNG TÂN THỦ",
            "CHƯƠNG 2: RỪNG THỬ THÁCH",
            "CHƯƠNG 3: ĐỈNH NÚI Ý CHÍ",
            "CHƯƠNG 4: LÂU ĐÀI VÔ CỰC"
         ];
         const chapter = chapters[chapterIndex] || "CHƯƠNG BÍ ẨN";
         
         if (isRest) return { chapter, quest: "Trạm nghỉ chân", desc: "Dừng chân tại tửu quán, hồi phục sinh lực và kiểm tra hành trang để chuẩn bị cho trận chiến tiếp theo." };

         const quests = {
            "Ngực & Tay sau": { quest: "Phá vỡ Khiên Cổ Đại", desc: "Dùng sức mạnh thân trên đập vỡ lớp khiên cản đường của binh đoàn Mỡ Thừa." },
            "Lưng & Tay trước": { quest: "Kéo sập Tường Thành", desc: "Tập trung lực kéo vững chắc để hạ bệ chướng ngại vật khổng lồ." },
            "Chân & Mông": { quest: "Vượt qua Đầm Lầy", desc: "Sức mạnh đôi chân là thứ duy nhất giúp bạn thoát khỏi vũng lầy của sự lười biếng." },
            "Vai & Bụng": { quest: "Đỡ Cột Trụ Trời", desc: "Cốt lõi vững chắc sẽ giúp bạn chống đỡ lại áp lực ngàn cân đang ập tới." },
            "Full Body": { quest: "Trận chiến Sinh Tử", desc: "Vận dụng mọi nhóm cơ để đánh bại quái vật gác cổng mạnh nhất của khu vực." },
            "Cardio & Core": { quest: "Chạy trốn Quái Thú", desc: "Tốc độ nhịp tim và sức bền là chìa khóa để sống sót qua vòng vây này." }
         };

         const story = quests[muscleGroup] || { quest: "Huấn luyện Đặc biệt", desc: "Đối mặt với những thử thách bí ẩn trong sương mù." };
         return { chapter, ...story };
      };

      for (let w = 1; w <= weeks; w++) {
        for (let d = 1; d <= daysPerWeek; d++) {
          const isRest = d === 4 || d === 7;
          let status = 'locked';

          // Mock data: Assume user is currently on day 4
          if (globalDay < 4) status = 'completed';
          else if (globalDay === 4) status = 'active';

          const muscleGroup = isRest ? 'NGHỈ NGƠI' : (isFatLoss ? 'Cardio & Core' : muscleList[(globalDay - 1) % muscleList.length]);
          const story = getStoryForDay(globalDay, muscleGroup, isRest);

          roadmap.push({
            dayId: globalDay,
            week: w,
            dayOfWeek: d,
            isRestDay: isRest,
            status: status,
            muscleGroup: muscleGroup,
            chapter: story.chapter,
            quest: story.quest,
            storyDesc: story.desc,
            duration: isRest ? 0 : (isFatLoss ? 45 : 60),
            kcal: isRest ? 0 : (isFatLoss ? 500 : 350),
          });
          globalDay++;
        }
      }
      
      localStorage.setItem('roadmap-data', JSON.stringify(roadmap));
      set({ roadmapData: roadmap, initialized: true });
  }
}));

export default useRoadmapStore;
