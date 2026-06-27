import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import petChatbot from '../assets/pet_chatbot.png';
import usePetStore from '../store/usePetStore';

export default function FloatingPet() {
  const navigate = useNavigate();
  const [hearts, setHearts] = useState([]);
  
  // Lấy dữ liệu trực tiếp từ Store (tự động re-render khi store thay đổi)
  const currentLevel = usePetStore(state => state.getCurrentLevel());

  const handleHover = () => {
    const newHeart = {
      id: Date.now(),
      x: Math.random() * 40 - 20,
      y: Math.random() * 20 - 10
    };
    
    setHearts(prev => [...prev, newHeart]);
    
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <div 
        className="floating-pet-container"
        onClick={() => navigate('/pet')}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.4))'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-10px)';
          handleHover();
        }}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
      >
        {hearts.map(heart => (
          <div 
            key={heart.id} 
            style={{
              position: 'absolute',
              left: `calc(50% + ${heart.x}px)`,
              top: `calc(50% + ${heart.y}px)`,
              fontSize: '1.5rem',
              pointerEvents: 'none',
              animation: 'floatUpHeart 1s ease-out forwards',
              zIndex: 10
            }}
          >
            ❤️
          </div>
        ))}
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
        @keyframes floatUpHeart {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
