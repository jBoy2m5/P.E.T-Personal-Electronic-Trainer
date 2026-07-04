import React, { useState, useRef, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import petChatbot from '../assets/pet_chatbot.png';
import usePetStore from '../store/usePetStore';

export default function FloatingPet() {
  const navigate = useNavigate();
  const [hearts, setHearts] = useState([]);
  const [pop, setPop] = useState(0);
  const firstReactionRef = useRef(true);

  // Lấy dữ liệu trực tiếp từ Store (tự động re-render khi store thay đổi)
  const currentLevel = usePetStore(state => state.getCurrentLevel());
  const petReactionTick = usePetStore(state => state.petReactionTick);

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

  // Pet là widget cố định (z-index cao, luôn nổi trên mọi modal kể cả camera AI fullscreen)
  // nên đây mới là pet người dùng thực sự nhìn thấy khi tập -> pop tức thì mỗi rep hợp lệ.
  useEffect(() => {
    if (firstReactionRef.current) { firstReactionRef.current = false; return; }
    setPop(p => p + 1);
    handleHover();
  }, [petReactionTick]);

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
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.12) translateY(-10px)';
          handleHover();
        }}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
      >
        {/* Neon glow ring behind pet */}
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--brand-neon-rgb),0.18) 0%, transparent 70%)',
          animation: 'breathe 3s ease-in-out infinite',
          filter: 'blur(8px)',
          pointerEvents: 'none'
        }}></div>

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
        <div key={pop} className="pet-pop-wrap">
          {currentLevel.level === 1 ? (
            <span style={{ fontSize: '7rem', animation: 'petBounce 3s infinite ease-in-out', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))' }}>{currentLevel.icon}</span>
          ) : (
            <img src={petChatbot} alt="Pet" style={{ width: '130px', height: '130px', objectFit: 'contain', animation: 'petBounce 3s infinite ease-in-out', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.4))' }} />
          )}
        </div>
        <Badge bg="dark" className="position-absolute" style={{
          top: '-10px', right: '-10px',
          fontSize: '0.7rem', padding: '5px 10px', borderRadius: '12px',
          border: '2px solid var(--brand-neon)', 
          color: 'var(--brand-neon)',
          boxShadow: '0 0 12px rgba(var(--brand-neon-rgb),0.3)',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          fontWeight: '800',
          letterSpacing: '0.5px'
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
        @keyframes floatingPetPop {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          55% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        .pet-pop-wrap { animation: floatingPetPop 0.5s ease-out; }
      `}</style>
    </>
  );
}
