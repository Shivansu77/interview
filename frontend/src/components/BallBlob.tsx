import React from 'react';

interface BallBlobProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  color?: string;
  size?: number;
  delay?: number;
  opacity?: number;
  duration?: number;
  enableGlow?: boolean;
}

/**
 * BallBlob Component
 * Creates a 3D spherical blob effect using multiple layered gradients
 */
const BallBlob: React.FC<BallBlobProps> = ({ 
  position = 'center', 
  color = '#667eea', 
  size = 400,
  delay = 0,
  opacity = 0.4,
  duration = 20,
  enableGlow = true
}) => {
  const positions = {
    'top-left': { top: '10%', left: '10%' },
    'top-right': { top: '10%', right: '10%' },
    'bottom-left': { bottom: '10%', left: '10%' },
    'bottom-right': { bottom: '10%', right: '10%' },
    'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  };

  return (
    <>
      <style>
        {`
          @keyframes ballFloat {
            0%, 100% {
              transform: translateY(0px) translateX(0px) scale(1);
            }
            25% {
              transform: translateY(-20px) translateX(10px) scale(1.05);
            }
            50% {
              transform: translateY(-30px) translateX(-10px) scale(0.95);
            }
            75% {
              transform: translateY(-15px) translateX(15px) scale(1.02);
            }
          }

          @keyframes ballRotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes ballPulse {
            0%, 100% {
              opacity: ${opacity};
              transform: scale(1);
            }
            50% {
              opacity: ${opacity * 1.3};
              transform: scale(1.08);
            }
          }

          @keyframes ballShine {
            0%, 100% {
              opacity: 0.8;
              transform: translate(-30%, -30%) scale(1);
            }
            50% {
              opacity: 1;
              transform: translate(-20%, -20%) scale(1.1);
            }
          }

          @keyframes ballShadow {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1) translateY(0px);
            }
            50% {
              opacity: 0.15;
              transform: scale(0.9) translateY(5px);
            }
          }
        `}
      </style>
      
      {/* Main Ball Container */}
      <div
        style={{
          position: 'absolute',
          width: `${size}px`,
          height: `${size}px`,
          zIndex: 0,
          pointerEvents: 'none',
          animation: `ballFloat ${duration}s ease-in-out infinite ${delay}s`,
          ...positions[position]
        }}
      >
        {/* Base Sphere - Main gradient */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${color}ff, ${color}cc 30%, ${color}80 60%, transparent 100%)`,
            opacity: opacity,
            animation: `ballPulse ${duration * 0.5}s ease-in-out infinite ${delay}s`,
            boxShadow: enableGlow ? `
              0 0 ${size * 0.3}px ${color}40,
              0 0 ${size * 0.5}px ${color}20,
              inset 0 0 ${size * 0.2}px ${color}30
            ` : 'none'
          }}
        />

        {/* Highlight - Creates 3D effect */}
        <div
          style={{
            position: 'absolute',
            width: '40%',
            height: '40%',
            top: '15%',
            left: '15%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2) 50%, transparent 70%)`,
            animation: `ballShine ${duration * 0.7}s ease-in-out infinite ${delay}s`,
            filter: 'blur(10px)'
          }}
        />

        {/* Secondary highlight */}
        <div
          style={{
            position: 'absolute',
            width: '25%',
            height: '25%',
            top: '20%',
            left: '20%',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent 60%)`,
            filter: 'blur(8px)',
            opacity: 0.6
          }}
        />

        {/* Depth layer - Adds volume */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `radial-gradient(circle at 70% 70%, transparent 30%, ${color}40 60%, ${color}80 100%)`,
            opacity: opacity * 0.8
          }}
        />

        {/* Core glow - Inner light */}
        {enableGlow && (
          <div
            style={{
              position: 'absolute',
              width: '70%',
              height: '70%',
              top: '15%',
              left: '15%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${color}60, transparent 70%)`,
              filter: 'blur(20px)',
              animation: `ballPulse ${duration * 0.3}s ease-in-out infinite ${delay + 0.5}s`
            }}
          />
        )}

        {/* Shadow effect */}
        <div
          style={{
            position: 'absolute',
            width: '90%',
            height: '20%',
            bottom: '-10%',
            left: '5%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${color}60, transparent 70%)`,
            filter: 'blur(15px)',
            animation: `ballShadow ${duration * 0.5}s ease-in-out infinite ${delay}s`
          }}
        />

        {/* Rotating outer ring for extra depth */}
        <div
          style={{
            position: 'absolute',
            width: '110%',
            height: '110%',
            top: '-5%',
            left: '-5%',
            borderRadius: '50%',
            border: `2px solid ${color}30`,
            animation: `ballRotate ${duration * 2}s linear infinite ${delay}s`,
            opacity: 0.3
          }}
        />

        {/* Inner rotating ring */}
        <div
          style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            top: '10%',
            left: '10%',
            borderRadius: '50%',
            border: `1px solid ${color}20`,
            animation: `ballRotate ${duration * 1.5}s linear infinite reverse ${delay}s`,
            opacity: 0.2
          }}
        />
      </div>
    </>
  );
};

export default BallBlob;
