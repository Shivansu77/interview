import React, { useState } from 'react';
import ProfessionalAIBlob from './ProfessionalAIBlob';

interface AIAssistantProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  size?: number;
  isListening?: boolean;
  isThinking?: boolean;
  onClick?: () => void;
  className?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  position = 'top-right',
  size = 120,
  isListening = false,
  isThinking = false,
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1000,
      cursor: onClick ? 'pointer' : 'default'
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'center':
        return { 
          ...baseStyles, 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)' 
        };
      default:
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  const getAIState = () => {
    if (isListening) return 'listening';
    if (isThinking) return 'thinking';
    return 'idle';
  };

  const getColors = () => {
    const state = getAIState();
    switch (state) {
      case 'listening':
        return { primary: '#43e97b', secondary: '#4facfe' };
      case 'thinking':
        return { primary: '#f093fb', secondary: '#667eea' };
      default:
        return { primary: '#667eea', secondary: '#43e97b' };
    }
  };

  const colors = getColors();
  const isActive = isListening || isThinking || isHovered;

  return (
    <div
      style={getPositionStyles()}
      className={`ai-assistant ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <ProfessionalAIBlob
        size={size}
        primaryColor={colors.primary}
        secondaryColor={colors.secondary}
        isActive={isActive}
        intensity={isListening ? 'high' : isThinking ? 'medium' : 'low'}
      />
      
      {/* Status indicator */}
      {(isListening || isThinking) && (
        <div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(10px)'
          }}
        >
          {isListening ? '🎤 Listening...' : '🤔 Thinking...'}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;