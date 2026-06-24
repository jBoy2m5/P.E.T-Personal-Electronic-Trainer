import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopNav from './components/TopNav';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-body text-body">
        {/* Navbar nằm ở trên cùng */}
        <TopNav />
        
        {/* Nội dung các trang sẽ render ở dưới */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Thêm các Route khác sau này (Ví dụ: /workout, /onboarding...) */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;