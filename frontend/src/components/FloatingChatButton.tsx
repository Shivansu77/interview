import React, { useState } from 'react';
import ChatBot from './ChatBot';

interface FloatingChatButtonProps {
  userId: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ userId }) => {
  const [showChat, setShowChat] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<'interviewer' | 'mentor' | 'teacher' | 'friend'>('teacher');
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);

  const characters = [
    { id: 'teacher', name: 'Emma', emoji: '📚', color: '#FF9800', desc: 'English Teacher' },
    { id: 'mentor', name: 'Sarah', emoji: '🎯', color: '#4CAF50', desc: 'Career Mentor' },
    { id: 'interviewer', name: 'Alex', emoji: '👔', color: '#2196F3', desc: 'Interviewer' },
    { id: 'friend', name: 'Jamie', emoji: '😊', color: '#9C27B0', desc: 'Supportive Friend' }
  ];

  const handleCharacterSelect = (character: any) => {
    setSelectedCharacter(character.id);
    setShowCharacterMenu(false);
    setShowChat(true);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!showChat && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 999
        }}>
          {/* Character Selection Menu */}
          {showCharacterMenu && (
            <div style={{
              position: 'absolute',
              bottom: '80px',
              right: '0',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              borderRadius: '15px',
              padding: '15px',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
              border: '2px solid #333',
              minWidth: '250px',
              animation: 'menuSlideUp 0.3s ease-out'
            }}>
              <div style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Choose Your Assistant
              </div>
              
              {characters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => handleCharacterSelect(char)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    marginBottom: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${char.color}20, ${char.color}10)`;
                    e.currentTarget.style.borderColor = char.color;
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${char.color}, ${char.color}CC)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {char.emoji}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                      {char.name}
                    </div>
                    <div style={{ color: '#ccc', fontSize: '12px' }}>
                      {char.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Chat Button */}
          <button
            onClick={() => setShowCharacterMenu(!showCharacterMenu)}
            style={{
              width: '65px',
              height: '65px',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #FF9800, #F57C00)',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              animation: 'pulse 2s infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 152, 0, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 152, 0, 0.4)';
            }}
          >
            💬
            
            {/* Notification Dot */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#4CAF50',
              border: '2px solid white',
              animation: 'bounce 1s infinite'
            }} />
          </button>
        </div>
      )}

      {/* Chat Bot */}
      {showChat && (
        <ChatBot
          character={selectedCharacter}
          userId={userId}
          onClose={() => setShowChat(false)}
        />
      )}

      <style>{`
        @keyframes menuSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
          }
          50% {
            box-shadow: 0 8px 25px rgba(255, 152, 0, 0.6), 0 0 0 10px rgba(255, 152, 0, 0.1);
          }
          100% {
            box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-3px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingChatButton;