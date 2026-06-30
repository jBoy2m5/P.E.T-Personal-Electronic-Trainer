export const exerciseDatabase = [
  // --- NGỰC (CHEST) ---
  { id: 101, name: 'Hít đất dựa tường / Quỳ gối', target: 'Ngực', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Ngực & Tay sau', kcalPerRep: 0.5, aiMode: 'PUSH-UP' },
  { id: 102, name: 'Hít đất dốc lên (Incline)', target: 'Ngực', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Ngực dưới & Vai', kcalPerRep: 0.8, aiMode: 'PUSH-UP' },
  { id: 103, name: 'Hít đất cơ bản (Standard)', target: 'Ngực', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Phát triển ngực toàn diện', kcalPerRep: 1.0, aiMode: 'PUSH-UP' },
  { id: 104, name: 'Diamond Pushups', target: 'Ngực', isJump: false, level: 'Khó', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Ngực trong & Tay sau', kcalPerRep: 1.2, aiMode: 'PUSH-UP' },
  { id: 105, name: 'Clapping Pushups', target: 'Ngực', isJump: true, level: 'Khó', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Ngực bộc phát', kcalPerRep: 1.5, aiMode: 'PUSH-UP' },

  // --- LƯNG (BACK) ---
  { id: 201, name: 'Nằm sấp trượt sàn kéo xô', target: 'Lưng', isJump: false, level: 'Cơ bản', img: 'https://plus.unsplash.com/premium_photo-1663100769321-9eb8fe5a8e6b?q=80&w=600', desc: 'Lưng xô', kcalPerRep: 0.6, aiMode: null },
  { id: 202, name: 'Towel Rows', target: 'Lưng', isJump: false, level: 'Trung bình', img: 'https://plus.unsplash.com/premium_photo-1663100769321-9eb8fe5a8e6b?q=80&w=600', desc: 'Lưng giữa', kcalPerRep: 0.8, aiMode: null },
  { id: 203, name: 'Superman Holds', target: 'Lưng', isJump: false, level: 'Cơ bản', img: 'https://plus.unsplash.com/premium_photo-1663100769321-9eb8fe5a8e6b?q=80&w=600', desc: 'Lưng dưới (Tính bằng giây)', kcalPerRep: 0.2, aiMode: null },
  { id: 204, name: 'Table Inverted Rows', target: 'Lưng', isJump: false, level: 'Khó', img: 'https://plus.unsplash.com/premium_photo-1663100769321-9eb8fe5a8e6b?q=80&w=600', desc: 'Kéo gầm bàn', kcalPerRep: 1.2, aiMode: null },

  // --- VAI & TAY (SHOULDERS & ARMS) ---
  { id: 301, name: 'Scapula Pushups', target: 'Vai', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Nhún bả vai', kcalPerRep: 0.5, aiMode: null },
  { id: 302, name: 'Pike Pushups', target: 'Vai', isJump: false, level: 'Khó', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Vai & Triceps', kcalPerRep: 1.2, aiMode: null },
  { id: 401, name: 'Bench Dips', target: 'Tay', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', desc: 'Nhún tay sau trên ghế', kcalPerRep: 0.8, aiMode: null },

  // --- CHÂN (LEGS) ---
  { id: 601, name: 'Squat cơ bản', target: 'Chân', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', desc: 'Đùi & Mông', kcalPerRep: 1.2, aiMode: 'SQUAT' },
  { id: 602, name: 'Reverse Lunges', target: 'Chân', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600', desc: 'Bước lùi gập gối', kcalPerRep: 1.0, aiMode: null },
  { id: 603, name: 'Squat chạm ghế', target: 'Chân', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', desc: 'Chân an toàn', kcalPerRep: 1.0, aiMode: null },
  { id: 604, name: 'Forward Lunges', target: 'Chân', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600', desc: 'Bước tới', kcalPerRep: 1.2, aiMode: null },
  { id: 605, name: 'Bulgarian Split Squats', target: 'Chân', isJump: false, level: 'Khó', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', desc: 'Đùi trước', kcalPerRep: 1.5, aiMode: null },
  { id: 606, name: 'Jump Squats', target: 'Chân', isJump: true, level: 'Khó', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600', desc: 'Bộc phát đùi', kcalPerRep: 1.8, aiMode: null },
  { id: 607, name: 'Jumping Lunges', target: 'Chân', isJump: true, level: 'Khó', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600', desc: 'Bộc phát toàn diện', kcalPerRep: 2.0, aiMode: null },
  { id: 608, name: 'Calf Raises', target: 'Chân', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', desc: 'Nhón gót', kcalPerRep: 0.3, aiMode: null },

  // --- MÔNG (GLUTES) ---
  { id: 701, name: 'Glute Bridges', target: 'Mông', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600', desc: 'Đá mông ngửa', kcalPerRep: 0.8, aiMode: null },
  { id: 702, name: 'Donkey Kicks', target: 'Mông', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600', desc: 'Đá mông sau', kcalPerRep: 0.7, aiMode: null },
  { id: 703, name: 'Single-leg Glute Bridge', target: 'Mông', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600', desc: 'Mông 1 chân', kcalPerRep: 1.0, aiMode: null },

  // --- BỤNG / CORE ---
  { id: 501, name: 'Plank cơ bản', target: 'Core', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Giữ tính tĩnh', kcalPerRep: 0.2, aiMode: 'PLANK' },
  { id: 502, name: 'Crunches', target: 'Core', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Gập bụng', kcalPerRep: 0.5, aiMode: null },
  { id: 503, name: 'Bicycle Crunches', target: 'Core', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Đạp xe chéo góc', kcalPerRep: 0.6, aiMode: null },
  { id: 504, name: 'Knee Inchworms', target: 'Core', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Đi bộ tay trên gối', kcalPerRep: 0.8, aiMode: null },
  { id: 505, name: 'Plank Shoulder Taps', target: 'Core', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Plank chạm vai', kcalPerRep: 0.5, aiMode: 'PLANK' },
  { id: 506, name: 'Side Plank', target: 'Core', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Plank nghiêng', kcalPerRep: 0.2, aiMode: null },
  { id: 507, name: 'Lying Leg Raises', target: 'Core', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Bụng dưới', kcalPerRep: 0.6, aiMode: null },
  { id: 508, name: 'Hollow Body Hold', target: 'Core', isJump: false, level: 'Khó', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Core vững', kcalPerRep: 0.3, aiMode: null },
  { id: 509, name: 'V-Ups', target: 'Core', isJump: false, level: 'Khó', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Gập chữ V', kcalPerRep: 0.8, aiMode: null },
  { id: 510, name: 'L-Sit Tucks', target: 'Core', isJump: false, level: 'Khó', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', desc: 'Thăng bằng core', kcalPerRep: 1.0, aiMode: null },

  // --- CARDIO ---
  { id: 801, name: 'Shadow Boxing', target: 'Cardio', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1509983611558-be5224618779?q=80&w=600', desc: 'Đấm bóng mờ', kcalPerRep: 0.4, aiMode: null },
  { id: 802, name: 'High Knees (không nhảy)', target: 'Cardio', isJump: false, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600', desc: 'Bước tại chỗ', kcalPerRep: 0.5, aiMode: null },
  { id: 803, name: 'Mountain Climbers', target: 'Cardio', isJump: false, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600', desc: 'Leo núi sàn', kcalPerRep: 0.6, aiMode: null },
  { id: 804, name: 'Burpees', target: 'Cardio', isJump: true, level: 'Khó', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600', desc: 'Cardio toàn thân', kcalPerRep: 2.5, aiMode: null }
];
