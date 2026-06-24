import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function Home() {
  // Mock data 8 nhóm cơ theo thiết kế Figma
  const muscleGroups = [
    { id: 1, name: "NGỰC", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFQeuM4fjr9iAYaik1DiYyRfSPKPpM9QEDBswmFT7YHRBdxnc3AswTD2qm&s=10" },
    { id: 2, name: "LƯNG", img: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=600" },
    { id: 3, name: "VAI", img: "https://n7media.coolmate.me/image/June2025/cac-bai-tap-gym-co-vai-cho-nam-gymer-358_225.jpg" },
    { id: 4, name: "TAY", img: "https://file.hstatic.net/200001007715/article/bai-tap-tang-co-tay_thumb_848a93e9f8404e63888b26e7e52cc412.webp" },
    { id: 5, name: "BỤNG / CORE", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6NGm438DYyvcuFwavjUKe1PM24x3JrdS2ddXbcQ8h0g&s=10" },
    { id: 6, name: "CHÂN", img: "https://thanhnien.mediacdn.vn/Uploaded/ngocquy/2022_03_14/1-tap-dui-shutterstock-7679.jpg" },
    { id: 7, name: "MÔNG", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8s61VO6c7v2ATkXQw2qgitWyxhKwzD5zSompQL88j9O2ck3lRQKuQ9Tc&s=10" },
    { id: 8, name: "SKILLS", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4KdsSVoUyajhhke9Dr6XNT0_7h9J12fZcNV8seyxT_NqptCkbAmrKF_M&s=10" },
  ];

  return (
    <Container className="py-5">

      {/* PHẦN 1: LỘ TRÌNH CÁ NHÂN (Hero Section) */}
      <div className="mb-5">
        <h2 className="fw-bold mb-1">LỘ TRÌNH CÁ NHÂN</h2>
        <p className="text-muted">TẠO TỰ ĐỘNG DỰA TRÊN CHỈ SỐ CƠ THỂ CỦA BẠN</p>

        <Card className="hero-card p-4 mt-4 border-0">
          <Row>
            <Col lg={8}>
              <h1 className="fw-bold display-5 mb-3">Giáo án <span className="text-neon">TĂNG CƠ TỐI ƯU</span></h1>
              <p className="text-muted mb-4" style={{ maxWidth: '600px' }}>
                Dựa trên mục tiêu tăng 3kg cơ nạc trong 2 tháng của bạn. Hôm nay chúng ta sẽ tập trung vào nhóm cơ lớn với cường độ cao (Hypertrophy).
              </p>

              {/* Thông số user */}
              <Row className="text-muted small fw-bold">
                <Col xs={4}>
                  <div className="mb-1">📏 CHIỀU CAO</div>
                  <div className="fs-5">175 <span className="fs-6">cm</span></div>
                </Col>
                <Col xs={4}>
                  <div className="mb-1">⚖️ CÂN NẶNG</div>
                  <div className="fs-5">72 <span className="fs-6">kg</span></div>
                </Col>
                <Col xs={4}>
                  <div className="mb-1">🎯 MỤC TIÊU</div>
                  <div className="text-neon fs-5">75 <span className="fs-6">kg</span></div>
                </Col>
              </Row>
            </Col>

            {/* Card Tiến độ bên phải */}
            <Col lg={4} className="mt-4 mt-lg-0">
              <Card className="bg-body-secondary border-0 p-3 h-100" style={{ borderRadius: '12px' }}>
                <div className="d-flex justify-content-between align-items-end mb-2">
                  <span className="text-muted fw-bold small">TIẾN ĐỘ KHÓA HỌC</span>
                  <span className="text-neon fw-bold fs-4">46%</span>
                </div>
                <div className="progress-custom mb-3">
                  <div className="progress-bar-neon" style={{ width: '46%' }}></div>
                </div>
                <div className="d-flex justify-content-between text-muted small fw-bold mb-4">
                  <span>NGÀY 1</span>
                  <span >NGÀY 14</span>
                  <span>NGÀY 30</span>
                </div>

                <div className="mt-auto">
                  <div className="text-neon small fw-bold mb-1">BÀI TẬP HÔM NAY</div>
                  <h4 className="fw-bold">SỨC MẠNH TOÀN THÂN</h4>
                  <div className="text-muted small">
                    <span className="me-3">📉 5 Bài tập</span>
                    <span>🔥 450 kcal</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>

      {/* PHẦN 2: LƯỚI CÁC NHÓM CƠ */}
      <div className="mt-5">
        <h3 className="fw-bold mb-4">DANH SÁCH BÀI TẬP</h3>
        <Row className="g-4">
          {muscleGroups.map((muscle) => (
            <Col md={6} lg={3} key={muscle.id}>
              <div className="muscle-card">
                <img src={muscle.img} alt={muscle.name} />
                <div className="muscle-title">{muscle.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

    </Container>
  );
}