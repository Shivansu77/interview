import React from 'react';

interface AnimatedBlobProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  color?: string;
  size?: number;
  delay?: number;
  opacity?: number;
  duration?: number;
  animationType?: 'morph' | 'float' | 'pulse' | 'breathe' | 'liquid' | 'rotate' | 'orbit' | 'wave' | 'elastic' | 'default';
  blur?: number;
  enableGlow?: boolean;
}

const AnimatedBlob: React.FC<AnimatedBlobProps> = ({ 
  position = 'top-left', 
  color = '#667eea', 
  size = 400,
  delay = 0,
  opacity = 0.3,
  duration = 20,
  animationType = 'default',
  blur = 60,
  enableGlow = false
}) => {
  const positions = {
    'top-left': { top: '-10%', left: '-10%' },
    'top-right': { top: '-10%', right: '-10%' },
    'bottom-left': { bottom: '-10%', left: '-10%' },
    'bottom-right': { bottom: '-10%', right: '-10%' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  const getAnimation = () => {
    const animations = {
      'morph': `morphBlob ${duration}s ease-in-out infinite ${delay}s`,
      'float': `floatBlob ${duration}s ease-in-out infinite ${delay}s, morphBlob ${duration * 1.5}s ease-in-out infinite ${delay}s`,
      'pulse': `pulseGlow ${duration}s ease-in-out infinite ${delay}s`,
      'breathe': `breathe ${duration * 0.3}s ease-in-out infinite ${delay}s, morphBlob ${duration}s ease-in-out infinite ${delay}s`,
      'liquid': `liquidWave ${duration * 0.5}s ease-in-out infinite ${delay}s, floatBlob ${duration}s ease-in-out infinite ${delay}s`,
      'rotate': `rotateBlob ${duration * 1.5}s linear infinite ${delay}s, morphBlob ${duration}s ease-in-out infinite ${delay}s`,
      'orbit': `orbitBlob ${duration}s ease-in-out infinite ${delay}s, morphBlob ${duration * 0.8}s ease-in-out infinite ${delay}s`,
      'wave': `waveBlob ${duration * 0.7}s ease-in-out infinite ${delay}s, floatBlob ${duration}s ease-in-out infinite ${delay}s`,
      'elastic': `elasticBlob ${duration * 0.4}s ease-in-out infinite ${delay}s, morphBlob ${duration}s ease-in-out infinite ${delay}s`,
      'default': `blobAnimation ${duration}s ease-in-out infinite ${delay}s, pulse ${duration * 0.5}s ease-in-out infinite ${delay}s`
    };
    return animations[animationType];
  };

  return (
    <>
      <style>
        {`
          @keyframes blobAnimation {
            0%, 100% {
              border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            25% {
              border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
              transform: translate(20px, -20px) scale(1.05) rotate(90deg);
            }
            50% {
              border-radius: 50% 50% 30% 60% / 30% 60% 70% 40%;
              transform: translate(-20px, 20px) scale(0.95) rotate(180deg);
            }
            75% {
              border-radius: 70% 30% 50% 50% / 60% 50% 40% 50%;
              transform: translate(20px, 20px) scale(1.1) rotate(270deg);
            }
          }

          @keyframes morphBlob {
            0%, 100% {
              border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
            20% {
              border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            }
            40% {
              border-radius: 50% 50% 30% 60% / 30% 60% 70% 40%;
            }
            60% {
              border-radius: 70% 30% 50% 50% / 60% 50% 40% 50%;
            }
            80% {
              border-radius: 40% 70% 60% 30% / 40% 70% 50% 60%;
            }
          }

          @keyframes floatBlob {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            25% {
              transform: translateY(-25px) translateX(15px);
            }
            50% {
              transform: translateY(-35px) translateX(-15px);
            }
            75% {
              transform: translateY(-20px) translateX(20px);
            }
          }

          @keyframes pulseGlow {
            0%, 100% {
              opacity: ${opacity};
              filter: blur(${blur}px) brightness(1);
              transform: scale(1);
            }
            50% {
              opacity: ${opacity * 1.5};
              filter: blur(${blur * 1.3}px) brightness(1.3);
              transform: scale(1.15);
            }
          }

          @keyframes breathe {
            0%, 100% {
              transform: scale(1);
              opacity: ${opacity};
            }
            50% {
              transform: scale(1.12);
              opacity: ${opacity * 1.4};
            }
          }

          @keyframes liquidWave {
            0%, 100% {
              border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
            10% {
              border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            }
            20% {
              border-radius: 50% 50% 30% 60% / 30% 60% 70% 40%;
            }
            30% {
              border-radius: 70% 30% 50% 50% / 60% 50% 40% 50%;
            }
            40% {
              border-radius: 40% 70% 60% 30% / 40% 70% 50% 60%;
            }
            50% {
              border-radius: 55% 45% 35% 65% / 65% 35% 65% 35%;
            }
            60% {
              border-radius: 35% 65% 55% 45% / 45% 55% 35% 65%;
            }
            70% {
              border-radius: 65% 35% 45% 55% / 55% 45% 65% 35%;
            }
            80% {
              border-radius: 45% 55% 65% 35% / 35% 65% 45% 55%;
            }
            90% {
              border-radius: 55% 45% 45% 55% / 55% 45% 55% 45%;
            }
          }

          @keyframes rotateBlob {
            0% {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(180deg) scale(1.1);
            }
            100% {
              transform: rotate(360deg) scale(1);
            }
          }

          @keyframes orbitBlob {
            0% {
              transform: rotate(0deg) translateX(50px) rotate(0deg);
            }
            100% {
              transform: rotate(360deg) translateX(50px) rotate(-360deg);
            }
          }

          @keyframes waveBlob {
            0%, 100% {
              transform: translateY(0px) scaleX(1) scaleY(1);
              border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
            25% {
              transform: translateY(-15px) scaleX(1.1) scaleY(0.9);
              border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%;
            }
            50% {
              transform: translateY(0px) scaleX(0.9) scaleY(1.1);
              border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%;
            }
            75% {
              transform: translateY(15px) scaleX(1.1) scaleY(0.9);
              border-radius: 60% 40% 60% 40% / 60% 40% 60% 40%;
            }
          }

          @keyframes elasticBlob {
            0%, 100% {
              transform: scale(1, 1);
              border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
            25% {
              transform: scale(1.15, 0.85);
              border-radius: 50% 50% 40% 60% / 40% 60% 50% 50%;
            }
            50% {
              transform: scale(0.85, 1.15);
              border-radius: 40% 60% 50% 50% / 50% 50% 60% 40%;
            }
            75% {
              transform: scale(1.08, 0.92);
              border-radius: 55% 45% 45% 55% / 45% 55% 45% 55%;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: ${opacity};
              filter: blur(${blur}px);
            }
            50% {
              opacity: ${opacity * 1.3};
              filter: blur(${blur * 1.2}px);
            }
          }
        `}
      </style>
      <div
        style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          background: enableGlow 
            ? `radial-gradient(circle, ${color}, ${color}80, transparent)`
            : `radial-gradient(circle, ${color}, transparent)`,
          filter: `blur(${blur}px)`,
          opacity: opacity,
          animation: getAnimation(),
          zIndex: 0,
          pointerEvents: 'none',
          willChange: 'transform, opacity, filter',
          boxShadow: enableGlow ? `0 0 ${size * 0.5}px ${color}40` : 'none',
          ...positions[position]
        }}
      />
    </>
  );
};

export default AnimatedBlob;
