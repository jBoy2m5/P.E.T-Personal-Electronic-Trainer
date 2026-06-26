import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const markDayAsTrained = (exerciseTitle) => {
    const key = getTodayKey();
    const saved = localStorage.getItem('pet-schedule');
    const scheduleData = saved ? JSON.parse(saved) : {};

    const existing = scheduleData[key] || { trained: false, note: '', completedExercises: [] };
    existing.trained = true;

    if (!existing.completedExercises) existing.completedExercises = [];
    if (!existing.completedExercises.includes(exerciseTitle)) {
        existing.completedExercises.push(exerciseTitle);
    }
    existing.note = `Đã hoàn thành: ${existing.completedExercises.join(', ')}`;

    scheduleData[key] = existing;
    localStorage.setItem('pet-schedule', JSON.stringify(scheduleData));
    
    // Đẩy event để component Daily cập nhật ngay lập tức nếu cần
    window.dispatchEvent(new Event('storage'));
};

const getCompletedToday = () => {
    const key = getTodayKey();
    const saved = localStorage.getItem('pet-schedule');
    if (!saved) return [];
    const data = JSON.parse(saved);
    return data[key]?.completedExercises || [];
};

export default function ExerciseList() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [completedExercises, setCompletedExercises] = useState(getCompletedToday());

    // States cho AI Camera Modal
    const [showAIModal, setShowAIModal] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [simReps, setSimReps] = useState(0);
    const [simSets, setSimSets] = useState(1);
    const [targetReps, setTargetReps] = useState(0);
    const [targetSets, setTargetSets] = useState(0);
    const [aiStatus, setAiStatus] = useState('');

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

    const muscleGroupData = {
        1: { name: 'NGỰC (CHEST)', desc: 'Phát triển toàn diện vòng 1. AI sẽ tự động chấm điểm form tập của bạn.', exercises: [
            { exercise_id: 101, name: 'Hít đất cơ bản (Standard Push-up)', reps: '15', sets: '3', kcal: 45, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: 'Giúp săn chắc toàn bộ cơ ngực, vai và tay sau. Cải thiện sức bền thân trên.', safety_notes: 'Không võng lưng', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 },
            { exercise_id: 102, name: 'Hít đất hẹp tay (Diamond Push-up)', reps: '10', sets: '3', kcal: 55, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: 'Tập trung sâu vào cơ ngực trong và cơ tay sau (tricep).', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.2 },
            { exercise_id: 103, name: 'Đẩy ngực với tạ đơn (Dumbbell Press)', reps: '12', sets: '4', kcal: 65, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: 'Tăng cường khối lượng cơ bắp vùng ngực, cân bằng sức mạnh hai bên cơ thể.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.5 }
        ]},
        2: { name: 'LƯNG (BACK)', desc: 'Lưng xô cắt nét, rèn luyện tư thế vững chắc.', exercises: [
            { exercise_id: 201, name: 'Hít xà đơn (Pull-up)', reps: '8', sets: '3', kcal: 60, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: 'Bài tập kinh điển phát triển cơ xô, cơ lưng giữa và bắp tay trước.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 2.0 },
            { exercise_id: 202, name: 'Kéo lưng với dây kháng lực', reps: '15', sets: '3', kcal: 40, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: 'Cải thiện tư thế gù lưng, làm săn chắc vùng lưng trên.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 0.8 }
        ]},
        3: { name: 'VAI (SHOULDERS)', desc: 'Vai rộng chuẩn form, cải thiện sức mạnh thân trên.', exercises: [
            { exercise_id: 301, name: 'Đẩy vai tạ đơn (Dumbbell Shoulder Press)', reps: '12', sets: '4', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 },
            { exercise_id: 302, name: 'Nâng vai ngang (Lateral Raise)', reps: '15', sets: '3', kcal: 45, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 }
        ]},
        4: { name: 'TAY (ARMS)', desc: 'Bắp tay cuồn cuộn, săn chắc mạnh mẽ.', exercises: [
            { exercise_id: 401, name: 'Cuốn tạ đơn (Bicep Curls)', reps: '15', sets: '3', kcal: 40, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 0.8 },
            { exercise_id: 402, name: 'Đẩy tay sau (Tricep Dips)', reps: '12', sets: '3', kcal: 45, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.2 }
        ]},
        5: { name: 'BỤNG / CORE (ABS)', desc: 'Cơ cốt lõi vững chắc, rèn luyện 6 múi.', exercises: [
            { exercise_id: 501, name: 'Gập bụng (Crunches)', reps: '20', sets: '3', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: 'Giúp săn chắc cơ bụng thẳng, giảm mỡ vùng eo nếu kết hợp cardio tốt.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 0.8 },
            { exercise_id: 502, name: 'Plank', reps: '60', sets: '3', kcal: 40, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: 'Phát triển toàn diện cơ cốt lõi (Core), tăng cường sức chịu đựng của cột sống.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 0.5 }
        ]},
        6: { name: 'CHÂN (LEGS)', desc: 'Đôi chân linh hoạt, sức mạnh bức phá.', exercises: [
            { exercise_id: 601, name: 'Squat cơ bản', reps: '15', sets: '4', kcal: 70, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: 'Bài tập Vua cho thân dưới, phát triển đùi trước, đùi sau và mông.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.2 },
            { exercise_id: 602, name: 'Lunge (Chùng chân)', reps: '12', sets: '3', kcal: 65, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: 'Cải thiện khả năng giữ thăng bằng và sức mạnh đơn chân.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.8 }
        ]},
        7: { name: 'MÔNG (GLUTES)', desc: 'Phát triển vòng 3 săn chắc, quyến rũ.', exercises: [
            { exercise_id: 701, name: 'Glute Bridge (Nâng mông)', reps: '15', sets: '3', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 },
            { exercise_id: 702, name: 'Kickback', reps: '15', sets: '3', kcal: 45, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 }
        ]},
        8: { name: 'SKILLS', desc: 'Thử thách cơ thể với những kỹ năng nâng cao.', exercises: [
            { exercise_id: 801, name: 'Handstand (Trồng chuối)', reps: '30', sets: '3', kcal: 60, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: 'Kỹ năng thăng bằng đỉnh cao, cực tốt cho cơ vai và khả năng kiểm soát cơ thể.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 2.0 },
            { exercise_id: 802, name: 'Muscle-up', reps: '5', sets: '3', kcal: 80, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: 'Sức mạnh bùng nổ, kết hợp giữa kéo xà và đẩy tay sau.', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 5.0 }
        ]}
    };

    const groupData = muscleGroupData[id] || muscleGroupData[1];
    const exercises = groupData.exercises;

    // Mở chi tiết bài tập
    const handleOpenDetail = (exercise) => {
        if (completedExercises.includes(exercise.name)) return;
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
        markDayAsTrained(currentExercise.name);
        setCompletedExercises(prev => [...prev, currentExercise.name]);
        setShowManualModal(false);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#00ff88', '#ffffff'], zIndex: 1060 });
    };

    // Logic giả lập AI đếm reps
    useEffect(() => {
        let timer;
        if (showAIModal && currentExercise) {
            const startDelay = setTimeout(() => {
                setAiStatus('Form chuẩn! Đang theo dõi...');
                timer = setInterval(() => {
                    setSimReps(prevReps => {
                        const newReps = prevReps + 1;
                        if (newReps >= targetReps) {
                            // Đạt đủ reps cho set này
                            setSimSets(prevSets => {
                                const newSets = prevSets + 1;
                                if (newSets > targetSets) {
                                    // Hoàn thành toàn bộ
                                    clearInterval(timer);
                                    setAiStatus('Hoàn thành xuất sắc! Đang lưu dữ liệu...');
                                    
                                    // ... Logic lưu vào localStorage
                                    const sessionId = Math.floor(Math.random() * 1000000);
                                    const sessionData = {
                                        session_id: sessionId,
                                        user_id: 1,
                                        start_time: new Date(Date.now() - 60000).toISOString(),
                                        end_time: new Date().toISOString(),
                                        total_calories_burned: Math.round(currentExercise.estimated_calories_per_rep * targetReps * targetSets),
                                        total_valid_reps: targetReps * targetSets
                                    };
                                    const savedSessions = JSON.parse(localStorage.getItem('workout-sessions') || '[]');
                                    savedSessions.push(sessionData);
                                    localStorage.setItem('workout-sessions', JSON.stringify(savedSessions));

                                    setTimeout(() => {
                                        markDayAsTrained(currentExercise.name);
                                        setCompletedExercises(prev => [...prev, currentExercise.name]);
                                        setShowAIModal(false);
                                    }, 1500);
                                    return prevSets;
                                } else {
                                    // Chuyển sang set mới
                                    setAiStatus('Nghỉ ngơi 1 lát...');
                                    setTimeout(() => {
                                        if (showAIModal) setAiStatus('Form chuẩn! Đang theo dõi...');
                                    }, 2000);
                                    return newSets;
                                }
                            });
                            return 0; // reset reps
                        }
                        return newReps;
                    });
                }, workoutMode === 'time' ? 1000 : 800); // 1s cho time, 0.8s cho reps
            }, 2000);

            return () => { clearTimeout(startDelay); clearInterval(timer); };
        }
    }, [showAIModal, currentExercise, targetReps, targetSets, workoutMode]);

    return (
        <Container className="py-5">
            <Button
                variant="link"
                className="text-secondary text-decoration-none p-0 mb-4 d-flex align-items-center fw-bold"
                onClick={() => navigate(-1)}
            >
                <span className="fs-4 me-2">←</span> QUAY LẠI
            </Button>

            <div className="mb-5">
                <h2 className="fw-black mb-1 text-primary-dynamic text-uppercase">
                    BÀI TẬP <span style={{ color: 'var(--brand-neon)' }}>{groupData.name}</span>
                </h2>
                <p className="text-secondary fw-bold">{groupData.desc}</p>
            </div>

            <Row className="g-4">
                {exercises.map((ex) => {
                    const isDone = completedExercises.includes(ex.name);
                    return (
                        <Col md={6} lg={4} key={ex.exercise_id}>
                            <Card className="h-100 shadow-sm border-surface bg-surface-card overflow-hidden"
                                style={{ transition: 'transform 0.2s', cursor: isDone ? 'default' : 'pointer', opacity: isDone ? 0.7 : 1, borderRadius: '20px' }}
                                onClick={() => !isDone && handleOpenDetail(ex)}
                                onMouseOver={(e) => !isDone && (e.currentTarget.style.transform = 'translateY(-5px)')}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                    <Card.Img variant="top" src={ex.img}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <Badge bg="dark" className="position-absolute top-0 end-0 m-3 opacity-75 fs-6">
                                        {ex.level}
                                    </Badge>
                                    {isDone && (
                                        <div className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fw-black"
                                            style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '0.8rem' }}>
                                            ✓ ĐÃ HOÀN THÀNH
                                        </div>
                                    )}
                                    <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                        <Card.Title className="fw-black text-white fs-5 mb-0">{ex.name}</Card.Title>
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
                                <span className="text-white fw-bold">VIDEO HƯỚNG DẪN</span>
                            </div>
                            <Button variant="link" className="position-absolute top-0 end-0 text-white m-3 text-decoration-none" onClick={() => setShowDetailModal(false)}>
                                <span className="fs-2 fw-bold text-shadow">&times;</span>
                            </Button>
                        </div>
                        <Modal.Body className="p-4 p-md-5">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h3 className="fw-black text-primary-dynamic mb-1">{selectedDetail.name}</h3>
                                    <div className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                                        Nhóm cơ: <span style={{ color: 'var(--brand-neon)' }}>{groupData.name}</span>
                                    </div>
                                </div>
                                <div className="text-warning fs-4" style={{ letterSpacing: '2px' }}>
                                    {selectedDetail.level === 'Nâng cao' ? '★★★★★' : selectedDetail.level === 'Trung bình' ? '★★★☆☆' : '★★☆☆☆'}
                                </div>
                            </div>
                            
                            <Row className="mb-4">
                                <Col md={6} className="mb-4 mb-md-0">
                                    <div className="mb-4">
                                        <h6 className="fw-black text-secondary text-uppercase mb-2" style={{ fontSize: '0.85rem' }}>Mô Tả & Tác Dụng</h6>
                                        <p className="text-primary-dynamic mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            {selectedDetail.technical_description || `Bài tập lý tưởng để phát triển ${groupData.name.toLowerCase()}, giúp xây dựng sức mạnh cơ bắp và cải thiện sức bền toàn diện. Phù hợp cho mọi cấp độ.`}
                                        </p>
                                    </div>
                                    <div>
                                        <h6 className="fw-black text-secondary text-uppercase mb-2" style={{ fontSize: '0.85rem' }}>Lưu ý an toàn</h6>
                                        <p className="text-danger fw-bold mb-0" style={{ fontSize: '0.9rem' }}>
                                            {selectedDetail.safety_notes || 'Giữ tư thế chuẩn, không khóa khớp hoàn toàn khi thực hiện động tác để tránh chấn thương.'}
                                        </p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="bg-surface-main p-4 rounded-4 border-surface h-100 d-flex flex-column">
                                        <h6 className="fw-black text-primary-dynamic mb-3 text-uppercase text-center">Tùy Chỉnh Chế Độ Tập</h6>
                                        
                                        <div className="d-flex gap-2 mb-4">
                                            <Button 
                                                variant={workoutMode === 'reps' ? 'success' : 'outline-secondary'} 
                                                className={`flex-grow-1 fw-bold rounded-pill ${workoutMode === 'reps' ? 'border-0' : ''}`}
                                                style={workoutMode === 'reps' ? { background: 'var(--brand-neon)', color: '#000' } : {}}
                                                onClick={() => { setWorkoutMode('reps'); setCustomTarget(parseInt(selectedDetail.reps)); }}
                                            >
                                                THEO REPS
                                            </Button>
                                            <Button 
                                                variant={workoutMode === 'time' ? 'success' : 'outline-secondary'} 
                                                className={`flex-grow-1 fw-bold rounded-pill ${workoutMode === 'time' ? 'border-0' : ''}`}
                                                style={workoutMode === 'time' ? { background: 'var(--brand-neon)', color: '#000' } : {}}
                                                onClick={() => { setWorkoutMode('time'); setCustomTarget(60); }}
                                            >
                                                THỜI GIAN
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
                                                    <span className="text-secondary fw-bold text-uppercase" style={{ fontSize: '0.85rem' }}>{workoutMode === 'reps' ? 'Reps' : 'Giây'}</span>
                                                </div>
                                                <Button variant="link" className="text-secondary text-decoration-none fw-bold fs-3 px-3" onClick={() => setCustomTarget(prev => prev + (workoutMode === 'time' ? 10 : 1))}>+</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Đồng bộ 2 nút tập */}
                            <div className="d-flex gap-3 mt-4">
                                <Button 
                                    className="flex-fill py-3 fw-black rounded-pill border-0"
                                    style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }}
                                    onClick={() => handleStartFromDetail(true)}
                                >
                                    ⚡ TẬP VỚI AI
                                </Button>
                                <Button 
                                    className="flex-fill py-3 fw-black rounded-pill border-2 bg-transparent"
                                    style={{ borderColor: 'var(--brand-neon)', color: 'var(--brand-neon)', fontSize: '1rem' }}
                                    onClick={() => handleStartFromDetail(false)}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--brand-neon)'; e.currentTarget.style.color = '#000'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand-neon)'; }}
                                >
                                    TẬP CƠ BẢN
                                </Button>
                            </div>
                        </Modal.Body>
                    </>
                )}
            </Modal>

            {/* AI Camera Tracker Modal */}
            <Modal show={showAIModal} backdrop="static" keyboard={false} centered
                contentClassName="border-0 rounded-4 overflow-hidden shadow-lg"
                style={{ '--bs-modal-bg': '#1a1a1c' }}>
                <Modal.Body className="bg-surface-main text-primary-dynamic p-0 position-relative">
                    {/* Fake Camera Feed Background */}
                    <div style={{
                        height: '500px', width: '100%',
                        backgroundImage: currentExercise ? `url(${currentExercise.img})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5,
                        position: 'relative'
                    }}>
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
                                <h4 className="fw-black text-white mb-0 text-uppercase text-shadow">{currentExercise?.name}</h4>
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
                    <h4 className="fw-black text-primary-dynamic mb-2 text-uppercase">{currentExercise?.name}</h4>
                    <div className="mb-4">
                        <Badge bg="success" className="fs-6 px-3 py-2 rounded-pill">
                            SET {manualCurrentSet} / {targetSets}
                        </Badge>
                    </div>

                    <p className="text-secondary fw-bold mb-4" style={{ fontSize: '0.95rem' }}>
                        {workoutMode === 'reps' ? `Mục tiêu: ${targetReps} Reps.` : `Mục tiêu: ${targetReps} giây.`}
                        <br/>
                        {!manualIsResting ? (
                            <span className="text-primary-dynamic">
                                {workoutMode === 'reps' ? 'Tập theo tốc độ của bạn. Bấm xác nhận khi xong.' : 'Hoàn thành đếm ngược để kết thúc Set.'}
                            </span>
                        ) : <span className="text-success">Hoàn thành Set xuất sắc! Nghỉ ngơi một lát nhé.</span>}
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
                                    </>
                                ) : (
                                    <div className="fw-black text-success" style={{ fontSize: '2.5rem' }}>XONG!</div>
                                )
                            ) : (
                                !manualIsResting ? (
                                    <>
                                        <div className="fw-black text-primary-dynamic" style={{ fontSize: '4.5rem', lineHeight: '1' }}>{targetReps}</div>
                                        <div className="text-secondary fw-bold text-uppercase mt-1" style={{ letterSpacing: '2px' }}>Reps</div>
                                    </>
                                ) : (
                                    <div className="fw-black text-success" style={{ fontSize: '2.5rem' }}>XONG!</div>
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
                                        ✓ ĐÃ TẬP XONG SET NÀY
                                    </Button>
                                )}
                                <Button variant="outline-danger" className="fw-bold py-3 rounded-pill" onClick={() => setShowManualModal(false)}>
                                    HỦY BÀI TẬP
                                </Button>
                            </>
                        ) : (
                            manualCurrentSet < targetSets ? (
                                <Button 
                                    className="w-100 py-3 fw-black border-0 rounded-pill"
                                    style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(var(--brand-neon-rgb), 0.3)' }}
                                    onClick={handleNextSet}
                                >
                                    BẮT ĐẦU SET {manualCurrentSet + 1}
                                </Button>
                            ) : (
                                <Button 
                                    className="w-100 py-3 fw-black border-0 rounded-pill btn-success text-white"
                                    style={{ fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(25,135,84, 0.4)' }}
                                    onClick={handleFinishManual}
                                >
                                    HOÀN THÀNH TOÀN BỘ & NHẬN THƯỞNG
                                </Button>
                            )
                        )}
                        {manualIsResting && (
                            <Button variant="link" className="text-secondary text-decoration-none fw-bold" onClick={() => setShowManualModal(false)}>
                                DỪNG SỚM (KHÔNG LƯU)
                            </Button>
                        )}
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