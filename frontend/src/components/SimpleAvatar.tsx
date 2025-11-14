import React, { useRef, useEffect, useState } from 'react';

interface SimpleAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  text?: string;
}

const SimpleAvatar: React.FC<SimpleAvatarProps> = ({
  isListening = false,
  isSpeaking = false,
  text = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [eyeOpenness, setEyeOpenness] = useState(1);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);

  // Blinking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEyeOpenness(0.1);
      setTimeout(() => setEyeOpenness(1), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Nodding when listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setHeadTilt(-5);
        setTimeout(() => setHeadTilt(0), 500);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  // Mouth movement when speaking
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setMouthOpenness(Math.random() * 0.8);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setMouthOpenness(0);
    }
  }, [isSpeaking]);

  // Draw avatar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 250;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((headTilt * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Face
    ctx.fillStyle = '#f4c2a1';
    ctx.beginPath();
    ctx.arc(100, 125, 60, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeHeight = 12 * eyeOpenness;
    ctx.fillStyle = '#fff';
    ctx.fillRect(80, 110 - eyeHeight/2, 20, eyeHeight);
    ctx.fillRect(100, 110 - eyeHeight/2, 20, eyeHeight);
    ctx.fillStyle = '#333';
    ctx.fillRect(85, 110 - eyeHeight/2, 10, eyeHeight);
    ctx.fillRect(105, 110 - eyeHeight/2, 10, eyeHeight);

    // Eyebrows
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(75, 100);
    ctx.lineTo(95, 98);
    ctx.moveTo(105, 98);
    ctx.lineTo(125, 100);
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#e6a882';
    ctx.beginPath();
    ctx.arc(100, 130, 5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    const mouthHeight = 3 + mouthOpenness * 15;
    ctx.fillStyle = '#8b0000';
    ctx.beginPath();
    ctx.ellipse(100, 150, 15, mouthHeight/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Status indicators
    if (isListening) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(100, 125, 70, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (isSpeaking) {
      ctx.fillStyle = '#ff6b6b';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(160 + i * 10, 80 + Math.sin(Date.now() * 0.02 + i) * 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '15px',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      borderRadius: '12px',
      border: '1px solid #333'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)'
        }}
      />
      
      <div style={{
        marginTop: '10px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isListening ? '#00ff00' : '#666'
        }} />
        <span style={{ color: '#fff', fontSize: '11px' }}>
          {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Ready'}
        </span>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isSpeaking ? '#ff6b6b' : '#666'
        }} />
      </div>
    </div>
  );
};

export default SimpleAvatar;