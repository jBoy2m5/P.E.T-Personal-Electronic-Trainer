import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import ExerciseList from './pages/ExerciseList';
import Schedule from './pages/Schedule';
import Daily from './pages/Daily';
import PetProfile from './pages/PetProfile';
import CalorieTracker from './pages/CalorieTracker';
import FloatingPet from './components/FloatingPet';

function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-body text-body position-relative">
        {/* Navbar nằm ở trên cùng */}
        <TopNav />

        {/* Nội dung các trang sẽ render ở dưới */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          {/* Thêm các Route khác sau này (Ví dụ: /workout, /onboarding...) */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/exercises/:id" element={<ExerciseList />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/pet" element={<PetProfile />} />
          <Route path="/calories" element={<CalorieTracker />} />
        </Routes>

        {/* Pet hiển thị toàn cục */}
        <FloatingPet />
      </div>
    </Router>
  );
}

export default App;