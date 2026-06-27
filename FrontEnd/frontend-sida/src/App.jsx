import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

function Layout() {
  const location = useLocation();
  // Khai báo các đường dẫn không muốn hiển thị Navbar và Floating Pet
  const isPetPage = location.pathname === '/pet';

  return (
    <div className="min-vh-100 bg-body text-body position-relative pb-5 pb-lg-0">
      {/* Ẩn Navbar ở trang Pet */}
      {!isPetPage && <TopNav />}

      {/* Nội dung các trang sẽ render ở dưới kèm theo hiệu ứng chuyển trang */}
      <div key={location.pathname} className="page-transition flex-grow-1 d-flex flex-column">
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
            <Route path="/calories" element={<CalorieTracker />} />
            <Route path="/roadmap" element={<Roadmap />} />
          </Routes>
        </Suspense>
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