import axiosClient from '../api/axiosClient';

// Gọi backend (Gemini) sinh lộ trình 28 ngày rồi chuyển về đúng schema roadmap local.
// Trả về mảng 28 ngày hoặc null nếu AI lỗi/bị hủy/kết quả không hợp lệ (caller fallback về generateDynamicRoadmap).
// `signal` (AbortSignal, tùy chọn): cho phép hủy giữa chừng khi người dùng chọn "dùng lộ trình mặc định".
export const fetchAiRoadmap = async (exercises, signal) => {
    try {
        // Gemini có thể mất 45-60s cho JSON 28 ngày, backend còn retry 1 lần khi 429/503 → nới timeout riêng
        const res = await axiosClient.post('/ai/generate-roadmap', {}, { timeout: 120000, signal });
        const days = res?.roadmap;
        if (!Array.isArray(days) || days.length !== 28) return null;

        const byName = new Map(
            (exercises || []).map(ex => [String(ex.name || '').trim().toLowerCase(), ex])
        );

        const roadmap = [];
        for (let i = 0; i < 28; i++) {
            const d = days[i] || {};
            const dayId = i + 1;
            const week = Math.floor(i / 7) + 1;
            const dayOfWeek = (i % 7) + 1;
            const planTitle = d.plan_title || 'LỘ TRÌNH AI';
            const chapter = `CHƯƠNG ${week}: ${planTitle}`;

            if (d.is_rest_day) {
                roadmap.push({
                    dayId, week, dayOfWeek,
                    isRestDay: true,
                    status: 'locked',
                    muscleGroup: 'NGHỈ NGƠI',
                    chapter,
                    quest: 'Phục hồi cơ bắp',
                    storyDesc: d.story_desc || 'Nạp lại năng lượng cho chặng đường tiếp theo.',
                    duration: 0,
                    kcal: 0,
                    exercises: []
                });
                continue;
            }

            // Khớp bài tập AI trả về với bài trong DB theo tên (bắt buộc khớp tuyệt đối:
            // camera đếm rep, ảnh và nhiệm vụ Daily đều so theo tên bài)
            const mapped = (d.exercises || [])
                .map(e => {
                    const local = byName.get(String(e?.name || '').trim().toLowerCase());
                    if (!local) return null;
                    const sets = parseInt(e.sets) || 3;
                    const reps = String(e.reps || '12');
                    return {
                        ...local,
                        sets,
                        reps,
                        rest: e.rest || '60s',
                        technical_description: local.desc,
                        estimated_calories_per_rep: local.kcalPerRep || 1.0,
                        safety_notes: local.safetyNotes || ''
                    };
                })
                .filter(Boolean);

            if (mapped.length === 0) return null; // ngày tập mà không khớp bài nào → dùng thuật toán local

            const totalKcal = mapped.reduce(
                (sum, ex) => sum + ex.estimated_calories_per_rep * (parseInt(ex.reps) || 15) * ex.sets, 0
            );

            roadmap.push({
                dayId, week, dayOfWeek,
                isRestDay: false,
                status: 'locked',
                muscleGroup: d.quest || 'TẬP LUYỆN',
                chapter,
                quest: d.quest || 'Thử thách hôm nay',
                storyDesc: d.story_desc || 'Hãy hoàn thành xuất sắc!',
                duration: parseInt(d.duration) || 45,
                kcal: Math.round(totalKcal) + 100, // cộng thêm calo trao đổi chất cơ bản như generator local
                exercises: mapped
            });
        }

        roadmap[0].status = 'active'; // giống generator local; deriveStatuses sẽ tính lại khi load
        return roadmap;
    } catch {
        return null;
    }
};
