import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMuscleGroupById } from '../api/exerciseApi';
import confetti from 'canvas-confetti';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600';

const AI_EXERCISE_MODES = {
    'Push Up': 'PUSH-UP',
    'Bodyweight Squat': 'SQUAT',
    'Plank': 'PLANK',
    'Pull Up': 'PULL-UP',
    'Handstand': 'HANDSTAND',
};

const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const markDayAsTrained = () => {
    const key = getTodayKey();
    const saved = localStorage.getItem('pet-schedule');
    const scheduleData = saved ? JSON.parse(saved) : {};

    const existing = scheduleData[key] || { trained: false, note: '', completedExercises: [] };
    existing.trained = true;
    
    // Trong ExerciseList (Tập tự do), chúng ta chỉ đánh dấu ngày là đã có tập (trained: true)
    // KHÔNG đẩy tên bài tập vào completedExercises để tránh trùng/ảnh hưởng tới Lộ trình (Roadmap).

    scheduleData[key] = existing;
    localStorage.setItem('pet-schedule', JSON.stringify(scheduleData));
    
    // Đẩy event để component Daily cập nhật ngay lập tức nếu cần
    window.dispatchEvent(new Event('storage'));
};

export default function ExerciseList() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useTranslation();

    const [groupData, setGroupData] = useState({ name: '', desc: '', exercises: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroup = async () => {
            setLoading(true);
            try {
                const data = await getMuscleGroupById(id);
                setGroupData({
                    name: data.name || '',
                    desc: data.description || '',
                    exercises: (data.exercises || []).map(ex => ({
                        ...ex,
                        img: ex.media_url || DEFAULT_IMG,
                        reps: ex.reps != null ? String(ex.reps) : '12',
                        sets: ex.sets != null ? ex.sets : 3,
                        kcal: ex.kcal != null ? Math.round(ex.kcal) : Math.round((ex.estimated_calories_per_rep || 1) * (ex.reps || 12) * (ex.sets || 3))
                    }))
                });
            } catch (err) {
                console.error('Không thể tải bài tập:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
    }, [id]);

    // States cho AI Camera Modal
    const [showAIModal, setShowAIModal] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [simReps, setSimReps] = useState(0);
    const [simSets, setSimSets] = useState(1);
    const [targetReps, setTargetReps] = useState(0);
    const [targetSets, setTargetSets] = useState(0);
    const [aiStatus, setAiStatus] = useState('');

    // AI Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const socketRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);

    // States cho Detailed Exercise Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [workoutMode, setWorkoutMode] = useState('reps'); // 'reps' or 'time'
    const [customTarget, setCustomTarget] = useState(0);
    const [customSets, setCustomSets] = useState(1);

    // States cho Manual Workout Tracker
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualTimeLeft, setManualTimeLeft] = useState(0);
    const [manualTotalTime, setManualTotalTime] = useState(0);
    const [manualCurrentSet, setManualCurrentSet] = useState(1);
    const [manualIsResting, setManualIsResting] = useState(false);

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
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    };

    const exercises = groupData.exercises;

    // Mở chi tiết bài tập
    const handleOpenDetail = (exercise) => {
        setSelectedDetail(exercise);
        setWorkoutMode('reps');
        setCustomTarget(parseInt(exercise.reps));
        setCustomSets(parseInt(exercise.sets) || 1);
        setShowDetailModal(true);
    };

    // Bắt đầu tập từ Modal Chi tiết
    const handleStartFromDetail = (useAI) => {
        if (!selectedDetail) return;
        setCurrentExercise(selectedDetail);
        
        let calculatedTime = 0;
        let reps = customTarget;
        let sets = customSets;

        if (workoutMode === 'reps') {
            setTargetReps(reps);
            setTargetSets(sets);
            // Ước tính 2 giây cho 1 rep để tạo thời gian chờ (cộng thêm 10s nghỉ mỗi hiệp)
            calculatedTime = (reps * 2 * sets) + ((sets - 1) * 10); 
        } else {
            // Chế độ thời gian: giả lập sets với reps = giây
            setTargetReps(customTarget);
            setTargetSets(sets);
            // Tính tổng thời gian tập (thêm 10s nghỉ giữa mỗi set)
            calculatedTime = (customTarget * sets) + ((sets - 1) * 10);
        }
        
        setSimReps(0);
        setSimSets(1);
        setShowDetailModal(false);
        
        if (useAI) {
            setAiStatus('Đang khởi động Camera AI...');
            setShowAIModal(true);
        } else {
            // Tập thủ công: Bắt đầu Set 1
            const setTime = workoutMode === 'reps' ? customTarget * 2 : customTarget;
            setManualCurrentSet(1);
            setManualTimeLeft(setTime);
            setManualTotalTime(setTime);
            setManualIsResting(false);
            setShowManualModal(true);
        }
    };

    // Timer cho Manual Mode (Chỉ chạy đếm ngược nếu là chế độ TIME)
    useEffect(() => {
        let timer;
        if (showManualModal && workoutMode === 'time' && manualTimeLeft > 0 && !manualIsResting) {
            timer = setInterval(() => {
                setManualTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setManualIsResting(true); // Tự động chuyển sang nghỉ khi hết giờ
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showManualModal, manualTimeLeft, manualIsResting, workoutMode]);

    const handleNextSet = () => {
        const setTime = workoutMode === 'reps' ? targetReps : targetReps;
        setManualCurrentSet(prev => prev + 1);
        setManualTimeLeft(setTime);
        setManualTotalTime(setTime);
        setManualIsResting(false);
    };

    const handleFinishManual = () => {
        markDayAsTrained();
        setShowManualModal(false);
        
        const kcal = Math.round(currentExercise.estimated_calories_per_rep * targetReps * targetSets) || 25;
        let expGained = Math.max(1, Math.round(kcal * 0.1));
        
        // Giới hạn điểm mỗi ngày (300 EXP)
        const dailySaved = localStorage.getItem('pet-daily');
        const dailyParsed = dailySaved ? JSON.parse(dailySaved) : { totalPoints: 0, exercisesTrained: [], pointsEarnedToday: 0, date: getTodayKey() };
        
        const todayStr = getTodayKey();
        if (dailyParsed.date !== todayStr) {
            dailyParsed.date = todayStr;
            dailyParsed.pointsEarnedToday = 0;
        }
        
        const MAX_DAILY_EXP = 300;
        if (dailyParsed.pointsEarnedToday + expGained > MAX_DAILY_EXP) {
            expGained = Math.max(0, MAX_DAILY_EXP - dailyParsed.pointsEarnedToday);
        }

        setSummaryData({
            exerciseName: currentExercise.name,
            exerciseId: currentExercise.exercise_id,
            reps: targetReps,
            sets: targetSets,
            kcal: kcal,
            exp: expGained,
            isCapped: dailyParsed.pointsEarnedToday + expGained >= MAX_DAILY_EXP
        });
        
        // Thêm điểm vào LocalStorage
        dailyParsed.pointsEarnedToday += expGained;
        dailyParsed.totalPoints = (dailyParsed.totalPoints || 0) + expGained;
        if(!dailyParsed.exercisesTrained) dailyParsed.exercisesTrained = [];
        if(!dailyParsed.exercisesTrained.includes(currentExercise.name)) {
            dailyParsed.exercisesTrained.push(currentExercise.name);
        }
        localStorage.setItem('pet-daily', JSON.stringify(dailyParsed));
        window.dispatchEvent(new Event('storage')); // Cập nhật FloatingPet

        setShowSummaryModal(true);
        triggerConfetti();
    };

    // Logic Camera AI đếm reps
    useEffect(() => {
        if (showAIModal && currentExercise) {
            const initAI = async () => {
                try {
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
                socketRef.current.send(JSON.stringify({ mode: AI_EXERCISE_MODES[currentExercise.name], frame: frameData }));
                animationFrameRef.current = setTimeout(() => requestAnimationFrame(sendFrames), 100);
            };

            const handleSetComplete = () => {
                if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
                setSimSets(prevSets => {
                    const newSets = prevSets + 1;
                    if (newSets > targetSets) {
                        setAiStatus('Hoàn thành xuất sắc! Đang lưu dữ liệu...');
                        
                        const sessionId = Math.floor(Math.random() * 1000000);
                        const sessionData = {
                            session_id: sessionId, user_id: 1,
                            start_time: new Date(Date.now() - 60000).toISOString(),
                            end_time: new Date().toISOString(),
                            total_calories_burned: Math.round(currentExercise.estimated_calories_per_rep * targetReps * targetSets),
                            total_valid_reps: targetReps * targetSets
                        };
                        const savedSessions = JSON.parse(localStorage.getItem('workout-sessions') || '[]');
                        savedSessions.push(sessionData);
                        localStorage.setItem('workout-sessions', JSON.stringify(savedSessions));

                        setTimeout(() => {
                            markDayAsTrained();
                            setShowAIModal(false);
                            stopAI();

                            const kcal = sessionData.total_calories_burned;
                            let expGained = Math.max(1, Math.round(kcal * 0.1));
                            
                            const dailySaved = localStorage.getItem('pet-daily');
                            const dailyParsed = dailySaved ? JSON.parse(dailySaved) : { totalPoints: 0, exercisesTrained: [], pointsEarnedToday: 0, date: getTodayKey() };
                            
                            const todayStr = getTodayKey();
                            if (dailyParsed.date !== todayStr) {
                                dailyParsed.date = todayStr;
                                dailyParsed.pointsEarnedToday = 0;
                            }
                            
                            const MAX_DAILY_EXP = 300;
                            if (dailyParsed.pointsEarnedToday + expGained > MAX_DAILY_EXP) {
                                expGained = Math.max(0, MAX_DAILY_EXP - dailyParsed.pointsEarnedToday);
                            }

                            setSummaryData({
                                exerciseName: currentExercise.name,
                                exerciseId: currentExercise.exercise_id,
                                reps: targetReps,
                                sets: targetSets,
                                kcal: kcal,
                                exp: expGained,
                                isCapped: dailyParsed.pointsEarnedToday + expGained >= MAX_DAILY_EXP
                            });

                            dailyParsed.pointsEarnedToday += expGained;
                            dailyParsed.totalPoints = (dailyParsed.totalPoints || 0) + expGained;
                            if(!dailyParsed.exercisesTrained) dailyParsed.exercisesTrained = [];
                            if(!dailyParsed.exercisesTrained.includes(currentExercise.name)) {
                                dailyParsed.exercisesTrained.push(currentExercise.name);
                            }
                            localStorage.setItem('pet-daily', JSON.stringify(dailyParsed));
                            window.dispatchEvent(new Event('storage'));

                            setShowSummaryModal(true);
                            triggerConfetti();
                        }, 1500);
                        return prevSets;
                    } else {
                        setAiStatus('Nghỉ ngơi 1 lát...');
                        setSimReps(0);
                        setTimeout(() => { if (showAIModal) { sendFrames(); } }, 2000);
                        return newSets;
                    }
                });
            };
            initAI();
            return () => stopAI();
        }
    }, [showAIModal, currentExercise, targetReps, targetSets, workoutMode]);

    const stopAI = () => {
        if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
        if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3 text-secondary fw-bold">Đang tải bài tập...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Button
                variant="link"
                className="text-secondary text-decoration-none p-0 mb-4 d-flex align-items-center fw-bold"
                onClick={() => navigate(-1)}
            >
                <span className="fs-4 me-2">←</span> {t('exercise_list.back')}
            </Button>

            <div className="mb-5">
                <h2 className="fw-black mb-1 text-primary-dynamic text-uppercase">
                    {t('exercise_list.exercises')} <span style={{ color: 'var(--brand-neon)' }}>{t(`exercises.group_${id}_name`, groupData.name)}</span>
                </h2>
                <p className="text-secondary fw-bold">{t(`exercises.group_${id}_desc`, groupData.desc)}</p>
            </div>

            <Row className="g-4">
                {exercises.map((ex) => {
                    return (
                        <Col md={6} lg={4} key={ex.exercise_id}>
                            <Card className="h-100 shadow-sm border-surface bg-surface-card overflow-hidden"
                                style={{ transition: 'transform 0.2s', cursor: 'pointer', borderRadius: '20px' }}
                                onClick={() => handleOpenDetail(ex)}
                                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                    <Card.Img variant="top" src={ex.img}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                        <h5 className="fw-black text-white mb-0 fs-5">{t(`exercises.${ex.exercise_id}`, ex.name)}</h5>
                                        <Badge bg="dark" className="ms-2 opacity-75">{ex.level === 'Cơ bản' ? t('exercises.level_basic') : ex.level === 'Trung bình' ? t('exercises.level_intermediate') : t('exercises.level_advanced')}</Badge>
                                    </div>
                                </div>

                                <Card.Body className="d-flex flex-column p-4">
                                    <div className="d-flex justify-content-between align-items-center text-secondary small fw-bold mt-auto">
                                        <span>🔄 {ex.sets} Sets x {ex.reps} Reps</span>
                                        <span style={{ color: 'var(--brand-neon)' }}>🔥 {ex.kcal} kcal</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Chi Tiết Bài Tập Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg" contentClassName="border-surface bg-surface-card rounded-4 overflow-hidden shadow-lg">
                {selectedDetail && (
                    <>
                        <div style={{ height: '300px', position: 'relative' }}>
                            <img src={selectedDetail.img} alt={selectedDetail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                {/* Video Player Placeholder */}
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
                                    <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                                        {t('exercise_list.muscle_group')} <span style={{ color: 'var(--brand-neon)' }}>{t(`exercises.group_${id}_name`, groupData.name)}</span>
                                    </div>
                                </div>
                                <div className="text-warning fs-4" style={{ letterSpacing: '2px' }}>
                                    {selectedDetail.level === 'Nâng cao' ? '★★★★★' : selectedDetail.level === 'Trung bình' ? '★★★☆☆' : '★★☆☆☆'}
                                </div>
                            </div>
                            
                            <Row className="mb-4">
                                <Col md={6} className="mb-4 mb-md-0">
                                    <div className="mb-4">
                                        <h6 className="fw-black text-secondary text-uppercase mb-2" style={{ fontSize: '0.85rem' }}>{t('exercise_list.desc_benefits')}</h6>
                                        <p className="text-primary-dynamic mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            {t(`exercises.desc_${selectedDetail.exercise_id}`, selectedDetail.technical_description)}
                                        </p>
                                    </div>
                                    <div>
                                        <h6 className="fw-black text-secondary text-uppercase mb-2" style={{ fontSize: '0.85rem' }}>{t('exercise_list.safety_notes')}</h6>
                                        <p className="text-danger fw-bold mb-0" style={{ fontSize: '0.9rem' }}>
                                            {t(`exercises.safety_${selectedDetail.exercise_id}`, selectedDetail.safety_notes) || t('exercise_list.safety_notes')}
                                        </p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="bg-surface-main p-4 rounded-4 border-surface h-100 d-flex flex-column">
                                        <h6 className="fw-black text-primary-dynamic mb-3 text-uppercase text-center">{t('exercise_list.customize_workout')}</h6>
                                        
                                        <div className="d-flex gap-2 mb-4">
                                            <Button 
                                                variant={workoutMode === 'reps' ? 'success' : 'outline-secondary'} 
                                                className={`flex-grow-1 fw-bold rounded-pill ${workoutMode === 'reps' ? 'border-0' : ''}`}
                                                style={workoutMode === 'reps' ? { background: 'var(--brand-neon)', color: '#000' } : {}}
                                                onClick={() => { setWorkoutMode('reps'); setCustomTarget(parseInt(selectedDetail.reps)); }}
                                            >
                                                {t('exercise_list.by_reps')}
                                            </Button>
                                            <Button 
                                                variant={workoutMode === 'time' ? 'success' : 'outline-secondary'} 
                                                className={`flex-grow-1 fw-bold rounded-pill ${workoutMode === 'time' ? 'border-0' : ''}`}
                                                style={workoutMode === 'time' ? { background: 'var(--brand-neon)', color: '#000' } : {}}
                                                onClick={() => { setWorkoutMode('time'); setCustomTarget(60); }}
                                            >
                                                {t('exercise_list.time')}
                                            </Button>
                                        </div>

                                        <div className="d-flex flex-column gap-3 mt-auto mb-2">
                                            {/* Sets Control */}
                                            <div className="d-flex align-items-center justify-content-between bg-body p-2 rounded-pill border-surface">
                                                <Button variant="link" className="text-secondary text-decoration-none fw-bold fs-3 px-3" onClick={() => setCustomSets(prev => Math.max(1, prev - 1))}>-</Button>
                                                <div className="text-center d-flex align-items-baseline gap-2">
                                                    <span className="fw-black text-primary-dynamic" style={{ fontSize: '1.8rem' }}>{customSets}</span>
                                                    <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.85rem' }}>Sets</span>
                                                </div>
                                                <Button variant="link" className="text-secondary text-decoration-none fw-bold fs-3 px-3" onClick={() => setCustomSets(prev => prev + 1)}>+</Button>
                                            </div>

                                            {/* Reps/Time Control */}
                                            <div className="d-flex align-items-center justify-content-between bg-body p-2 rounded-pill border-surface">
                                                <Button variant="link" className="text-secondary text-decoration-none fw-bold fs-3 px-3" onClick={() => setCustomTarget(prev => Math.max(1, prev - (workoutMode === 'time' ? 10 : 1)))}>-</Button>
                                                <div className="text-center d-flex align-items-baseline gap-2">
                                                    <span className="fw-black text-primary-dynamic" style={{ fontSize: '1.8rem' }}>{customTarget}</span>
                                                    <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.85rem' }}>{workoutMode === 'reps' ? 'Reps' : t('exercise_list.secs')}</span>
                                                </div>
                                                <Button variant="link" className="text-secondary text-decoration-none fw-bold fs-3 px-3" onClick={() => setCustomTarget(prev => prev + (workoutMode === 'time' ? 10 : 1))}>+</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Đồng bộ 2 nút tập */}
                            <div className="d-flex gap-3 mt-4">
                                {AI_EXERCISE_MODES[selectedDetail?.name] && (
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
                contentClassName="border-0 bg-black overflow-hidden"
                style={{ '--bs-modal-bg': '#000' }}>
                <Modal.Body className="bg-black text-primary-dynamic p-0 position-relative">
                    {/* Real Camera Feed */}
                    <div style={{
                        height: '100vh', width: '100%', background: '#000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scaleX(-1)' }}></video>
                        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                            background: 'var(--brand-neon)', boxShadow: '0 0 15px var(--brand-neon)',
                            animation: 'scan 2s linear infinite'
                        }}></div>
                    </div>

                    {/* Tracker Info Overlay */}
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-4" style={{ zIndex: 1 }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="text-start">
                                <Badge bg="danger" className="mb-2 fw-bold px-3 py-2 rounded-pill" style={{ animation: 'blink-anim 1s infinite' }}>🔴 AI DETECTING</Badge>
                                <h4 className="fw-black text-white mb-0 text-uppercase text-shadow">{currentExercise && t(`exercises.${currentExercise.exercise_id}`, currentExercise.name)}</h4>
                                <div style={{ color: 'var(--brand-neon)', fontSize: '1rem', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                    {aiStatus}
                                </div>
                            </div>
                            <Button variant="link" className="text-white p-0 m-0 text-decoration-none" onClick={() => setShowAIModal(false)}>
                                <span className="fs-1 fw-bold text-shadow">&times;</span>
                            </Button>
                        </div>

                        <div className="mt-auto p-4 rounded-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Row className="text-center g-2 mb-4">
                                <Col xs={6}>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {workoutMode === 'reps' ? 'TIẾN ĐỘ REPS' : 'THỜI GIAN (GIÂY)'}
                                    </div>
                                    <div className="fw-black" style={{ color: 'var(--brand-neon)', fontSize: '3.5rem', lineHeight: 1 }}>{simReps}<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>/{targetReps}</span></div>
                                </Col>
                                <Col xs={6}>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 'bold' }}>SET HIỆN TẠI</div>
                                    <div className="fw-black" style={{ color: '#00b4d8', fontSize: '3.5rem', lineHeight: 1 }}>{Math.min(simSets, targetSets)}<span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.4)' }}>/{targetSets}</span></div>
                                </Col>
                            </Row>
                            <ProgressBar 
                                now={(simReps / targetReps) * 100} 
                                variant="success" 
                                style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }} 
                            />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Manual Tracking Modal */}
            <Modal show={showManualModal} backdrop="static" keyboard={false} centered
                contentClassName="border-surface bg-surface-card rounded-4 overflow-hidden shadow-lg">
                <Modal.Body className="p-4 p-md-5 text-center">
                    <h4 className="fw-black text-primary-dynamic mb-2 text-uppercase">{currentExercise && t(`exercises.${currentExercise.exercise_id}`, currentExercise.name)}</h4>
                    <div className="mb-4">
                        <Badge bg="success" className="fs-6 px-3 py-2 rounded-pill">
                            SET {manualCurrentSet} / {targetSets}
                        </Badge>
                    </div>

                    <p className="text-secondary fw-bold mb-4" style={{ fontSize: '0.95rem' }}>
                        {workoutMode === 'reps' ? `${t('exercise_list.target')} ${targetReps} Reps.` : `${t('exercise_list.target')} ${targetReps} ${t('exercise_list.secs')}.`}
                        <br/>
                        {!manualIsResting ? (
                            <span className="text-primary-dynamic">
                                {workoutMode === 'reps' ? t('exercise_list.pace_msg') : t('exercise_list.time_msg')}
                            </span>
                        ) : <span className="text-success">{t('exercise_list.set_completed')}</span>}
                    </p>

                    <div className="d-flex justify-content-center align-items-center mb-5" style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
                        {/* Circular progress SVG */}
                        <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="110" cy="110" r="100" fill="none" stroke="var(--bs-border-color)" strokeWidth="12" style={{ opacity: 0.3 }} />
                            {workoutMode === 'time' && (
                                <circle cx="110" cy="110" r="100" fill="none" stroke={manualIsResting ? "#198754" : "var(--brand-neon)"} strokeWidth="12" strokeDasharray="628.3" strokeDashoffset={manualTotalTime > 0 ? 628.3 * (manualTimeLeft / manualTotalTime) : 0} style={{ transition: 'stroke-dashoffset 1s linear', strokeLinecap: 'round' }} />
                            )}
                            {workoutMode === 'reps' && (
                                <circle cx="110" cy="110" r="100" fill="none" stroke={manualIsResting ? "#198754" : "var(--brand-neon)"} strokeWidth="12" strokeDasharray="628.3" strokeDashoffset={manualIsResting ? 0 : 628.3} style={{ transition: 'stroke-dashoffset 0.5s ease', strokeLinecap: 'round' }} />
                            )}
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                            {workoutMode === 'time' ? (
                                !manualIsResting ? (
                                    <>
                                        <div className="fw-black text-primary-dynamic" style={{ fontSize: '4.5rem', lineHeight: '1' }}>{manualTimeLeft}</div>
                                        <div className="text-secondary fw-bold text-uppercase mt-1" style={{ letterSpacing: '2px' }}>Giây</div>
                                        <div className="text-secondary fw-bold text-uppercase mt-1" style={{ letterSpacing: '2px' }}>{t('exercise_list.secs')}</div>
                                    </>
                                ) : (
                                    <div className="fw-black text-success" style={{ fontSize: '2.5rem' }}>{t('exercise_list.done')}</div>
                                )
                            ) : (
                                !manualIsResting ? (
                                    <>
                                        <div className="fw-black text-primary-dynamic" style={{ fontSize: '4.5rem', lineHeight: '1' }}>{targetReps}</div>
                                        <div className="text-secondary fw-bold text-uppercase mt-1" style={{ letterSpacing: '2px' }}>Reps</div>
                                    </>
                                ) : (
                                    <div className="fw-black text-success" style={{ fontSize: '2.5rem' }}>{t('exercise_list.done')}</div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-3">
                        {!manualIsResting ? (
                            <>
                                {workoutMode === 'reps' && (
                                    <Button 
                                        className="w-100 py-3 fw-black border-0 rounded-pill mb-2"
                                        style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }}
                                        onClick={() => setManualIsResting(true)}
                                    >
                                        {t('exercise_list.set_done')}
                                    </Button>
                                )}
                                <Button variant="outline-danger" className="fw-bold py-3 rounded-pill" onClick={() => setShowManualModal(false)}>
                                    {t('exercise_list.cancel_workout')}
                                </Button>
                            </>
                        ) : (
                            manualCurrentSet < targetSets ? (
                                <Button 
                                    className="w-100 py-3 fw-black border-0 rounded-pill"
                                    style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }}
                                    onClick={handleNextSet}
                                >
                                    {t('exercise_list.start_set')} {manualCurrentSet + 1}
                                </Button>
                            ) : (
                                <Button 
                                    className="w-100 py-3 fw-black border-0 rounded-pill"
                                    style={{ background: '#00b4d8', color: '#fff', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(0,180,216, 0.4)' }}
                                    onClick={handleFinishManual}
                                >
                                    🏆 {t('exercise_list.finish_workout')}
                                </Button>
                            )
                        )}
                        {manualIsResting && (
                            <Button variant="link" className="text-secondary text-decoration-none fw-bold" onClick={() => setShowManualModal(false)}>
                                {t('exercise_list.stop_early')}
                            </Button>
                        )}
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
                            <h2 className="fw-black text-white text-uppercase mb-1" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{t('exercise_list.workout_summary')} 🎉</h2>
                            <p className="text-neon fw-bold mb-4">{summaryData && t(`exercises.${summaryData.exerciseId}`, summaryData.exerciseName)}</p>
                            
                            <Row className="g-3 mb-4">
                                <Col xs={6}>
                                    <div className="bg-body rounded-4 p-3 border-surface">
                                        <div className="text-secondary fw-bold small text-uppercase">{t('exercise_list.reps')}</div>
                                        <div className="fs-2 fw-black text-primary-dynamic">{summaryData?.reps}</div>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className="bg-body rounded-4 p-3 border-surface">
                                        <div className="text-secondary fw-bold small text-uppercase">{t('exercise_list.sets')}</div>
                                        <div className="fs-2 fw-black text-primary-dynamic">{summaryData?.sets}</div>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className="bg-body rounded-4 p-3 border-surface">
                                        <div className="text-secondary fw-bold small text-uppercase">KCAL</div>
                                        <div className="fs-2 fw-black text-warning">🔥 {summaryData?.kcal}</div>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div className="bg-body rounded-4 p-3 border-surface position-relative">
                                        <div className="text-secondary fw-bold small text-uppercase">EXP</div>
                                        <div className="fs-2 fw-black text-info">⭐ +{summaryData?.exp}</div>
                                        {summaryData?.isCapped && (
                                            <div className="position-absolute bottom-0 start-0 w-100 bg-warning text-dark fw-bold p-1" style={{ fontSize: '0.65rem' }}>
                                                {t('exercise_list.exp_limit_reached')}
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                            
                            <div className="mt-4 pt-3 border-top border-secondary">
                                <Button 
                                    className="w-100 py-3 fw-black rounded-pill border-0" 
                                    style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.4)' }}
                                    onClick={() => setShowSummaryModal(false)}
                                >
                                    {t('exercise_list.continue')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <style>{`
                .text-shadow {
                    text-shadow: 0 2px 5px rgba(0,0,0,0.8);
                }
                @keyframes scan {
                    0% { top: 0%; opacity: 0.8; }
                    50% { top: 100%; opacity: 0.3; }
                    100% { top: 0%; opacity: 0.8; }
                }
                @keyframes blink-anim {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}</style>
        </Container>
    );
}