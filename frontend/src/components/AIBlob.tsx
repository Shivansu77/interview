import React from 'react';

interface AIBlobProps {
  size?: number;
  color?: string;
  isActive?: boolean;
  className?: string;
}

const AIBlob: React.FC<AIBlobProps> = ({ 
  size = 120, 
  color = '#4facfe', 
  isActive = false,
  className = '' 
}) => {
  return (
    <div 
      className={`ai-blob ${isActive ? 'active' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Main AI Blob */}
      <div
        className="blob-core"
        style={{
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}80)`,
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 0 ${size * 0.3}px ${color}40`,
          animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none'
        }}
      >
        {/* Inner glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '30%',
            height: '30%',
            background: `radial-gradient(circle, ${color}60, transparent)`,
            borderRadius: '50%',
            animation: isActive ? 'innerGlow 3s ease-in-out infinite' : 'none'
          }}
        />
      </div>

      {/* Wave rings */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          className={`wave-ring ring-${ring}`}
          style={{
            position: 'absolute',
            border: `2px solid ${color}30`,
            borderRadius: '50%',
            width: `${100 + ring * 20}%`,
            height: `${100 + ring * 20}%`,
            animation: isActive ? `waveRing ${2 + ring * 0.5}s ease-out infinite ${ring * 0.3}s` : 'none',
            opacity: isActive ? 1 : 0
          }}
        />
      ))}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.2);
          }
        }

        @keyframes innerGlow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes waveRing {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .ai-blob {
          transition: all 0.3s ease;
        }

        .ai-blob:hover .blob-core {
          transform: scale(1.1);
          filter: brightness(1.3);
        }

        .ai-blob.active .wave-ring {
          animation-play-state: running;
        }
      `}</style>
    </div>
  );
};

export default AIBlob;