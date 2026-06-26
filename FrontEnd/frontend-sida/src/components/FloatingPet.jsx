import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import petChatbot from '../assets/pet_chatbot.png';

const PET_LEVELS = [
  { level: 1, name: 'Trứng', minPoints: 0, icon: '🥚' },
  { level: 2, name: 'Baby Pet', minPoints: 10, icon: '🐣' },
  { level: 3, name: 'Pet nhỏ', minPoints: 50, icon: '🐥' },
  { level: 4, name: 'Pet lớn', minPoints: 150, icon: '🐕' },
  { level: 5, name: 'Pet mạnh', minPoints: 300, icon: '🦁' },
  { level: 6, name: 'Pet chiến binh', minPoints: 600, icon: '🐉' },
  { level: 7, name: 'Pet huyền thoại', minPoints: 1200, icon: '🦄' },
  { level: 8, name: 'Pet thần thoại', minPoints: 2500, icon: '⭐' },
];

export default function FloatingPet() {
  const navigate = useNavigate();
  const [totalPoints, setTotalPoints] = useState(0);

  const loadPoints = () => {
    const saved = localStorage.getItem('pet-daily');
    if (saved) {
      const data = JSON.parse(saved);
      setTotalPoints(data.totalPoints || 0);
    }
  };

  useEffect(() => {
    loadPoints();
    window.addEventListener('storage', loadPoints);
    return () => window.removeEventListener('storage', loadPoints);
  }, []);

  const getCurrentLevel = () => {
    let current = PET_LEVELS[0];
    for (const lvl of PET_LEVELS) {
      if (totalPoints >= lvl.minPoints) current = lvl;
    }
    return current;
  };

  const currentLevel = getCurrentLevel();

  return (
    <>
      {/* Floating Button */}
      <div 
        onClick={() => navigate('/pet')}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.4))'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-10px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
      >
        {currentLevel.level === 1 ? (
          <span style={{ fontSize: '5rem', animation: 'petBounce 3s infinite ease-in-out' }}>{currentLevel.icon}</span>
        ) : (
          <img src={petChatbot} alt="Pet" style={{ width: '90px', height: '90px', objectFit: 'contain', animation: 'petBounce 3s infinite ease-in-out' }} />
        )}
        <Badge bg="dark" className="position-absolute" style={{
          top: '-10px', right: '-10px',
          fontSize: '0.75rem', padding: '5px 8px', borderRadius: '12px',
          border: '2px solid var(--brand-neon)', color: 'var(--brand-neon)'
        }}>
          Lv.{currentLevel.level}
        </Badge>
      </div>

      <style>{`
        @keyframes petBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
