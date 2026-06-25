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

    const muscleGroupData = {
        1: { name: 'NGỰC (CHEST)', desc: 'Phát triển toàn diện vòng 1. AI sẽ tự động chấm điểm form tập của bạn.', exercises: [
            { exercise_id: 101, name: 'Hít đất cơ bản (Standard Push-up)', reps: '15', sets: '3', kcal: 45, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: 'Giữ lưng thẳng, hạ thân người...', safety_notes: 'Không võng lưng', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 },
            { exercise_id: 102, name: 'Hít đất hẹp tay (Diamond Push-up)', reps: '10', sets: '3', kcal: 55, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.2 },
            { exercise_id: 103, name: 'Đẩy ngực với tạ đơn (Dumbbell Press)', reps: '12', sets: '4', kcal: 65, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.5 }
        ]},
        2: { name: 'LƯNG (BACK)', desc: 'Lưng xô cắt nét, rèn luyện tư thế vững chắc.', exercises: [
            { exercise_id: 201, name: 'Hít xà đơn (Pull-up)', reps: '8', sets: '3', kcal: 60, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 2.0 },
            { exercise_id: 202, name: 'Kéo lưng với dây kháng lực', reps: '15', sets: '3', kcal: 40, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 0.8 }
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
            { exercise_id: 501, name: 'Gập bụng (Crunches)', reps: '20', sets: '3', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 0.8 },
            { exercise_id: 502, name: 'Plank', reps: '60', sets: '3', kcal: 40, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 0.5 }
        ]},
        6: { name: 'CHÂN (LEGS)', desc: 'Đôi chân linh hoạt, sức mạnh bức phá.', exercises: [
            { exercise_id: 601, name: 'Squat cơ bản', reps: '15', sets: '4', kcal: 70, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.2 },
            { exercise_id: 602, name: 'Lunge (Chùng chân)', reps: '12', sets: '3', kcal: 65, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.8 }
        ]},
        7: { name: 'MÔNG (GLUTES)', desc: 'Phát triển vòng 3 săn chắc, quyến rũ.', exercises: [
            { exercise_id: 701, name: 'Glute Bridge (Nâng mông)', reps: '15', sets: '3', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 },
            { exercise_id: 702, name: 'Kickback', reps: '15', sets: '3', kcal: 45, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 1.0 }
        ]},
        8: { name: 'SKILLS', desc: 'Thử thách cơ thể với những kỹ năng nâng cao.', exercises: [
            { exercise_id: 801, name: 'Handstand (Trồng chuối)', reps: '30', sets: '3', kcal: 60, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 2.0 },
            { exercise_id: 802, name: 'Muscle-up', reps: '5', sets: '3', kcal: 80, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', technical_description: '', safety_notes: '', media_url: '', standard_angles: {}, estimated_calories_per_rep: 5.0 }
        ]}
    };

    const groupData = muscleGroupData[id] || muscleGroupData[1];
    const exercises = groupData.exercises;

    // Khi người dùng bấm TẬP NGAY
    const handleStartExercise = (exercise) => {
        if (completedExercises.includes(exercise.name)) return;
        setCurrentExercise(exercise);
        setTargetReps(parseInt(exercise.reps));
        setTargetSets(parseInt(exercise.sets));
        setSimReps(0);
        setSimSets(1);
        setAiStatus('Đang quét tư thế của bạn...');
        setShowAIModal(true);
    };

    // Logic giả lập AI đếm reps
    useEffect(() => {
        let timer;
        if (showAIModal && currentExercise) {
            // Giả lập sau 2s bắt đầu đếm
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
                                    
                                    // Tạo và lưu session theo DB Schema
                                    const sessionId = Math.floor(Math.random() * 1000000);
                                    const sessionData = {
                                        session_id: sessionId,
                                        user_id: 1, // Mock user ID
                                        start_time: new Date(Date.now() - 60000).toISOString(), // Mock 1 phút trước
                                        end_time: new Date().toISOString(),
                                        total_calories_burned: Math.round(currentExercise.estimated_calories_per_rep * targetReps * targetSets),
                                        total_valid_reps: targetReps * targetSets
                                    };
                                    const detailData = {
                                        detail_id: Math.floor(Math.random() * 1000000),
                                        session_id: sessionId,
                                        exercise_id: currentExercise.exercise_id,
                                        reps_completed: targetReps * targetSets
                                    };
                                    
                                    const savedSessions = JSON.parse(localStorage.getItem('workout-sessions') || '[]');
                                    savedSessions.push(sessionData);
                                    localStorage.setItem('workout-sessions', JSON.stringify(savedSessions));
                                    
                                    const savedDetails = JSON.parse(localStorage.getItem('workout-details') || '[]');
                                    savedDetails.push(detailData);
                                    localStorage.setItem('workout-details', JSON.stringify(savedDetails));

                                    // Tạo thông báo mới
                                    const notifs = JSON.parse(localStorage.getItem('pet-notifications') || '[]');
                                    notifs.unshift({
                                        id: Date.now(),
                                        message: `Bạn vừa hoàn thành ${currentExercise.name} và đốt cháy ${Math.round(currentExercise.estimated_calories_per_rep * targetReps * targetSets)} kcal!`,
                                        time: new Date().toISOString(),
                                        read: false
                                    });
                                    localStorage.setItem('pet-notifications', JSON.stringify(notifs));

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
                            return 0; // reset reps cho set mới
                        }
                        return newReps;
                    });
                }, 800); // 0.8s mỗi rep (nhanh một chút cho mô phỏng đỡ nhàm chán)
            }, 2000);

            return () => { clearTimeout(startDelay); clearInterval(timer); };
        }
    }, [showAIModal, currentExercise, targetReps, targetSets]);

    return (
        <Container className="py-5">
            <Button
                variant="link"
                className="text-secondary text-decoration-none p-0 mb-4 d-flex align-items-center"
                onClick={() => navigate('/')}
            >
                <span className="fs-4 me-2">←</span> QUAY LẠI
            </Button>

            <div className="mb-5">
                <h2 className="fw-bold mb-1 text-body">
                    BÀI TẬP <span className="text-success">{groupData.name}</span>
                </h2>
                <p className="text-secondary">{groupData.desc}</p>
            </div>

            <Row className="g-4">
                {exercises.map((ex) => {
                    const isDone = completedExercises.includes(ex.name);
                    return (
                        <Col md={6} lg={4} key={ex.exercise_id}>
                            <Card className="h-100 shadow-sm border-0 bg-body-tertiary overflow-hidden"
                                style={{ transition: 'transform 0.2s', cursor: 'pointer', opacity: isDone ? 0.8 : 1 }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                    <Card.Img variant="top" src={ex.img}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <Badge bg="dark" className="position-absolute top-0 end-0 m-3 opacity-75">
                                        {ex.level}
                                    </Badge>
                                    {isDone && (
                                        <div className="position-absolute top-0 start-0 m-3 px-2 py-1 rounded-pill fw-bold"
                                            style={{ background: 'var(--brand-neon)', color: '#000', fontSize: '0.7rem' }}>
                                            ✓ ĐÃ HOÀN THÀNH
                                        </div>
                                    )}
                                </div>

                                <Card.Body className="d-flex flex-column p-4">
                                    <Card.Title className="fw-bold text-body fs-5 mb-3">{ex.name}</Card.Title>
                                    <div className="d-flex justify-content-between align-items-center mb-4 text-secondary small fw-bold">
                                        <span>🔄 {ex.sets} Sets x {ex.reps} Reps</span>
                                        <span className="text-success">🔥 {ex.kcal} kcal</span>
                                    </div>
                                    <Button
                                        variant={isDone ? 'outline-success' : 'success'}
                                        className="mt-auto w-100 fw-bold rounded-pill"
                                        disabled={isDone}
                                        onClick={() => handleStartExercise(ex)}
                                        style={isDone ? { borderColor: 'var(--brand-neon)', color: 'var(--brand-neon)' } : {}}
                                    >
                                        {isDone ? '✓ HOÀN THÀNH' : 'TẬP NGAY (AI CAMERA) ⚡'}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* AI Camera Tracker Modal */}
            <Modal show={showAIModal} backdrop="static" keyboard={false} centered
                contentClassName="border-0 rounded-4 overflow-hidden shadow-lg"
                style={{ '--bs-modal-bg': '#1a1a1c' }}>
                <Modal.Body className="bg-surface-main text-primary-dynamic p-0 position-relative">
                    {/* Fake Camera Feed Background */}
                    <div style={{
                        height: '400px', width: '100%',
                        backgroundImage: currentExercise ? `url(${currentExercise.img})` : 'none',
                        backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5,
                        position: 'relative'
                    }}>
                        {/* Fake scanning line */}
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
                                <Badge bg="danger" className="mb-2" style={{ animation: 'blink-anim 1s infinite' }}>🔴 REC</Badge>
                                <h5 className="fw-bold text-white mb-0" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{currentExercise?.name}</h5>
                                <div style={{ color: 'var(--brand-neon)', fontSize: '0.85rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                    {aiStatus}
                                </div>
                            </div>
                            <Button variant="link" className="text-white p-0 m-0 text-decoration-none" onClick={() => setShowAIModal(false)}>
                                <span className="fs-3 fw-light">&times;</span>
                            </Button>
                        </div>

                        <div className="mt-auto p-3 rounded-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Row className="text-center g-2 mb-3">
                                <Col xs={6}>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 'bold' }}>SỐ REPS</div>
                                    <div className="fw-bold" style={{ color: 'var(--brand-neon)', fontSize: '2.5rem', lineHeight: 1 }}>{simReps}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>/{targetReps}</span></div>
                                </Col>
                                <Col xs={6}>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 'bold' }}>SỐ SETS</div>
                                    <div className="fw-bold" style={{ color: '#00b4d8', fontSize: '2.5rem', lineHeight: 1 }}>{Math.min(simSets, targetSets)}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>/{targetSets}</span></div>
                                </Col>
                            </Row>
                            <ProgressBar 
                                now={(simReps / targetReps) * 100} 
                                variant="success" 
                                style={{ height: '8px', background: 'rgba(255,255,255,0.1)' }} 
                            />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <style>{`
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