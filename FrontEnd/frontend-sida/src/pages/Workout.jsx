import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

export default function Workout() {
  // 1. Khởi tạo các State (Trạng thái)
  const [isExercising, setIsExercising] = useState(false);
  const [reps, setReps] = useState(0);
  const [kcal, setKcal] = useState(0.0);
  const [time, setTime] = useState(0); // Tính bằng giây

  // Hằng số tính Kcal giả định (VD: Hít đất, người 70kg -> ~0.35 kcal/rep)
  const KCAL_PER_REP = 0.35;

  // 2. Logic đếm thời gian (Chỉ chạy khi đang tập)
  useEffect(() => {
    let timer;
    if (isExercising) {
      timer = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExercising]);

  // Format thời gian từ giây sang dạng MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 3. Hàm xử lý khi AI bắt được 1 Rep chuẩn
  const handleAIRepDetected = () => {
    if (!isExercising) return;
    setReps((prevReps) => prevReps + 1);
    setKcal((prevKcal) => prevKcal + KCAL_PER_REP);
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 fw-bold">
        <span className="text-neon">⚡</span> THEO DÕI TRỰC TIẾP
      </h2>
      <p className="text-muted mb-4">
        Lượng calo tiêu thụ sẽ được hệ thống tính toán trực tiếp dựa trên số rep thực tế của bạn.
      </p>

      <Card className="card-custom p-4 shadow-lg">
        <Row className="align-items-center text-center text-md-start">
          
          {/* CỘT TRÁI: ĐIỀU KHIỂN & CAMERA */}
          <Col md={6} className="mb-4 mb-md-0">
            <div className="d-flex justify-content-between mb-3 text-muted fw-bold">
              <span>TRẠNG THÁI</span>
              <span className={isExercising ? "text-neon" : ""}>
                {isExercising ? "⏸ ĐANG TẬP" : "⏸ ĐANG NGHỈ"}
              </span>
            </div>

            {/* Chỗ này sau sẽ là khung render Camera MediaPipe */}
            <div className="bg-dark rounded mb-4 d-flex align-items-center justify-content-center" style={{height: '200px', border: '1px dashed #555'}}>
                <span className="text-muted">Khu vực hiển thị Camera AI</span>
            </div>

            <Button 
              className="bg-neon w-100 py-3 rounded-pill mb-3"
              onClick={() => setIsExercising(!isExercising)}
            >
              {isExercising ? "TẠM DỪNG" : "▷ TIẾP TỤC TẬP"}
            </Button>
            
            <div className="text-center text-muted" style={{cursor: 'pointer'}}>
              LÀM MỚI QUÁ TRÌNH (RESET)
            </div>
          </Col>

          {/* CỘT PHẢI: BỘ ĐẾM THÔNG SỐ */}
          <Col md={6} className="d-flex flex-column align-items-center">
            
            <div className="circle-progress mb-3 position-relative">
              <h1 className="fw-bold mb-0" style={{fontSize: '3.5rem'}}>{kcal.toFixed(1)}</h1>
              <span className="text-muted small fw-bold">KCAL TIÊU HAO</span>
              
              <div className="position-absolute" style={{bottom: '-20px'}}>
                 <span className="bg-dark px-3 py-1 rounded-pill border border-secondary">
                    ⏱ {formatTime(time)}
                 </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-neon fw-bold mb-0">{reps}</h2>
              <span className="text-muted fw-bold">TỔNG SỐ REP</span>
            </div>

            {/* Nút giả lập AI cho lúc Demo hoặc Code - Sau này sẽ ẩn đi */}
            <Button variant="outline-light" size="sm" className="mt-4" onClick={handleAIRepDetected}>
              [Test] Giả lập AI nhận 1 Rep
            </Button>

          </Col>
        </Row>
      </Card>

      {/* AI COACH MASCOT */}
      <div className="position-fixed" style={{bottom: '20px', right: '20px', width: '250px'}}>
        <div className="bg-neon p-3 rounded-3 mb-2 shadow position-relative text-dark fw-bold">
          {reps === 0 ? "Chào sếp! Bấm Tiếp tục tập để tôi tính calo nhé!" : `Tuyệt vời! Đã hoàn thành ${reps} rep, cố lên!`}
          <div className="position-absolute" style={{bottom: '-8px', right: '40px', width: '15px', height: '15px', backgroundColor: 'var(--neon-green)', transform: 'rotate(45deg)'}}></div>
        </div>
        <div className="text-end">
          <img src="https://via.placeholder.com/60" alt="AI Coach" className="rounded-circle border border-2 border-neon" />
        </div>
      </div>
    </Container>
  );
}