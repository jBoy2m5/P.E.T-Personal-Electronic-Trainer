import React, { Suspense, lazy, Component, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import usePetStore from './store/usePetStore';
import useAuthStore from './store/useAuthStore';
import { purgeStaleUserData } from './utils/userStorage';

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
  const syncPet = usePetStore(state => state.syncFromBackend);
  // Auth server-only: hồ sơ user bootstrap từ GET /users/me (in-memory), không còn localStorage 'user-data'
  const { user, status, bootstrap } = useAuthStore();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (isAuthenticated) {
      // Dọn khóa localStorage legacy/của tài khoản khác (giữ jwt-token, theme và khóa
      // -{userId hiện tại} để migration một lần còn đọc được dữ liệu cũ)
      purgeStaleUserData(user?.userId);
      syncPet();
    }
  }, [isAuthenticated, user?.userId]);

  // Chặn render tới khi biết trạng thái đăng nhập — tránh chớp nội dung sai / redirect nhầm
  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-body">
        <div className="spinner-border text-neon" role="status"></div>
      </div>
    );
  }

  // needsOnboarding suy từ height/weight trên server (null = chưa onboarding)
  const needsOnboarding = isAuthenticated && user.needsOnboarding === true;

  // Trang chủ là public, các trang tính năng yêu cầu đăng nhập
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
      <div className="flex-grow-1 d-flex flex-column">
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

      {/* Ẩn cục Pet nhỏ lơ lửng nếu đang ở trong chính trang Pet hoặc chưa đăng nhập */}
      {!isPetPage && isAuthenticated && <FloatingPet />}

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