// Bản tiếng Anh cho bộ tên cố định của generator local — export để Roadmap/DailyWorkout
// dịch được cả các lộ trình cũ đã cache trong localStorage (sinh trước khi có field *En)
export const PLAN_TITLE_EN = {
    'THỂ THAO ĐƯỜNG PHỐ': 'STREET WORKOUT',
    'TÔN DÁNG CƠ BẢN': 'BASIC TONING',
    'TÂN BINH KIẾN TẠO': 'ROOKIE FOUNDATION',
    'ĐỐT MỠ AN TOÀN': 'SAFE FAT BURN',
    'ĐỘ BODY NÂNG CAO': 'ADVANCED BODY SCULPT',
    'CHIẾN BINH PHÌ ĐẠI': 'HYPERTROPHY WARRIOR'
};

export const SPLIT_NAME_EN = {
    'Core & Thăng Bằng': 'Core & Balance',
    'Kéo Xà & Tay': 'Pull-ups & Arms',
    'Sức Mạnh Chân': 'Leg Strength',
    'Thân Trên & Cardio': 'Upper Body & Cardio',
    'Thân Dưới & Core': 'Lower Body & Core',
    'Thân Trên B': 'Upper Body B',
    'Thân Dưới B': 'Lower Body B',
    'Toàn Thân Nữ': 'Full Body (Women)',
    'Ngày Đùi & Mông': 'Legs & Glutes Day',
    'Ngày Lưng & Bụng': 'Back & Abs Day',
    'Ngày Mông Toàn Diện': 'Total Glutes Day',
    'Ngày Ngực & Cardio': 'Chest & Cardio Day',
    'Toàn Thân Nam': 'Full Body (Men)',
    'Ngày Đẩy (Push)': 'Push Day',
    'Ngày Kéo (Pull)': 'Pull Day',
    'Ngày Chân (Legs)': 'Leg Day',
    'Toàn Thân (Bơm Máu)': 'Full Body Pump',
    'Phục hồi cơ bắp': 'Muscle Recovery',
    'NGHỈ NGƠI': 'REST'
};

const TARGET_EN = {
    'Ngực': 'Chest', 'Lưng': 'Back', 'Vai': 'Shoulders', 'Tay': 'Arms',
    'Chân': 'Legs', 'Mông': 'Glutes', 'Core': 'Core', 'Cardio': 'Cardio'
};

export const generateDynamicRoadmap = (userData, exercises = []) => {
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
            let pool = exercises.filter(ex => ex.target === target);
            
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
            let status = globalDay === 1 ? 'active' : 'locked';

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
                    muscleGroupEn: SPLIT_NAME_EN[split.name] || split.name,
                    chapter: `CHƯƠNG ${w}: ${planTitle}`,
                    chapterEn: `CHAPTER ${w}: ${PLAN_TITLE_EN[planTitle] || planTitle}`,
                    quest: split.name,
                    questEn: SPLIT_NAME_EN[split.name] || split.name,
                    storyDesc: `Mục tiêu hôm nay: ${split.targets.join(', ')}. Hãy hoàn thành xuất sắc!`,
                    storyDescEn: `Today's focus: ${split.targets.map(tg => TARGET_EN[tg] || tg).join(', ')}. Give it your best!`,
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
                    muscleGroupEn: 'REST',
                    chapter: `CHƯƠNG ${w}: ${planTitle}`,
                    chapterEn: `CHAPTER ${w}: ${PLAN_TITLE_EN[planTitle] || planTitle}`,
                    quest: 'Phục hồi cơ bắp',
                    questEn: 'Muscle Recovery',
                    storyDesc: 'Nạp lại năng lượng cho chặng đường tiếp theo.',
                    storyDescEn: 'Recharge your energy for the next stage.',
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
