import React from 'react';

interface ProfessionalAIBlobProps {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const ProfessionalAIBlob: React.FC<ProfessionalAIBlobProps> = ({ 
  size = 150, 
  primaryColor = '#667eea', 
  secondaryColor = '#43e97b',
  isActive = false,
  intensity = 'medium',
  className = '' 
}) => {
  const waveCount = intensity === 'low' ? 2 : intensity === 'medium' ? 3 : 4;
  const animationSpeed = intensity === 'low' ? 3 : intensity === 'medium' ? 2.5 : 2;

  return (
    <div 
      className={`professional-ai-blob ${isActive ? 'active' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Main AI Core */}
      <div
        className="ai-core"
        style={{
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(circle at 25% 25%, ${primaryColor}ff, ${primaryColor}cc 40%, ${secondaryColor}99 70%, ${primaryColor}66),
            linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}aa)
          `,
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `
            0 0 ${size * 0.2}px ${primaryColor}40,
            inset 0 0 ${size * 0.1}px ${secondaryColor}30
          `,
          border: `1px solid ${primaryColor}20`
        }}
      >
        {/* Highlight effect */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '15%',
            width: '35%',
            height: '35%',
            background: `radial-gradient(ellipse at center, ${primaryColor}80, transparent 70%)`,
            borderRadius: '50%',
            transform: 'rotate(-20deg)',
            animation: isActive ? 'highlight 4s ease-in-out infinite' : 'none'
          }}
        />

        {/* Inner particles */}
        {[1, 2, 3].map((particle) => (
          <div
            key={particle}
            style={{
              position: 'absolute',
              width: `${8 + particle * 2}px`,
              height: `${8 + particle * 2}px`,
              background: `${secondaryColor}60`,
              borderRadius: '50%',
              top: `${20 + particle * 15}%`,
              left: `${30 + particle * 10}%`,
              animation: isActive ? `float ${3 + particle * 0.5}s ease-in-out infinite ${particle * 0.5}s` : 'none'
            }}
          />
        ))}
      </div>

      {/* Outer wave rings */}
      {Array.from({ length: waveCount }, (_, index) => (
        <div
          key={index}
          className={`wave-ring wave-${index + 1}`}
          style={{
            position: 'absolute',
            border: `${2 - index * 0.3}px solid ${primaryColor}${Math.max(20 - index * 5, 10).toString(16).padStart(2, '0')}`,
            borderRadius: '50%',
            width: `${120 + index * 25}%`,
            height: `${120 + index * 25}%`,
            animation: isActive ? `ripple ${animationSpeed + index * 0.4}s ease-out infinite ${index * 0.2}s` : 'none',
            opacity: 0
          }}
        />
      ))}

      {/* Pulse waves */}
      {isActive && Array.from({ length: 2 }, (_, index) => (
        <div
          key={`pulse-${index}`}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: `1px solid ${secondaryColor}40`,
            borderRadius: '50%',
            animation: `pulseWave ${animationSpeed * 1.5}s ease-out infinite ${index * (animationSpeed * 0.75)}s`,
            opacity: 0
          }}
        />
      ))}

      <style>{`
        @keyframes highlight {
          0%, 100% {
            opacity: 0.6;
            transform: rotate(-20deg) scale(1);
          }
          50% {
            opacity: 1;
            transform: rotate(-15deg) scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-8px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes pulseWave {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        .professional-ai-blob {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .professional-ai-blob:hover .ai-core {
          transform: scale(1.05);
          filter: brightness(1.15) saturate(1.1);
        }

        .professional-ai-blob.active .ai-core {
          animation: coreGlow 2.5s ease-in-out infinite;
        }

        @keyframes coreGlow {
          0%, 100% {
            filter: brightness(1) saturate(1);
          }
          50% {
            filter: brightness(1.2) saturate(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalAIBlob;