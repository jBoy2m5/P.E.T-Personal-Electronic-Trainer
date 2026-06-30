import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error('Page error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-center gap-3">
          <p className="text-secondary">Có lỗi xảy ra khi tải trang.</p>
          <button className="btn btn-outline-success btn-sm" onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}>
            Quay về trang chủ
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import FloatingPet from './components/FloatingPet';

// Lazy load các trang
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const ExerciseList = lazy(() => import('./pages/ExerciseList'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Daily = lazy(() => import('./pages/Daily'));
const PetProfile = lazy(() => import('./pages/PetProfile'));
const CalorieTracker = lazy(() => import('./pages/CalorieTracker'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const DailyWorkout = lazy(() => import('./pages/DailyWorkout'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

function Layout() {
  const location = useLocation();
  const userDataString = localStorage.getItem('user-data');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const isAuthenticated = !!userData;
  
  // Check if user still needs onboarding
  const needsOnboarding = isAuthenticated && (!userData.height || !userData.weight);

  // Điều hướng nếu chưa đăng nhập
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
    // Note: Cho phép truy cập '/' nếu muốn trang chủ là public, hoặc chặn hết. 
    // Theo yêu cầu trước: chưa đăng nhập thì chỉ được vào trang chủ. 
    // Nhưng yêu cầu mới nhất: "Kiểm tra cờ needsOnboarding: Nếu true, ép chuyển hướng sang trang /onboarding và chặn không cho vào trang chủ. Nếu false, đẩy thẳng vào trang chủ."
    // Vậy trang chủ YÊU CẦU đăng nhập hay KHÔNG?
    // User nói: "Nếu false, đẩy thẳng vào trang chủ." ngụ ý trang chủ là trang sau khi login. 
    // Tôi sẽ bắt buộc đăng nhập để vào các trang tính năng.
    // Dựa theo code cũ: `location.pathname !== '/'` -> trang chủ là public.
    // Tôi sẽ giữ nguyên logic: trang chủ là public, các trang khác cần login.
  }

  if (!isAuthenticated && location.pathname !== '/' && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Ép buộc người dùng mới phải vào trang onboarding
  if (isAuthenticated && needsOnboarding && location.pathname !== '/onboarding' && location.pathname !== '/login') {
    return <Navigate to="/onboarding" replace />;
  }

  // Khai báo các đường dẫn không muốn hiển thị Navbar và Floating Pet
  const isPetPage = location.pathname === '/pet';

  return (
    <div className="min-vh-100 bg-body text-body position-relative pb-5 pb-lg-0">
      {/* Ẩn Navbar ở trang Pet */}
      {!isPetPage && <TopNav />}

      {/* Nội dung các trang sẽ render ở dưới kèm theo hiệu ứng chuyển trang */}
      <div key={location.pathname} className="page-transition flex-grow-1 d-flex flex-column">
        <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<div className="d-flex justify-content-center align-items-center flex-grow-1"><div className="spinner-border text-neon" role="status"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/exercises/:id" element={<ExerciseList />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/daily-workout/:dayId" element={<DailyWorkout />} />
            <Route path="/pet" element={<PetProfile />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/calories" element={<CalorieTracker />} />
            <Route path="/roadmap" element={<Roadmap />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>

      {/* Ẩn cục Pet nhỏ lơ lửng nếu đang ở trong chính trang Pet */}
      {!isPetPage && <FloatingPet />}

      {/* Thanh điều hướng dưới đáy màn hình cho Mobile */}
      {!isPetPage && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;