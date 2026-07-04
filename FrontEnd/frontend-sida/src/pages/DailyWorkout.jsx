import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import usePetStore from '../store/usePetStore';
import useRoadmapStore from '../store/useRoadmapStore';
import useExerciseStore from '../store/useExerciseStore';
import { SPLIT_NAME_EN } from '../services/roadmapGenerator';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { getScheduleKey, getSessionsKey } from '../utils/userStorage';
import petChatbot from '../assets/pet_chatbot.png';

const PET_ICONS_LIST = ['🥚','🐣','🐥','🐕','🦁','🐉','🦄','⭐'];
const PET_THRESHOLDS_LIST = [0, 10, 50, 150, 300, 600, 1200, 2500];
const MIN_MS_PER_REP = 500; // ngưỡng nhịp độ hợp lý tối thiểu — set nhanh hơn mức này bị coi là đối phó

const getAiMode = (ex) => ex?.aiMode || null;


const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const markDayAsTrained = (exerciseTitle) => {
    const key = getTodayKey();
    const saved = localStorage.getItem(getScheduleKey());
    const scheduleData = saved ? JSON.parse(saved) : {};

    const existing = scheduleData[key] || { trained: false, note: '', completedExercises: [] };
    existing.trained = true;

    if (!existing.completedExercises) existing.completedExercises = [];
    if (!existing.completedExercises.includes(exerciseTitle)) {
        existing.completedExercises.push(exerciseTitle);
    }
    existing.note = `Trained: ${existing.completedExercises.join(', ')}`;

    scheduleData[key] = existing;
    localStorage.setItem(getScheduleKey(), JSON.stringify(scheduleData));

    window.dispatchEvent(new Event('storage'));
};

const getCompletedToday = () => {
    const key = getTodayKey();
    const saved = localStorage.getItem(getScheduleKey());
    if (!saved) return [];
    const data = JSON.parse(saved);
    return data[key]?.completedExercises || [];
};

const saveSessionToLocal = (kcal, reps, sets, startMs) => {
    const sessionData = {
        start_time: new Date(startMs).toISOString().slice(0, 19),
        end_time: new Date().toISOString().slice(0, 19),
        total_calories_burned: kcal,
        total_valid_reps: reps * sets
    };
    const saved = JSON.parse(localStorage.getItem(getSessionsKey()) || '[]');
    saved.push(sessionData);
    localStorage.setItem(getSessionsKey(), JSON.stringify(saved));
    window.dispatchEvent(new Event('storage'));
};


