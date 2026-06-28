import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function Onboarding() {
  const navigate = useNavigate();

  // State lưu trữ dữ liệu
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    gender: '',
    goal: '',
    frequency: '',
    fitnessLevel: '',
    sessionsPerWeek: 3,
    height: 170,
    weight: 65
  });

  const handleSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSliderChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      // Gọi API gửi dữ liệu Onboarding lên backend
      const res = await axiosClient.put('/users/onboarding', formData);
      
      if (res.status === 'success') {
        // Cập nhật lại thông tin user trong localStorage
        localStorage.setItem('user-data', JSON.stringify(res.user));
        navigate('/');
      } else {
        alert("Có lỗi xảy ra: " + (res.message || 'Không xác định'));
      }
    } catch (error) {
      console.error("Lỗi cập nhật onboarding:", error);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // Logic lấy ảnh động dựa theo bước và lựa chọn
  const getDynamicImage = () => {
    if (step === 1) {
      if (formData.gender === 'Nam') return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop';
      if (formData.gender === 'Nữ') return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop';
      return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop';
    }
    if (step === 2) {
      if (formData.goal === 'Giữ dáng') return 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800&auto=format&fit=crop';
      if (formData.goal === 'Xây dựng cơ bắp') return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop';
      if (formData.goal === 'Giảm cân') return 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop';
      if (formData.goal === 'Tập kĩ năng') return 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop';
      return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'; // Default cho goal
    }
    if (step === 3) return 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop';
    if (step === 4) return 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop';
    if (step === 5) return 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop';
    if (step === 6) return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop';

    return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop';
  };

  // Option Card Component
  const OptionCard = ({ label, field, value }) => {
    const isSelected = formData[field] === value;
    return (
      <div
        onClick={() => handleSelect(field, value)}
        className="p-3 p-md-4 rounded-4 text-center h-100 d-flex align-items-center justify-content-center bg-surface-card border-surface"
        style={{
          cursor: 'pointer',
          border: isSelected ? '3px solid var(--brand-neon)' : '',
          transition: 'all 0.2s ease',
          boxShadow: isSelected ? '0 0 20px rgba(var(--brand-neon-rgb),0.2)' : 'none',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)'
        }}
        onMouseOver={e => { if (!isSelected) e.currentTarget.style.borderColor = '#666'; e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseOut={e => { if (!isSelected) e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.transform = isSelected ? 'scale(1.02)' : 'scale(1)'; }}
      >
        <span className={`fw-bold fs-5 ${isSelected ? 'text-neon' : 'text-primary-dynamic'}`}>{label}</span>
      </div>
    );
  };

  // Nút Điều hướng
  const StepNavigation = ({ showNext, disableNext }) => (
    <div className="d-flex justify-content-between mt-5 gap-3">
      {step > 1 ? (
        <Button
          variant="outline-secondary"
          onClick={handleBack}
          className="fw-bold px-4 py-3 rounded-pill"
          style={{ borderWidth: '2px', color: '#fff', minWidth: '130px' }}
        >
          QUAY LẠI
        </Button>
      ) : (
        <div style={{ minWidth: '130px' }}></div>
      )}

      {showNext && (
        <Button
          onClick={handleNext}
          disabled={disableNext}
          className="fw-bold px-5 py-3 rounded-pill flex-grow-1 border-0"
          style={{
            backgroundColor: disableNext ? '#333' : '#ccff00',
            color: disableNext ? '#777' : '#000',
            boxShadow: disableNext ? 'none' : '0 0 20px rgba(204,255,0,0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          TIẾP TỤC
        </Button>
      )}
    </div>
  );

  return (
    <Container fluid className="p-0 bg-black min-vh-100 d-flex align-items-center">
      <style type="text/css">
        {`
          .bg-success { background-color: #ccff00 !important; }
          .form-range::-webkit-slider-thumb { background: #ccff00; }
          .form-range::-moz-range-thumb { background: #ccff00; }
          .animate-fade-in { animation: fadeIn 0.4s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}
      </style>

      <Row className="g-0 w-100 h-100 align-items-stretch" style={{ minHeight: '100vh' }}>
        {/* Left Side: Dynamic Image */}
        <Col lg={5} xl={6} className="d-none d-lg-block position-relative">
          <div
            className="w-100 h-100 position-absolute"
            style={{
              backgroundImage: `url(${getDynamicImage()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'background-image 0.5s ease-in-out'
            }}
          >
            {/* Gradient Overlay for blending */}
            <div className="w-100 h-100" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.1), #000)' }}></div>
          </div>
        </Col>

        {/* Right Side: Form Wizard */}
        <Col xs={12} lg={7} xl={6} className="d-flex flex-column justify-content-center p-4 p-md-5 bg-surface-main">

          <div className="w-100 mx-auto" style={{ maxWidth: '600px' }}>

            {/* Header & Progress Bar */}
            <div className="mb-5">
              <div className="d-flex justify-content-between text-secondary mb-2 small fw-bold">
                <span className="text-uppercase" style={{ letterSpacing: '1px' }}>Bước {step} / {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}% HOÀN THÀNH</span>
              </div>
              <ProgressBar
                now={(step / totalSteps) * 100}
                style={{ height: '6px', backgroundColor: '#333' }}
                variant="success"
              />
            </div>

            {/* Step 1: Giới tính */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="display-6 fw-bold text-primary-dynamic mb-5">Giới tính của bạn là gì?</h2>
                <Row className="g-3">
                  <Col xs={12}><OptionCard field="gender" value="Nam" label="Nam" /></Col>
                  <Col xs={12}><OptionCard field="gender" value="Nữ" label="Nữ" /></Col>
                  <Col xs={12}><OptionCard field="gender" value="Khác" label="Khác" /></Col>
                </Row>
                <StepNavigation showNext={true} disableNext={!formData.gender} />
              </div>
            )}

            {/* Step 2: Mục tiêu */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="display-6 fw-bold text-primary-dynamic mb-5">Mục tiêu chính của bạn?</h2>
                <Row className="g-3">
                  <Col xs={6}><OptionCard field="goal" value="Giữ dáng" label="Giữ dáng" /></Col>
                  <Col xs={6}><OptionCard field="goal" value="Xây dựng cơ bắp" label="Tăng cơ" /></Col>
                  <Col xs={6}><OptionCard field="goal" value="Giảm cân" label="Giảm cân" /></Col>
                  <Col xs={6}><OptionCard field="goal" value="Tập kĩ năng" label="Kĩ năng" /></Col>
                </Row>
                <StepNavigation showNext={true} disableNext={!formData.goal} />
              </div>
            )}

            {/* Step 3: Tần suất */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="display-6 fw-bold text-primary-dynamic mb-5">Tần suất tập luyện hiện tại?</h2>
                <Row className="g-3">
                  <Col xs={6}><OptionCard field="frequency" value="Ít" label="Rất ít khi" /></Col>
                  <Col xs={6}><OptionCard field="frequency" value="Hiếm khi" label="1-2 lần/tháng" /></Col>
                  <Col xs={6}><OptionCard field="frequency" value="Thỉnh thoảng" label="1-2 lần/tuần" /></Col>
                  <Col xs={6}><OptionCard field="frequency" value="Thường xuyên" label="3+ lần/tuần" /></Col>
                </Row>
                <StepNavigation showNext={true} disableNext={!formData.frequency} />
              </div>
            )}

            {/* Step 4: Thể trạng */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="display-6 fw-bold text-primary-dynamic mb-5">Đánh giá thể trạng hiện tại?</h2>
                <Row className="g-3">
                  <Col xs={6}><OptionCard field="fitnessLevel" value="Mới bắt đầu" label="Mới bắt đầu" /></Col>
                  <Col xs={6}><OptionCard field="fitnessLevel" value="Đã có nền tảng" label="Có nền tảng" /></Col>
                  <Col xs={6}><OptionCard field="fitnessLevel" value="Nền tảng ổn" label="Khá ổn" /></Col>
                  <Col xs={6}><OptionCard field="fitnessLevel" value="Nền tảng tốt" label="Rất tốt" /></Col>
                </Row>
                <StepNavigation showNext={true} disableNext={!formData.fitnessLevel} />
              </div>
            )}

            {/* Step 5: Số buổi tập */}
            {step === 5 && (
              <div className="animate-fade-in text-center">
                <h2 className="display-6 fw-bold text-primary-dynamic mb-5">Bạn có thể tập bao nhiêu buổi 1 tuần?</h2>
                <div className="display-1 text-neon fw-bold mb-5">{formData.sessionsPerWeek}</div>
                <Form.Range
                  name="sessionsPerWeek"
                  min={1}
                  max={7}
                  step={1}
                  value={formData.sessionsPerWeek}
                  onChange={handleSliderChange}
                  className="mb-5"
                />
                <StepNavigation showNext={true} disableNext={!formData.sessionsPerWeek} />
              </div>
            )}

            {/* Step 6: Chiều cao & Cân nặng */}
            {step === 6 && (
              <div className="animate-fade-in">
                <h2 className="display-6 fw-bold text-primary-dynamic mb-5">Chỉ số cơ thể của bạn</h2>

                <div className="mb-5 p-4 rounded-4 bg-surface-card border-surface">
                  <div className="d-flex justify-content-between align-items-end mb-4">
                    <span className="text-primary-dynamic fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Chiều cao</span>
                    <span className="text-neon display-4 fw-bold">{formData.height} <span className="fs-5 text-muted">cm</span></span>
                  </div>
                  <Form.Range
                    name="height"
                    min={100}
                    max={220}
                    value={formData.height}
                    onChange={handleSliderChange}
                  />
                </div>

                <div className="mb-5 p-4 rounded-4 bg-surface-card border-surface">
                  <div className="d-flex justify-content-between align-items-end mb-4">
                    <span className="text-primary-dynamic fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Cân nặng</span>
                    <span className="text-neon display-4 fw-bold">{formData.weight} <span className="fs-5 text-muted">kg</span></span>
                  </div>
                  <Form.Range
                    name="weight"
                    min={30}
                    max={150}
                    value={formData.weight}
                    onChange={handleSliderChange}
                  />
                </div>

                <div className="d-flex justify-content-between mt-5 gap-3">
                  <Button
                    variant="outline-secondary"
                    onClick={handleBack}
                    className="fw-bold px-4 py-3 rounded-pill"
                    style={{ borderWidth: '2px', color: '#fff', minWidth: '130px' }}
                  >
                    QUAY LẠI
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="w-100 py-3 fw-bold rounded-pill border-0 flex-grow-1"
                    style={{ backgroundColor: '#ccff00', color: '#000', boxShadow: '0 0 20px rgba(204,255,0,0.5)', fontSize: '1.1rem' }}
                  >
                    HOÀN THÀNH & TẠO LỘ TRÌNH
                  </Button>
                </div>
              </div>
            )}

          </div>
        </Col>
      </Row>
    </Container>
  );
}