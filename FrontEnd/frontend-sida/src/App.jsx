import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import ExerciseList from './pages/ExerciseList';
import Schedule from './pages/Schedule';
import Daily from './pages/Daily';
import PetProfile from './pages/PetProfile';
import CalorieTracker from './pages/CalorieTracker';
import Roadmap from './pages/Roadmap';
import DailyWorkout from './pages/DailyWorkout';
import FloatingPet from './components/FloatingPet';

function Layout() {
  const location = useLocation();
  // Khai báo các đường dẫn không muốn hiển thị Navbar và Floating Pet
  const isPetPage = location.pathname === '/pet';

  return (
    <div className="min-vh-100 bg-body text-body position-relative">
      {/* Ẩn Navbar ở trang Pet */}
      {!isPetPage && <TopNav />}

      {/* Nội dung các trang sẽ render ở dưới kèm theo hiệu ứng chuyển trang */}
      <div key={location.pathname} className="page-transition flex-grow-1 d-flex flex-column">
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
      </div>

      {/* Ẩn cục Pet nhỏ lơ lửng nếu đang ở trong chính trang Pet */}
      {!isPetPage && <FloatingPet />}
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