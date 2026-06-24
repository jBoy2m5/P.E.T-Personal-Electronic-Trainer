import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExerciseList() {
    const navigate = useNavigate();
    const { id } = useParams();

    const muscleGroupData = {
        1: { name: 'NGỰC (CHEST)', desc: 'Phát triển toàn diện vòng 1. AI sẽ tự động chấm điểm form tập của bạn.', exercises: [
            { id: 101, title: 'Hít đất cơ bản (Standard Push-up)', reps: '15 Reps', sets: '3 Sets', kcal: 45, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
            { id: 102, title: 'Hít đất hẹp tay (Diamond Push-up)', reps: '10 Reps', sets: '3 Sets', kcal: 55, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
            { id: 103, title: 'Đẩy ngực với tạ đơn (Dumbbell Press)', reps: '12 Reps', sets: '4 Sets', kcal: 65, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' }
        ]},
        2: { name: 'LƯNG (BACK)', desc: 'Lưng xô cắt nét, rèn luyện tư thế vững chắc.', exercises: [
            { id: 201, title: 'Hít xà đơn (Pull-up)', reps: '8 Reps', sets: '3 Sets', kcal: 60, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
            { id: 202, title: 'Kéo lưng với dây kháng lực', reps: '15 Reps', sets: '3 Sets', kcal: 40, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' }
        ]},
        3: { name: 'VAI (SHOULDERS)', desc: 'Vai rộng chuẩn form, cải thiện sức mạnh thân trên.', exercises: [
            { id: 301, title: 'Đẩy vai tạ đơn (Dumbbell Shoulder Press)', reps: '12 Reps', sets: '4 Sets', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
            { id: 302, title: 'Nâng vai ngang (Lateral Raise)', reps: '15 Reps', sets: '3 Sets', kcal: 45, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' }
        ]},
        4: { name: 'TAY (ARMS)', desc: 'Bắp tay cuồn cuộn, săn chắc mạnh mẽ.', exercises: [
            { id: 401, title: 'Cuốn tạ đơn (Bicep Curls)', reps: '15 Reps', sets: '3 Sets', kcal: 40, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
            { id: 402, title: 'Đẩy tay sau (Tricep Dips)', reps: '12 Reps', sets: '3 Sets', kcal: 45, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' }
        ]},
        5: { name: 'BỤNG / CORE (ABS)', desc: 'Cơ cốt lõi vững chắc, rèn luyện 6 múi.', exercises: [
            { id: 501, title: 'Gập bụng (Crunches)', reps: '20 Reps', sets: '3 Sets', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
            { id: 502, title: 'Plank', reps: '60s', sets: '3 Sets', kcal: 40, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' }
        ]},
        6: { name: 'CHÂN (LEGS)', desc: 'Đôi chân linh hoạt, sức mạnh bức phá.', exercises: [
            { id: 601, title: 'Squat cơ bản', reps: '15 Reps', sets: '4 Sets', kcal: 70, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
            { id: 602, title: 'Lunge (Chùng chân)', reps: '12 Reps/chân', sets: '3 Sets', kcal: 65, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' }
        ]},
        7: { name: 'MÔNG (GLUTES)', desc: 'Phát triển vòng 3 săn chắc, quyến rũ.', exercises: [
            { id: 701, title: 'Glute Bridge (Nâng mông)', reps: '15 Reps', sets: '3 Sets', kcal: 50, level: 'Cơ bản', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
            { id: 702, title: 'Kickback', reps: '15 Reps/chân', sets: '3 Sets', kcal: 45, level: 'Trung bình', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' }
        ]},
        8: { name: 'SKILLS', desc: 'Thử thách cơ thể với những kỹ năng nâng cao.', exercises: [
            { id: 801, title: 'Handstand (Trồng chuối)', reps: '30s', sets: '3 Sets', kcal: 60, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1598971639058-fab354f66c09?q=80&w=600' },
            { id: 802, title: 'Muscle-up', reps: '5 Reps', sets: '3 Sets', kcal: 80, level: 'Nâng cao', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' }
        ]}
    };

    const groupData = muscleGroupData[id] || muscleGroupData[1];
    const exercises = groupData.exercises;

    // Tính tổng Kcal của các bài tập trong nhóm này
    const totalKcal = exercises.reduce((sum, ex) => sum + ex.kcal, 0);

    return (
        <Container className="py-5">
            {/* Nút quay lại trang chủ */}
            <Button
                variant="link"
                className="text-secondary text-decoration-none p-0 mb-4 d-flex align-items-center"
                onClick={() => navigate('/')}
            >
                <span className="fs-4 me-2">←</span> QUAY LẠI
            </Button>

            {/* Tiêu đề trang */}
            <div className="mb-5">
                <h2 className="fw-bold mb-1 text-body">
                    BÀI TẬP <span className="text-success">{groupData.name}</span>
                </h2>
                <p className="text-secondary">
                    {groupData.desc}
                </p>
            </div>

            {/* Danh sách thẻ bài tập */}
            <Row className="g-4">
                {exercises.map((ex) => (
                    <Col md={6} lg={4} key={ex.id}>
                        <Card className="h-100 shadow-sm border-0 bg-body-tertiary overflow-hidden" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>

                            {/* Ảnh Thumbnail */}
                            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                <Card.Img
                                    variant="top"
                                    src={ex.img}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {/* Tag mức độ khó nổi trên ảnh */}
                                <Badge
                                    bg="dark"
                                    className="position-absolute top-0 end-0 m-3 opacity-75"
                                >
                                    {ex.level}
                                </Badge>
                            </div>

                            {/* Nội dung Card */}
                            <Card.Body className="d-flex flex-column p-4">
                                <Card.Title className="fw-bold text-body fs-5 mb-3">{ex.title}</Card.Title>

                                <div className="d-flex justify-content-between align-items-center mb-4 text-secondary small fw-bold">
                                    <span>🔄 {ex.sets} x {ex.reps}</span>
                                    <span className="text-success">🔥 {ex.kcal} kcal</span>
                                </div>

                                {/* Nút Bắt đầu tập (Chuyển sang luồng Camera AI) */}
                                <Button
                                    variant="success"
                                    className="mt-auto w-100 fw-bold rounded-pill"
                                    onClick={() => alert(`Chuẩn bị bật AI Camera cho bài: ${ex.title}`)}
                                >
                                    TẬP NGAY ⚡
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}