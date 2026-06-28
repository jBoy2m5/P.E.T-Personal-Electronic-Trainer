import { exerciseDatabase } from '../data/exerciseDatabase';

export const generateDynamicRoadmap = (userData) => {
    const isBeginner = userData.fitnessLevel === 'Mới bắt đầu' || userData.fitnessLevel === 'Đã có nền tảng';
    const isFatLoss = userData.goal.toLowerCase().includes('giảm');
    const isSkills = userData.goal.toLowerCase().includes('kĩ năng');
    const isFemale = userData.gender === 'Nữ';
    const heightM = (userData.height || 170) / 100;
    const bmi = (userData.weight || 65) / (heightM * heightM);
    const isOverweight = bmi > 25;

    // 1. Determine Frequency & Days
    let workDays = []; // 0-indexed day in a week (0 to 6 for Mon to Sun)
    let planTitle = '';
    
    if (isSkills) {
        workDays = [0, 2, 4]; // 3 days
        planTitle = "THỂ THAO ĐƯỜNG PHỐ";
    } else if (isBeginner) {
        workDays = [0, 2, 4]; // 3 days
        planTitle = isFemale ? "TÔN DÁNG CƠ BẢN" : "TÂN BINH KIẾN TẠO";
    } else {
        workDays = [0, 1, 3, 4]; // 4 days
        planTitle = isFatLoss ? "ĐỐT MỠ AN TOÀN" : (isFemale ? "ĐỘ BODY NÂNG CAO" : "CHIẾN BINH PHÌ ĐẠI");
    }

    // 2. Determine Splits
    const getSplitForDay = (workDayIndex) => {
        if (isSkills) {
            const splits = [
                { name: 'Core & Thăng Bằng', targets: ['Core', 'Vai'] },
                { name: 'Kéo Xà & Tay', targets: ['Lưng', 'Tay'] },
                { name: 'Sức Mạnh Chân', targets: ['Chân', 'Cardio'] }
            ];
            return splits[workDayIndex] || splits[0];
        }

        if (isFatLoss || isOverweight) {
            const splits = [
                { name: 'Thân Trên & Cardio', targets: ['Ngực', 'Lưng', 'Cardio'] },
                { name: 'Thân Dưới & Core', targets: ['Chân', 'Mông', 'Core'] },
                { name: 'Thân Trên B', targets: ['Vai', 'Tay', 'Core'] },
                { name: 'Thân Dưới B', targets: ['Chân', 'Cardio', 'Core'] }
            ];
            return splits[workDayIndex] || splits[0];
        }

        if (isFemale) {
            if (isBeginner) {
                return { name: 'Toàn Thân Nữ', targets: ['Chân', 'Mông', 'Ngực', 'Core'] };
            } else {
                const splits = [
                    { name: 'Ngày Đùi & Mông', targets: ['Chân', 'Mông'] },
                    { name: 'Ngày Lưng & Bụng', targets: ['Lưng', 'Core'] },
                    { name: 'Ngày Mông Toàn Diện', targets: ['Mông', 'Chân', 'Core'] },
                    { name: 'Ngày Ngực & Cardio', targets: ['Ngực', 'Vai', 'Cardio'] }
                ];
                return splits[workDayIndex] || splits[0];
            }
        } else {
            if (isBeginner) {
                return { name: 'Toàn Thân Nam', targets: ['Ngực', 'Lưng', 'Chân', 'Core'] };
            } else {
                const splits = [
                    { name: 'Ngày Đẩy (Push)', targets: ['Ngực', 'Vai', 'Tay'] },
                    { name: 'Ngày Kéo (Pull)', targets: ['Lưng', 'Tay', 'Core'] },
                    { name: 'Ngày Chân (Legs)', targets: ['Chân', 'Mông', 'Core'] },
                    { name: 'Toàn Thân (Bơm Máu)', targets: ['Ngực', 'Chân', 'Cardio'] }
                ];
                return splits[workDayIndex] || splits[0];
            }
        }
    };

    // 3. Exercise Picker Algorithm
    const pickExercises = (targets, workDayIndex) => {
        let picked = [];
        let usedIds = new Set();

        targets.forEach(target => {
            // Filter pool
            let pool = exerciseDatabase.filter(ex => ex.target === target);
            
            // Modifier: No Jumps if Overweight
            if (isOverweight) {
                pool = pool.filter(ex => !ex.isJump);
            }

            // Modifier: Level matching
            let levelPool = pool.filter(ex => isBeginner ? ex.level === 'Cơ bản' : ex.level !== 'Cơ bản');
            if (levelPool.length === 0) levelPool = pool; // fallback

            // Pick 1-2 random (using deterministic pseudo-random based on workDayIndex to keep it stable)
            if (levelPool.length > 0) {
                const index1 = (workDayIndex + userData.height) % levelPool.length;
                const ex1 = levelPool[index1];
                if (!usedIds.has(ex1.id)) {
                    picked.push({...ex1});
                    usedIds.add(ex1.id);
                }

                // If target is main focus (e.g., Legs for Female, Chest for Male), add a second exercise
                if ((target === 'Chân' || target === 'Mông') && isFemale && levelPool.length > 1) {
                    const index2 = (index1 + 1) % levelPool.length;
                    const ex2 = levelPool[index2];
                    if (!usedIds.has(ex2.id)) { picked.push({...ex2}); usedIds.add(ex2.id); }
                }
                if ((target === 'Ngực' || target === 'Lưng') && !isFemale && levelPool.length > 1) {
                    const index2 = (index1 + 1) % levelPool.length;
                    const ex2 = levelPool[index2];
                    if (!usedIds.has(ex2.id)) { picked.push({...ex2}); usedIds.add(ex2.id); }
                }
            }
        });

        // 4. Assign Volume
        picked = picked.map(ex => {
            let sets = isBeginner ? 3 : 4;
            let reps = "12";
            
            if (ex.target === 'Cardio' || ex.target === 'Core') {
                reps = isFatLoss ? "45s" : "30s";
            } else if (isFatLoss) {
                reps = "15-20";
            } else {
                if (isFemale && (ex.target === 'Ngực' || ex.target === 'Vai' || ex.target === 'Tay')) {
                    reps = "8-10"; // Lower reps for upper body for females
                } else if (!isFemale && (ex.target === 'Chân' || ex.target === 'Mông')) {
                    reps = "10-12";
                } else {
                    reps = "12-15"; // Hypertrophy
                }
            }
            
            return {
                ...ex,
                sets,
                reps,
                rest: isFatLoss ? '45s' : '60s',
                technical_description: ex.desc,
                estimated_calories_per_rep: ex.kcalPerRep || 1.0,
                safety_notes: isOverweight && ex.isJump ? 'Bỏ qua bật nhảy' : ''
            };
        });

        return picked;
    };

    // Assemble 28-day Roadmap
    const weeks = 4;
    const daysPerWeek = 7;
    const roadmap = [];
    let globalDay = 1;

    for (let w = 1; w <= weeks; w++) {
        let workDayCount = 0;
        for (let d = 0; d < daysPerWeek; d++) {
            const isWorkDay = workDays.includes(d);
            let status = 'locked';
            
            // Mock current day logic
            if (globalDay < 4) status = 'completed';
            else if (globalDay === 4) status = 'active';

            if (isWorkDay) {
                const split = getSplitForDay(workDayCount);
                const exercises = pickExercises(split.targets, workDayCount + w);
                
                let totalKcal = exercises.reduce((sum, ex) => sum + (ex.estimated_calories_per_rep * parseInt(ex.reps || 15) * ex.sets), 0);

                roadmap.push({
                    dayId: globalDay,
                    week: w,
                    dayOfWeek: d + 1,
                    isRestDay: false,
                    status: status,
                    muscleGroup: split.name,
                    chapter: `CHƯƠNG ${w}: ${planTitle}`,
                    quest: split.name,
                    storyDesc: `Mục tiêu hôm nay: ${split.targets.join(', ')}. Hãy hoàn thành xuất sắc!`,
                    duration: isFatLoss ? 40 : 50,
                    kcal: Math.round(totalKcal) + 100, // add base metabolic rate during workout
                    exercises: exercises // Injecting dynamic exercises directly!
                });
                workDayCount++;
            } else {
                roadmap.push({
                    dayId: globalDay,
                    week: w,
                    dayOfWeek: d + 1,
                    isRestDay: true,
                    status: status,
                    muscleGroup: 'NGHỈ NGƠI',
                    chapter: `CHƯƠNG ${w}: ${planTitle}`,
                    quest: 'Phục hồi cơ bắp',
                    storyDesc: 'Nạp lại năng lượng cho chặng đường tiếp theo.',
                    duration: 0,
                    kcal: 0,
                    exercises: []
                });
            }
            globalDay++;
        }
    }

    return roadmap;
};