export default function DailyWorkout() {
    const navigate = useNavigate();
    const { dayId } = useParams();
    const { t, i18n } = useTranslation();
    const isVi = (i18n.language || '').toLowerCase().startsWith('vi');
    const [completedExercises, setCompletedExercises] = useState(getCompletedToday());
    const [dailyData, setDailyData] = useState(null);
    const addExp = usePetStore(state => state.addExp);
    const triggerPetReaction = usePetStore(state => state.triggerPetReaction);
    const markDayComplete = useRoadmapStore(state => state.markDayComplete);
    const roadmapData = useRoadmapStore(state => state.roadmapData);
    const roadmapInitialized = useRoadmapStore(state => state.initialized);
    const loadRoadmap = useRoadmapStore(state => state.loadRoadmap);
    const totalPoints = usePetStore(state => state.totalPoints);
    const lastCheckinDate = usePetStore(state => state.lastCheckinDate);
    const isSadFn = usePetStore(state => state.isSad);
    const petIsSad = isSadFn();
    const petIcon = petIsSad ? '😢' : (PET_ICONS_LIST[PET_THRESHOLDS_LIST.filter(th => totalPoints >= th).length - 1] || '🥚');
    // States cho AI Camera Modal
    const [showAIModal, setShowAIModal] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [simReps, setSimReps] = useState(0);
    const [simSets, setSimSets] = useState(1);
    const [targetReps, setTargetReps] = useState(0);
    const [targetSets, setTargetSets] = useState(0);
    const [aiStatus, setAiStatus] = useState('');
    const [repReward, setRepReward] = useState(0); // tăng mỗi rep hợp lệ → kích hoạt pet pop + tim ngay trong khung camera

    // AI Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const needsResetRef = useRef(true); // báo AI server reset bộ đếm khi bắt đầu Set mới
    const setStartTimeRef = useRef(0); // chống đối phó: set hoàn thành quá nhanh so với target
    const suspiciousSetsRef = useRef(0);
    const lastRepsRef = useRef(0); // theo dõi rep hợp lệ mới để pet phản ứng real-time
    const lastRepTimeRef = useRef(0); // chống đối phó: khoảng cách giữa 2 rep liên tiếp quá nhanh

    // States cho Detailed Exercise Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [workoutMode, setWorkoutMode] = useState('reps');
    const [customTarget, setCustomTarget] = useState(0);
    const [customSets, setCustomSets] = useState(1);

    // States cho Manual Workout Tracker
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualTimeLeft, setManualTimeLeft] = useState(0);
    const [manualTotalTime, setManualTotalTime] = useState(0);
    const [manualCurrentSet, setManualCurrentSet] = useState(1);
    const [manualIsResting, setManualIsResting] = useState(false);
    const [manualIsWaiting, setManualIsWaiting] = useState(true);
    const [manualCountdown, setManualCountdown] = useState(null);

    // States cho Workout Summary Modal
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryData, setSummaryData] = useState(null);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    // Lộ trình lấy qua useRoadmapStore (key roadmap-data-{userId}), không đọc thẳng localStorage key cũ
    useEffect(() => {
        if (!roadmapInitialized) loadRoadmap();
    }, [roadmapInitialized, loadRoadmap]);

    useEffect(() => {
        let dayInfo = {
            dayId: dayId,
            muscleGroup: 'Full Body',
            duration: 45,
            kcal: 350
        };

        const found = (roadmapData || []).find(d => d.dayId.toString() === dayId);
        if (found) dayInfo = found;

        const savedUser = localStorage.getItem('user-data');
        const parsedUser = savedUser ? JSON.parse(savedUser) : {};
        const goal = parsedUser.goal || parsedUser.fitness_goal || 'Tăng cơ nạc';

        const mgTranslations = {
            'NGỰC (CHEST)': 'mg_chest',
            'LƯNG (BACK)': 'mg_back',
            'VAI (SHOULDERS)': 'mg_shoulders',
            'TAY (ARMS)': 'mg_arms',
            'BỤNG (ABS)': 'mg_abs',
            'CHÂN (LEGS)': 'mg_legs',
            'MÔNG (GLUTES)': 'mg_glutes',
            'TOÀN THÂN (FULL BODY)': 'mg_fullbody',
            'CARDIO & BỤNG': 'mg_cardio',
            'NGHỈ NGƠI': 'mg_rest',
            'Full Body': 'mg_fullbody'
        };

        const goalTranslations = {
            'Tăng cơ nạc': 'goal_muscle',
            'Giảm mỡ': 'goal_fatloss',
            'Duy trì vóc dáng': 'goal_maintain',
            'Cải thiện sức khỏe': 'goal_health'
        };

        // Tên buổi tập theo ngôn ngữ: EN ưu tiên field muscleGroupEn (lộ trình mới) rồi từ điển
        // generator local (cache cũ); tên lạ (Gemini đặt) giữ nguyên thay vì ép về "Toàn thân"
        const mgKey = mgTranslations[dayInfo.muscleGroup];
        const translatedGroup = !isVi && (dayInfo.muscleGroupEn || SPLIT_NAME_EN[dayInfo.muscleGroup])
            ? (dayInfo.muscleGroupEn || SPLIT_NAME_EN[dayInfo.muscleGroup])
            : (mgKey ? t(`roadmap_data.${mgKey}`, dayInfo.muscleGroup) : dayInfo.muscleGroup);
        const translatedGoal = t(`daily_workout.${goalTranslations[goal] || 'goal_muscle'}`, goal);

        const buildDailyData = (exList) => {
            // Tính toán thời lượng động nếu backend trả về 0
            let calculatedDuration = 0;
            if (exList && exList.length > 0) {
                exList.forEach(ex => {
                    const reps = parseInt(ex.reps) || 12;
                    const sets = parseInt(ex.sets) || 3;
                    // Nếu reps > 30 thường là bài tập tính bằng giây (vd: Plank 60s), nếu không thì tính 4s/rep
                    const timePerSet = reps > 30 ? reps : reps * 4;
                    const restTimePerSet = 45; // 45s nghỉ giữa các set
                    calculatedDuration += (timePerSet * sets) + ((sets - 1) * restTimePerSet);
                });
                // 60s nghỉ giữa các bài tập khác nhau
                calculatedDuration += (exList.length - 1) * 60;
            }
            const totalMinutes = Math.ceil(calculatedDuration / 60) || 0;
            const finalDuration = dayInfo.duration && dayInfo.duration > 0 ? dayInfo.duration : totalMinutes;

            setDailyData({
                ...dayInfo,
                duration: finalDuration,
                goal: goal,
                translatedGoal: translatedGoal,
                translatedGroup: translatedGroup,
                benefits: t('daily_workout.benefits_default', { group: translatedGroup.toLowerCase() }),
                exercises: exList,
                difficulty: dayInfo.muscleGroup === 'Full Body' ? 4 : 3
            });
        };

        if (dayInfo.exercises && dayInfo.exercises.length > 0) {
            // Ghép ảnh/mô tả mới nhất từ server theo tên bài — roadmap cache trong localStorage
            // có thể được sinh trước khi DB có media_url nên thiếu ảnh
            useExerciseStore.getState().fetchExercises().then(all => {
                const byName = new Map(all.map(e => [(e.name || '').toLowerCase(), e]));
                buildDailyData(dayInfo.exercises.map(ex => {
                    const server = byName.get((ex.name || '').toLowerCase());
                    const kcalPerRep = ex.estimated_calories_per_rep || ex.kcalPerRep || server?.kcalPerRep || 1;
                    return {
                        ...ex,
                        exercise_id: ex.exercise_id || ex.id || server?.id,
                        img: server?.img || ex.img,
                        technical_description: ex.technical_description || ex.desc || server?.desc,
                        technical_description_vi: ex.technical_description_vi || ex.descVi || server?.descVi,
                        safety_notes: ex.safety_notes || server?.safetyNotes,
                        safety_notes_vi: ex.safety_notes_vi || ex.safetyNotesVi || server?.safetyNotesVi,
                        estimated_calories_per_rep: kcalPerRep,
                        aiMode: ex.aiMode || server?.aiMode,
                        kcal: ex.kcal ?? Math.round(kcalPerRep * parseInt(ex.reps || 12) * (ex.sets || 3))
                    };
                }));
            });
        } else {
            // Không có bài trong lộ trình cho ngày này → lấy bài tập từ server (DB) thay vì data tự tạo
            useExerciseStore.getState().fetchExercises().then(all => {
                const basics = all.filter(e => e.level === 'Cơ bản');
                const picked = (basics.length >= 4 ? basics : all).slice(0, 4).map(e => {
                    const reps = 12, sets = 3;
                    return {
                        exercise_id: e.id,
                        name: e.name,
                        reps: String(reps),
                        sets: String(sets),
                        kcal: Math.round((e.kcalPerRep || 1) * reps * sets),
                        level: e.level,
                        img: e.img,
                        technical_description: e.desc,
                        technical_description_vi: e.descVi,
                        safety_notes: e.safetyNotes,
                        safety_notes_vi: e.safetyNotesVi,
                        estimated_calories_per_rep: e.kcalPerRep,
                        aiMode: e.aiMode
                    };
                });
                buildDailyData(picked);
            });
        }
    }, [dayId, t, isVi, roadmapData]);

    const handleOpenDetail = (exercise) => {
        if (completedExercises.includes(exercise.name)) return;
        setSelectedDetail(exercise);
        setWorkoutMode('reps');
        setCustomTarget(parseInt(exercise.reps));
        setCustomSets(parseInt(exercise.sets) || 1);
        setShowDetailModal(true);
    };

    const handleStartFromDetail = (useAI) => {
        if (!selectedDetail) return;
        setCurrentExercise(selectedDetail);
        
        let reps = customTarget;
        let sets = customSets;

        if (workoutMode === 'reps') {
            setTargetReps(reps);
            setTargetSets(sets);
        } else {
            setTargetReps(customTarget);
            setTargetSets(sets);
        }
        
        setSimReps(0);
        setSimSets(1);
        setShowDetailModal(false);
        
        if (useAI) {
            setAiStatus(t('exercise_list.ai_starting', 'Đang khởi động Camera AI...'));
            setShowAIModal(true);
        } else {
            const setTime = workoutMode === 'reps' ? customTarget * 2 : customTarget;
            setManualCurrentSet(1);
            setManualTimeLeft(setTime);
            setManualTotalTime(setTime);
            setManualIsResting(false);
            setManualIsWaiting(true);
            setManualCountdown(null);
            setShowManualModal(true);
        }
    };

    useEffect(() => {
        let countdownTimer;
        if (manualCountdown !== null && manualCountdown > 0) {
            countdownTimer = setTimeout(() => {
                setManualCountdown(prev => prev - 1);
            }, 1000);
        } else if (manualCountdown === 0) {
            countdownTimer = setTimeout(() => {
                setManualCountdown(null);
            }, 1000);
        }
        return () => clearTimeout(countdownTimer);
    }, [manualCountdown]);

    useEffect(() => {
        let timer;
        if (showManualModal && workoutMode === 'time' && manualTimeLeft > 0 && !manualIsResting && manualCountdown === null && !manualIsWaiting) {
            timer = setInterval(() => {
                setManualTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setManualIsResting(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showManualModal, manualTimeLeft, manualIsResting, workoutMode, manualCountdown, manualIsWaiting]);

    const handleNextSet = () => {
        const setTime = workoutMode === 'reps' ? targetReps : targetReps;
        setManualCurrentSet(prev => prev + 1);
        setManualTimeLeft(setTime);
        setManualTotalTime(setTime);
        setManualIsResting(false);
        setManualIsWaiting(true);
        setManualCountdown(null);
    };

    // Giờ địa phương thật của người dùng (toISOString trả về giờ UTC nên buổi tập 0h-7h sáng VN bị lệch sang ngày hôm trước)
    const toLocalISOString = (date) => {
        const p = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
    };

    const handleFinishManual = () => {
        const updatedCompleted = [...completedExercises, currentExercise.name];
        markDayAsTrained(currentExercise.name);
        setCompletedExercises(updatedCompleted);
        setShowManualModal(false);

        const kcal = currentExercise.kcal || Math.round((currentExercise.estimated_calories_per_rep || currentExercise.kcalPerRep || 1) * targetReps * targetSets) || 25;
        const startMs = Date.now() - targetReps * targetSets * 2000;
        const result = addExp(kcal, currentExercise.name);

        saveSessionToLocal(kcal, targetReps, targetSets, startMs);
        if ((dailyData?.exercises || []).every(ex => updatedCompleted.includes(ex.name))) {
            markDayComplete(dayId);
        }

        axiosClient.post('/workout-sessions', {
            start_time: toLocalISOString(new Date(startMs)),
            end_time: toLocalISOString(new Date()),
            total_calories_burned: kcal,
            total_valid_reps: targetReps * targetSets,
            workout_details: currentExercise.exercise_id ? [{
                reps_completed: targetReps * targetSets,
                exercise: { exercise_id: currentExercise.exercise_id }
            }] : []
        }).catch(err => console.error('Could not save workout session:', err));

        setSummaryData({
            exerciseName: currentExercise.name,
            exerciseId: currentExercise.exercise_id,
            reps: targetReps,
            sets: targetSets,
            kcal: kcal,
            exp: result.exp,
            isCapped: result.isCapped
        });

        setShowSummaryModal(true);
        triggerConfetti();
    };

    useEffect(() => {
        if (showAIModal && currentExercise) {

            const initAI = async () => {
                try {
                    needsResetRef.current = true;
                    setStartTimeRef.current = Date.now();
                    suspiciousSetsRef.current = 0;
                    lastRepsRef.current = 0;
                    lastRepTimeRef.current = 0;
                    setRepReward(0);
                    setAiStatus("Đang yêu cầu quyền Camera...");
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } });
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;

                    setAiStatus("Đang kết nối AI Server...");
                    const wsUrl = import.meta.env.VITE_AI_WS_URL || 'ws://localhost:8765';
                    socketRef.current = new WebSocket(wsUrl);
                    socketRef.current.onopen = () => { setAiStatus("Đã kết nối! Bắt đầu phân tích..."); sendFrames(); };
                    socketRef.current.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        setAiStatus(data.feedback || "Đang theo dõi...");
                        setSimReps(data.reps || 0);
                        if ((data.reps || 0) > lastRepsRef.current) {
                            lastRepsRef.current = data.reps;
                            const now = Date.now();
                            // rep cách rep trước nhanh hơn nhịp độ người thật hợp lý -> nghi đối phó,
                            // không thưởng pet + tính vào cờ chống đối phó (không chỉ dựa tốc độ TB cả set)
                            const tooFast = lastRepTimeRef.current > 0 && (now - lastRepTimeRef.current) < MIN_MS_PER_REP;
                            lastRepTimeRef.current = now;
                            if (tooFast) {
                                suspiciousSetsRef.current += 1;
                            } else {
                                setRepReward(r => r + 1); // pet lớn trong khung camera pop + tim, ngay khi rep đúng nhịp độ
                                triggerPetReaction();     // đồng thời pet nổi ở góc màn hình cũng phản ứng
                            }
                        }
                        if ((workoutMode === 'reps' && data.reps >= targetReps) || (workoutMode === 'time' && data.timer >= targetReps)) {
                            handleSetComplete();
                        }
                    };
                    socketRef.current.onerror = () => { setAiStatus("Không kết nối được AI Server! Hãy chạy: python upload/websocket_server.py"); };
                } catch (err) { setAiStatus("Không thể mở Camera!"); }
            };

            const sendFrames = () => {
                if (!videoRef.current || !canvasRef.current || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
                const ctx = canvasRef.current.getContext('2d');
                ctx.drawImage(videoRef.current, 0, 0, 640, 480);
                const frameData = canvasRef.current.toDataURL('image/jpeg', 0.5);
                socketRef.current.send(JSON.stringify({ mode: getAiMode(currentExercise), frame: frameData, reset: needsResetRef.current }));
                needsResetRef.current = false;
                animationFrameRef.current = setTimeout(() => requestAnimationFrame(sendFrames), 100);
            };

            const handleSetComplete = () => {
                if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
                // Chống đối phó: set hoàn thành nhanh hơn nhịp độ con người hợp lý → không tính là tập thật
                if (workoutMode === 'reps' && (Date.now() - setStartTimeRef.current) < targetReps * MIN_MS_PER_REP) {
                    suspiciousSetsRef.current += 1;
                }
                setSimSets(prevSets => {
                    const newSets = prevSets + 1;
                    if (newSets > targetSets) {
                        setAiStatus(t('exercise_list.ai_done', 'Hoàn thành xuất sắc! Đang lưu dữ liệu...'));

                        const isSuspicious = suspiciousSetsRef.current > 0;
                        const baseCalories = currentExercise.kcal || Math.round((currentExercise.estimated_calories_per_rep || currentExercise.kcalPerRep || 1) * targetReps * targetSets) || 25;
                        const sessionCalories = isSuspicious ? Math.round(baseCalories * 0.5) : baseCalories;
                        if (isSuspicious) setAiStatus(t('exercise_list.ai_too_fast', 'Tốc độ tập nhanh bất thường — EXP đã giảm để phản ánh đúng nỗ lực'));
                        const sessionData = {
                            start_time: toLocalISOString(new Date(Date.now() - 60000)),
                            end_time: toLocalISOString(new Date()),
                            total_calories_burned: sessionCalories,
                            total_valid_reps: targetReps * targetSets,
                            workout_details: currentExercise.exercise_id ? [{
                                reps_completed: targetReps * targetSets,
                                exercise: { exercise_id: currentExercise.exercise_id }
                            }] : []
                        };
                        axiosClient.post('/workout-sessions', sessionData)
                            .catch(err => console.error('Could not save workout session:', err));
                        saveSessionToLocal(sessionCalories, targetReps, targetSets, Date.now() - 60000);

                        setTimeout(() => {
                            const updatedCompleted = [...completedExercises, currentExercise.name];
                            markDayAsTrained(currentExercise.name);
                            setCompletedExercises(updatedCompleted);
                            setShowAIModal(false);
                            stopAI();

                            const kcal = sessionData.total_calories_burned;
                            const result = addExp(kcal, currentExercise.name);
                            if ((dailyData?.exercises || []).every(ex => updatedCompleted.includes(ex.name))) {
                                markDayComplete(dayId);
                            }

                            setSummaryData({
                                exerciseName: currentExercise.name,
                                exerciseId: currentExercise.exercise_id,
                                reps: targetReps,
                                sets: targetSets,
                                kcal: kcal,
                                exp: result.exp,
                                isCapped: result.isCapped
                            });

                            setShowSummaryModal(true);
                            triggerConfetti();
                        }, 1500);
                        return prevSets;
                    } else {
                        setAiStatus(t('exercise_list.ai_rest', 'Nghỉ ngơi 1 lát...'));
                        setSimReps(0);
                        needsResetRef.current = true;
                        lastRepsRef.current = 0;
                        lastRepTimeRef.current = 0;
                        setTimeout(() => {
                            setStartTimeRef.current = Date.now();
                            if (showAIModal) { sendFrames(); }
                        }, 2000);
                        return newSets;
                    }
                });
            };
            initAI();
            return () => stopAI();
        }
    }, [showAIModal, currentExercise, targetReps, targetSets, workoutMode, t]);

    const stopAI = () => {
        if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    };

    if (!dailyData) return null;

    // Chặn ngày chưa mở khóa: phải điểm danh hôm nay + hoàn thành trọn ngày trước (và đã sang ngày mới)
    if (dailyData.status === 'locked') {
        const needCheckin = lastCheckinDate !== getTodayKey();
        return (
            <Container className="d-flex flex-column justify-content-center align-items-center text-center px-4" style={{ minHeight: '85vh' }}>
                <div style={{ fontSize: '4.5rem' }} className="mb-3">{needCheckin ? '📅' : '🔒'}</div>
                <h4 className="fw-black text-primary-dynamic mb-2">
                    {needCheckin ? t('daily_workout.need_checkin_title') : t('daily_workout.locked_title')}
                </h4>
                <p className="text-secondary fw-bold mb-4" style={{ maxWidth: '420px' }}>
                    {needCheckin ? t('daily_workout.need_checkin_desc') : t('daily_workout.locked_desc')}
                </p>
                <div className="d-flex gap-3">
                    {needCheckin && (
                        <Button className="fw-bold rounded-pill px-4 py-2 border-0" style={{ background: 'var(--brand-neon)', color: '#000' }} onClick={() => navigate('/daily')}>
                            {t('daily_workout.go_checkin')}
                        </Button>
                    )}
                    <Button variant="outline-secondary" className="fw-bold rounded-pill px-4 py-2" onClick={() => navigate('/roadmap')}>
                        {t('daily_workout.back_roadmap')}
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5" style={{ minHeight: '100vh' }}>
            <Button variant="link" className="text-secondary text-decoration-none p-0 mb-4 d-flex align-items-center fw-bold" onClick={() => navigate(-1)}>
                <span className="fs-4 me-2">←</span> {t('daily_workout.back_roadmap')}
            </Button>

            {/* Motivational Quote */}
            <div className="mb-4 p-4 bg-surface-card border-surface rounded-4 text-center position-relative overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <div className="position-absolute" style={{ top: '-20px', left: '10px', fontSize: '6rem', color: 'rgba(var(--brand-neon-rgb), 0.1)', lineHeight: 1, fontFamily: 'serif' }}>"</div>
                <h5 className="fw-bold text-primary-dynamic fst-italic position-relative z-1 mb-2 px-md-4" style={{ lineHeight: 1.6 }}>
                    {dayId % 5 === 1 ? t('daily_workout.quote_1') :
                     dayId % 5 === 2 ? t('daily_workout.quote_2') :
                     dayId % 5 === 3 ? t('daily_workout.quote_3') :
                     dayId % 5 === 4 ? t('daily_workout.quote_4') :
                     t('daily_workout.quote_5')}
                </h5>
                <div className="text-secondary fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>{t('daily_workout.pet_system')}</div>
            </div>

            {/* Daily Overview Header */}
            <div className="bg-surface-card border-surface rounded-4 p-4 p-md-5 mb-5 position-relative overflow-hidden shadow-lg">
                <div className="position-absolute rounded-circle" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.1) 0%, transparent 70%)', top: '-100px', right: '-100px', filter: 'blur(40px)' }}></div>
                
                <Row className="position-relative z-1">
                    <Col lg={7}>
                        <Badge bg="dark" className="text-neon border border-secondary mb-3 px-3 py-2 rounded-pill fs-6 text-uppercase">
                            {t('daily_workout.workout_day')} {dailyData.dayId}
                        </Badge>
                        <h1 className="fw-black text-primary-dynamic text-uppercase mb-3" style={{ fontSize: '3rem', letterSpacing: '-1px' }}>
                            {dailyData.translatedGroup}
                        </h1>
                        <p className="text-secondary fw-bold fs-5 mb-4">{t('daily_workout.your_goal')} <span className="text-white">{dailyData.translatedGoal}</span></p>
                        
                        <div className="d-flex flex-wrap gap-4 mb-4">
                            <div>
                                <div className="text-muted text-uppercase fw-bold small mb-1">{t('daily_workout.duration')}</div>
                                <div className="fs-4 fw-black text-primary-dynamic">{dailyData.duration} <span className="fs-6 text-muted">{t('daily_workout.mins')}</span></div>
                            </div>
                            <div>
                                <div className="text-muted text-uppercase fw-bold small mb-1">{t('daily_workout.exercises_count')}</div>
                                <div className="fs-4 fw-black text-primary-dynamic">{dailyData.exercises.length} <span className="fs-6 text-muted">{t('daily_workout.exercises_unit')}</span></div>
                            </div>
                            <div>
                                <div className="text-muted text-uppercase fw-bold small mb-1">{t('daily_workout.difficulty')}</div>
                                <div className="fs-4 text-warning" style={{ letterSpacing: '2px' }}>
                                    {Array(5).fill('☆').map((s, i) => i < dailyData.difficulty ? '★' : '☆').join('')}
                                </div>
                            </div>
                        </div>

                        <div className="bg-body p-4 rounded-4 border-surface">
                            <h6 className="fw-black text-primary-dynamic mb-2 text-uppercase">{t('daily_workout.key_benefits')}</h6>
                            <p className="text-secondary fw-bold mb-0">{dailyData.benefits}</p>
                        </div>
                    </Col>
                    <Col lg={5} className="d-none d-lg-flex justify-content-center align-items-center">
                        <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600" alt="Workout" className="img-fluid rounded-circle border border-4 border-neon" style={{ width: '300px', height: '300px', objectFit: 'cover', boxShadow: '0 10px 30px rgba(var(--brand-neon-rgb), 0.4)' }} />
                    </Col>
                </Row>
            </div>

            <h3 className="fw-black text-primary-dynamic mb-4 text-uppercase">{t('daily_workout.exercise_list')}</h3>
            
            {/* Vertical List View */}
            <div className="d-flex flex-column gap-3 pb-4">
                {dailyData.exercises.map((ex) => {
                    const isDone = completedExercises.includes(ex.name);
                    return (
                        <Card key={ex.exercise_id} className="shadow-sm border-surface bg-surface-card overflow-hidden border-0"
                            style={{ transition: 'transform 0.2s', cursor: isDone ? 'default' : 'pointer', opacity: isDone ? 0.7 : 1, borderRadius: '15px' }}
                            onClick={() => !isDone && handleOpenDetail(ex)}
                            onMouseOver={(e) => !isDone && (e.currentTarget.style.transform = 'translateY(-3px)')}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div className="d-flex align-items-center p-3">
                                <div style={{ width: '120px', height: '100px', flexShrink: 0, position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
                                    <img src={ex.img} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    {isDone ? (
                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                                            <span style={{ color: 'var(--brand-neon)', fontSize: '2rem', fontWeight: 'bold' }}>✓</span>
                                        </div>
                                    ) : (
                                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.25)' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', background: 'var(--brand-neon)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                                                <span style={{ color: '#000', fontSize: '1rem', marginLeft: '3px' }}>▶</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="ms-4 flex-grow-1 d-flex flex-column justify-content-center">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h5 className="fw-black text-primary-dynamic mb-0 fs-5">{t(`exercises.${ex.exercise_id}`, ex.name)}</h5>
                                        <Badge bg="dark" className="ms-2 opacity-75">{ex.level === 'Cơ bản' ? t('exercises.level_basic') : ex.level === 'Trung bình' ? t('exercises.level_intermediate') : t('exercises.level_advanced')}</Badge>
                                    </div>
                                    <div className="text-secondary fw-bold small mb-2 text-truncate" style={{ maxWidth: '400px' }}>{isVi && ex.technical_description_vi ? ex.technical_description_vi : ex.technical_description}</div>
                                    {/* Không hiện Sets x Reps mặc định — người dùng tự đặt khi bắt đầu tập */}
                                    <div className="d-flex align-items-center text-secondary fw-bold gap-3">
                                        <span style={{ color: 'var(--brand-neon)' }}>🔥 {ex.kcal} kcal</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Chi Tiết Bài Tập Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg" contentClassName="border-surface bg-surface-card rounded-4 overflow-hidden shadow-lg">
                {selectedDetail && (
                    <>
                        <div style={{ height: '300px', position: 'relative' }}>
                            <img src={selectedDetail.img} alt={selectedDetail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '70px', height: '70px', background: 'var(--brand-neon)', cursor: 'pointer', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.5)' }}>
                                    <span style={{ color: '#000', fontSize: '2rem', marginLeft: '6px' }}>▶</span>
                                </div>
                                <span className="text-white fw-bold">{t('exercise_list.tutorial_video')}</span>
                            </div>
                            <Button variant="link" className="position-absolute top-0 end-0 text-white m-3 text-decoration-none" onClick={() => setShowDetailModal(false)}>
                                <span className="fs-2 fw-bold text-shadow">&times;</span>
                            </Button>
                        </div>
                        <Modal.Body className="p-4 p-md-5">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h3 className="fw-black text-primary-dynamic mb-1">{t(`exercises.${selectedDetail.exercise_id}`, selectedDetail.name)}</h3>
                                </div>
                            </div>
                            
                            <Row className="mb-4">
                                <Col md={12} className="mb-4 mb-md-0">
                                    <div className="mb-4">
                                        <h6 className="fw-black text-secondary text-uppercase mb-2" style={{ fontSize: '0.85rem' }}>{t('exercise_list.desc_benefits')}</h6>
                                        <p className="text-primary-dynamic mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            {isVi && selectedDetail.technical_description_vi ? selectedDetail.technical_description_vi : selectedDetail.technical_description}
                                        </p>
                                    </div>
                                    <div>
                                        <h6 className="fw-black text-secondary text-uppercase mb-2" style={{ fontSize: '0.85rem' }}>{t('exercise_list.safety_notes')}</h6>
                                        <p className="text-danger fw-bold mb-0" style={{ fontSize: '0.9rem' }}>
                                            {(isVi && selectedDetail.safety_notes_vi ? selectedDetail.safety_notes_vi : selectedDetail.safety_notes) || t('exercise_list.safety_notes')}
                                        </p>
                                    </div>
                                </Col>
                            </Row>

                            {/* Đồng bộ 2 nút tập */}
                            <div className="d-flex gap-3 mt-4">
                                {getAiMode(selectedDetail) && (
                                    <Button
                                        className="flex-fill py-3 fw-black rounded-pill border-0"
                                        style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }}
                                        onClick={() => handleStartFromDetail(true)}
                                    >
                                        {t('exercise_list.ai_workout')}
                                    </Button>
                                )}
                                <Button
                                    className="flex-fill py-3 fw-black rounded-pill border-2 bg-transparent"
                                    style={{ borderColor: 'var(--brand-neon)', color: 'var(--brand-neon)', fontSize: '1rem' }}
                                    onClick={() => handleStartFromDetail(false)}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-neon)'; e.currentTarget.style.color = '#000'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-neon)'; }}
                                >
                                    {t('exercise_list.basic_workout')}
                                </Button>
                            </div>
                        </Modal.Body>
                    </>
                )}
            </Modal>

            {/* AI Camera Tracker Modal */}
            <Modal show={showAIModal} fullscreen backdrop="static" keyboard={false} centered
                contentClassName="border-0 bg-black overflow-hidden">
                <Modal.Body className="p-0 position-relative bg-black">
                    {/* Real Camera Feed */}
                    <div style={{ height: '100vh', width: '100%', background: '#000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scaleX(-1)' }}></video>
                        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--brand-neon)', boxShadow: '0 0 15px var(--brand-neon)', animation: 'scan 2s linear infinite' }}></div>
                    </div>

                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-4" style={{ zIndex: 1 }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="text-start">
                                <Badge bg="danger" className="mb-2 fw-bold px-3 py-2 rounded-pill" style={{ animation: 'blink-anim 1s infinite' }}>🔴 AI DETECTING</Badge>
                                <h4 className="fw-black text-white mb-0 text-uppercase text-shadow">{currentExercise && t(`exercises.${currentExercise.exercise_id}`, currentExercise.name)}</h4>
                                <div style={{ color: 'var(--brand-neon)', fontSize: '1rem', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                    {aiStatus}
                                </div>
                            </div>
                            <Button variant="link" className="text-white p-0 m-0 text-decoration-none" onClick={() => setShowAIModal(false)}><span className="fs-1 fw-bold text-shadow">&times;</span></Button>
                        </div>

                        {/* Pet đồng hành cố định bên TRÁI trong lúc tập AI — đối xứng với FloatingPet cố định
                            bên phải. Luôn hiện suốt buổi tập (đúng hay sai vẫn ở đó, không chỉ chớp nhoáng
                            lúc có rep), riêng animation phóng to + tim chỉ chạy khi rep đúng nhịp độ. */}
                        <div className="position-absolute d-flex flex-column align-items-center" style={{ bottom: '30px', left: '30px', zIndex: 2, pointerEvents: 'none' }}>
                            <div style={{
                                position: 'absolute', width: '180px', height: '180px', borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.18) 0%, transparent 70%)',
                                animation: 'breathe 3s ease-in-out infinite', filter: 'blur(8px)'
                            }}></div>
                            <div className="position-relative d-flex flex-column align-items-center">
                                {repReward > 0 && (
                                    <>
                                        <div key={`heart-${repReward}`} className="rep-reward-heart">💖</div>
                                        <div key={`plus-${repReward}`} className="rep-reward-plus">+1</div>
                                    </>
                                )}
                                <div key={`petleft-pop-${repReward}`} className={repReward > 0 ? 'rep-reward-pet' : ''}>
                                    {/* Cùng ảnh mèo với FloatingPet bên phải (level 1 vẫn là trứng), to hơn một chút, không huy hiệu level */}
                                    {totalPoints >= 10 ? (
                                        <img src={petChatbot} alt="Pet" className="pet-working" style={{ width: '160px', height: '160px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' }} />
                                    ) : (
                                        <div className="pet-working" style={{ fontSize: '5rem', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' }}>{petIcon}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto p-4 rounded-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Row className="text-center g-2 mb-4">
                                <Col xs={6}>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 'bold' }}>{workoutMode === 'reps' ? t('exercise_list.reps_progress', 'TIẾN ĐỘ REPS') : t('exercise_list.time_progress', 'THỜI GIAN (GIÂY)')}</div>
                                    <div className="fw-black" style={{ color: 'var(--brand-neon)', fontSize: '3.5rem', lineHeight: 1 }}>{simReps}<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>/{targetReps}</span></div>
                                </Col>
                                <Col xs={6}>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 'bold' }}>{t('exercise_list.current_set', 'SET HIỆN TẠI')}</div>
                                    <div className="fw-black" style={{ color: '#00b4d8', fontSize: '3.5rem', lineHeight: 1 }}>{Math.min(simSets, targetSets)}<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>/{targetSets}</span></div>
                                </Col>
                            </Row>
                            <ProgressBar now={(simReps / targetReps) * 100} variant="success" style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Manual Tracking Modal */}
            <Modal show={showManualModal} backdrop="static" keyboard={false} centered
                contentClassName="border-surface bg-surface-card rounded-4 overflow-hidden shadow-lg">
                <Modal.Body className="p-4 p-md-5 text-center">
                    <h4 className="fw-black text-primary-dynamic mb-2 text-uppercase">{currentExercise && t(`exercises.${currentExercise.exercise_id}`, currentExercise.name)}</h4>
                    <div className="mb-4"><Badge bg="success" className="fs-6 px-3 py-2 rounded-pill">SET {manualCurrentSet} / {targetSets}</Badge></div>

                    <p className="text-secondary fw-bold mb-4" style={{ fontSize: '0.95rem' }}>
                        {workoutMode === 'reps' ? `${t('exercise_list.target')} ${targetReps} Reps.` : `${t('exercise_list.target')} ${targetReps} ${t('exercise_list.secs')}.`}<br/>
                        {!manualIsResting ? <span className="text-primary-dynamic">{workoutMode === 'reps' ? t('exercise_list.pace_msg') : t('exercise_list.time_msg')}</span> : <span className="text-success">{t('exercise_list.set_completed')}</span>}
                    </p>

                    <div className="d-flex justify-content-center align-items-center mb-5" style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
                        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="110" cy="110" r="100" fill="none" stroke="var(--bs-border-color)" strokeWidth="12" style={{ opacity: 0.3 }} />
                            {workoutMode === 'time' && <circle cx="110" cy="110" r="100" fill="none" stroke={manualIsResting ? "#198754" : "var(--brand-neon)"} strokeWidth="12" strokeDasharray="628.3" strokeDashoffset={manualTotalTime > 0 ? 628.3 * (manualTimeLeft / manualTotalTime) : 0} style={{ transition: 'stroke-dashoffset 1s linear', strokeLinecap: 'round' }} />}
                            {workoutMode === 'reps' && <circle cx="110" cy="110" r="100" fill="none" stroke={manualIsResting ? "#198754" : "var(--brand-neon)"} strokeWidth="12" strokeDasharray="628.3" strokeDashoffset={manualIsResting ? 0 : 628.3} style={{ transition: 'stroke-dashoffset 0.5s ease', strokeLinecap: 'round' }} />}
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                            {!manualIsResting ? (
                                manualCountdown !== null && !manualIsWaiting ? (
                                    <div className="fw-black text-warning" style={{ fontSize: '5rem', lineHeight: '1', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{manualCountdown > 0 ? manualCountdown : 'GO'}</div>
                                ) : (
                                    <>
                                        <div className="fw-black text-primary-dynamic" style={{ fontSize: '4.5rem', lineHeight: '1' }}>{workoutMode === 'time' ? manualTimeLeft : targetReps}</div>
                                        <div className="text-secondary fw-bold text-uppercase mt-1" style={{ letterSpacing: '2px' }}>{workoutMode === 'time' ? t('exercise_list.secs') : 'Reps'}</div>
                                    </>
                                )
                            ) : <div className="fw-black text-success" style={{ fontSize: '2.5rem' }}>{t('exercise_list.done')}</div>}
                        </div>
                    </div>

                    {/* Pet animation */}
                    <div className="text-center mb-3">
                        <span className={manualIsResting ? 'pet-resting' : 'pet-working'} style={{ fontSize: '2rem', display: 'inline-block' }}>{petIcon}</span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                        {!manualIsResting ? (
                            manualIsWaiting ? (
                                <>
                                    <Button className="w-100 py-3 fw-black border-0 rounded-pill mb-2" style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }} onClick={() => { setManualIsWaiting(false); setManualCountdown(3); }}>SẴN SÀNG</Button>
                                    <Button variant="outline-danger" className="fw-bold py-3 rounded-pill" onClick={() => setShowManualModal(false)}>{t('exercise_list.cancel_workout')}</Button>
                                </>
                            ) : manualCountdown !== null ? (
                                <Button className="w-100 py-3 fw-black border-0 rounded-pill mb-2" disabled style={{ background: '#495057', color: '#fff', fontSize: '1.2rem' }}>BẮT ĐẦU TRONG {manualCountdown}...</Button>
                            ) : (
                                <>
                                    {workoutMode === 'reps' && <Button className="w-100 py-3 fw-black border-0 rounded-pill mb-2" style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }} onClick={() => setManualIsResting(true)}>{t('exercise_list.set_done')}</Button>}
                                    <Button variant="outline-danger" className="fw-bold py-3 rounded-pill" onClick={() => setShowManualModal(false)}>{t('exercise_list.cancel_workout')}</Button>
                                </>
                            )
                        ) : (
                            manualCurrentSet < targetSets ? (
                                <Button className="w-100 py-3 fw-black border-0 rounded-pill" style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }} onClick={handleNextSet}>{t('exercise_list.start_set')} {manualCurrentSet + 1}</Button>
                            ) : (
                                <Button className="w-100 py-3 fw-black border-0 rounded-pill btn-success text-white" style={{ fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(25,135,84, 0.4)' }} onClick={handleFinishManual}>🏆 {t('exercise_list.finish_workout')}</Button>
                            )
                        )}
                        {manualIsResting && <Button variant="link" className="text-secondary text-decoration-none fw-bold" onClick={() => setShowManualModal(false)}>{t('exercise_list.stop_early')}</Button>}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Workout Summary Modal */}
            <Modal show={showSummaryModal} onHide={() => setShowSummaryModal(false)} centered backdrop="static"
                contentClassName="border-0 bg-transparent overflow-hidden shadow-none">
                <Modal.Body className="p-0 text-center">
                    <div className="bg-surface-card rounded-5 p-5 position-relative overflow-hidden shadow-lg" style={{ border: '2px solid var(--brand-neon)' }}>
                        {/* Glow background */}
                        <div className="position-absolute top-50 start-50 translate-middle rounded-circle" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.3) 0%, transparent 70%)', filter: 'blur(30px)', zIndex: 0 }}></div>
                        
                        <div className="position-relative z-1">
                            <h2 className="fw-black text-white text-uppercase mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{t('daily_workout.awesome')}</h2>
                            <p className="text-neon fw-bold mb-4">{t('daily_workout.completed_msg')}</p>
                            
                            <h4 className="fw-bold text-white mb-4 bg-dark py-2 px-3 rounded-pill d-inline-block border border-secondary">{summaryData && t(`exercises.${summaryData.exerciseId}`, summaryData.exerciseName)}</h4>
                            
                            <Row className="g-3 mb-4">
                                <Col xs={6}>
                                    <div className="bg-body rounded-4 p-3 border-surface">
                                        <div className="text-secondary fw-bold small text-uppercase">{t('daily_workout.energy')}</div>
                                        <div className="fs-2 fw-black text-warning">🔥 {summaryData?.kcal} <span className="fs-6 text-muted">kcal</span></div>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className="bg-body rounded-4 p-3 border-surface">
                                        <div className="text-secondary fw-bold small text-uppercase">{t('daily_workout.experience')}</div>
                                        <div className="fs-2 fw-black text-info">⭐ +{summaryData?.exp} <span className="fs-6 text-muted">EXP</span></div>
                                    </div>
                                </Col>
                            </Row>
                            
                            <div className="mt-4 pt-3 border-top border-secondary">
                                        {summaryData?.isCapped ? (
                                            <div className="alert alert-warning mb-3 fw-bold small text-dark py-2">
                                                {t('daily_workout.exp_limit_warning')}
                                            </div>
                                        ) : (
                                            <p className="text-white opacity-75 small fw-bold mb-3">{t('daily_workout.exp_received')}</p>
                                        )}
                                <Button 
                                    className="w-100 py-3 fw-black rounded-pill border-0" 
                                    style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.4)' }}
                                    onClick={() => setShowSummaryModal(false)}
                                >
                                    {t('daily_workout.continue_workout')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <style>{`
                .text-shadow { text-shadow: 0 2px 5px rgba(0,0,0,0.8); }
                @keyframes scan { 0% { top: 0%; opacity: 0.8; } 50% { top: 100%; opacity: 0.3; } 100% { top: 0%; opacity: 0.8; } }
                @keyframes blink-anim { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes pet-bounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-12px) scale(1.1); } }
                @keyframes pet-rest { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                .pet-working { animation: pet-bounce 0.6s ease-in-out infinite; }
                .pet-resting { animation: pet-rest 1.5s ease-in-out infinite; }
                /* Phần thưởng tức thời mỗi rep hợp lệ trong khung camera */
                @keyframes repRewardPop {
                    0% { transform: scale(1); }
                    35% { transform: scale(1.6) rotate(-4deg); }
                    60% { transform: scale(0.92) rotate(3deg); }
                    100% { transform: scale(1) rotate(0); }
                }
                .rep-reward-pet { animation: repRewardPop 0.55s ease-out; }
                @keyframes repRewardHeartFloat {
                    0% { transform: translateY(0) scale(0.6); opacity: 0; }
                    25% { opacity: 1; }
                    100% { transform: translateY(-70px) scale(1.3); opacity: 0; }
                }
                .rep-reward-heart {
                    position: absolute; top: -20px; font-size: 2rem;
                    pointer-events: none; animation: repRewardHeartFloat 0.9s ease-out forwards;
                }
                @keyframes repRewardPlusFloat {
                    0% { transform: translateY(0); opacity: 0; }
                    25% { opacity: 1; }
                    100% { transform: translateY(-55px); opacity: 0; }
                }
                .rep-reward-plus {
                    position: absolute; top: -8px; right: -34px;
                    color: var(--brand-neon); font-weight: 900; font-size: 1.6rem;
                    text-shadow: 0 2px 6px rgba(0,0,0,0.7);
                    pointer-events: none; animation: repRewardPlusFloat 0.9s ease-out forwards;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .d-flex.gap-4::-webkit-scrollbar { display: none; }
                /* Hide scrollbar for IE, Edge and Firefox */
                .d-flex.gap-4 { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Container>
    );
}
