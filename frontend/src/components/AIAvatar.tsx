import React, { useRef, useEffect, useState } from 'react';

interface AIAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
}

const AIAvatar: React.FC<AIAvatarProps> = ({
  isListening = false,
  isSpeaking = false,
  audioLevel = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [eyeOpenness, setEyeOpenness] = useState(1);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const [eyebrowRaise, setEyebrowRaise] = useState(0);
  const [smile, setSmile] = useState(0);

  // Blinking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEyeOpenness(0.1);
      setTimeout(() => setEyeOpenness(1), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced expressions when listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setHeadTilt(-3);
        setEyebrowRaise(0.3);
        setTimeout(() => {
          setHeadTilt(0);
          setEyebrowRaise(0);
        }, 600);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  // Enhanced lip sync and expressions when speaking
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setMouthOpenness(Math.random() * 0.6 + 0.2);
        setSmile(Math.random() * 0.3);
      }, 150);
      return () => {
        clearInterval(interval);
        setMouthOpenness(0);
        setSmile(0);
      };
    } else {
      setMouthOpenness(0);
      setSmile(0);
    }
  }, [isSpeaking]);

  // Draw avatar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 280;
    canvas.height = 350;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((headTilt * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Anime-style face with clean features
    const faceGradient = ctx.createRadialGradient(140, 170, 30, 140, 170, 70);
    faceGradient.addColorStop(0, '#fde8d0');
    faceGradient.addColorStop(1, '#f4c2a1');
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.arc(140, 170, 70, 0, Math.PI * 2);
    ctx.fill();
    
    // Professional shirt/blazer
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.moveTo(70, 320);
    ctx.lineTo(70, 280);
    ctx.quadraticCurveTo(140, 250, 210, 280);
    ctx.lineTo(210, 320);
    ctx.lineTo(280, 350);
    ctx.lineTo(0, 350);
    ctx.closePath();
    ctx.fill();
    
    // Shirt collar
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(120, 270);
    ctx.lineTo(140, 250);
    ctx.lineTo(160, 270);
    ctx.lineTo(150, 280);
    ctx.lineTo(130, 280);
    ctx.closePath();
    ctx.fill();
    
    // Spiky hair - anime style
    ctx.fillStyle = '#2c1810';
    const spikes = [
      {x: 90, y: 120, width: 15, height: 35, angle: -0.4},
      {x: 110, y: 110, width: 18, height: 40, angle: -0.2},
      {x: 140, y: 105, width: 20, height: 45, angle: 0},
      {x: 170, y: 110, width: 18, height: 40, angle: 0.2},
      {x: 190, y: 120, width: 15, height: 35, angle: 0.4}
    ];
    
    spikes.forEach(spike => {
      ctx.beginPath();
      ctx.moveTo(spike.x - spike.width/2, spike.y + 15);
      ctx.lineTo(spike.x + Math.sin(spike.angle) * spike.height, spike.y - spike.height);
      ctx.lineTo(spike.x + spike.width/2, spike.y + 15);
      ctx.closePath();
      ctx.fill();
    });
    
    // Hair highlights
    ctx.fillStyle = '#3d2317';
    spikes.forEach(spike => {
      ctx.beginPath();
      ctx.moveTo(spike.x - 3, spike.y + 10);
      ctx.lineTo(spike.x + Math.sin(spike.angle) * (spike.height - 5), spike.y - spike.height + 5);
      ctx.lineTo(spike.x, spike.y + 10);
      ctx.closePath();
      ctx.fill();
    });

    // Anime-style expressive eyes
    const eyeY = 155 - eyebrowRaise * 8;
    const eyeHeight = 18 * eyeOpenness;
    
    // Eye whites (larger anime style)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(115, eyeY, 22, eyeHeight/1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(165, eyeY, 22, eyeHeight/1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Intelligent blue irises
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.ellipse(115, eyeY, 12, eyeHeight/2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(165, eyeY, 12, eyeHeight/2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#0d47a1';
    ctx.beginPath();
    ctx.ellipse(115, eyeY, 6, eyeHeight/2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(165, eyeY, 6, eyeHeight/2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Anime-style eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(118, eyeY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(168, eyeY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Small secondary shine
    ctx.beginPath();
    ctx.arc(112, eyeY + 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(162, eyeY + 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Sharp anime eyebrows
    const browY = 140 - eyebrowRaise * 10;
    ctx.fillStyle = '#2c1810';
    
    // Left eyebrow (angular)
    ctx.beginPath();
    ctx.moveTo(95, browY + 3);
    ctx.lineTo(105, browY - eyebrowRaise * 4);
    ctx.lineTo(130, browY + 1);
    ctx.lineTo(130, browY + 4);
    ctx.lineTo(105, browY + 2 - eyebrowRaise * 2);
    ctx.lineTo(95, browY + 6);
    ctx.closePath();
    ctx.fill();
    
    // Right eyebrow (angular)
    ctx.beginPath();
    ctx.moveTo(150, browY + 1);
    ctx.lineTo(175, browY - eyebrowRaise * 4);
    ctx.lineTo(185, browY + 3);
    ctx.lineTo(185, browY + 6);
    ctx.lineTo(175, browY + 2 - eyebrowRaise * 2);
    ctx.lineTo(150, browY + 4);
    ctx.closePath();
    ctx.fill();

    // Clean anime nose
    ctx.strokeStyle = '#e6a882';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(140, 175);
    ctx.lineTo(138, 185);
    ctx.stroke();
    
    // Nose tip
    ctx.fillStyle = '#f0c896';
    ctx.beginPath();
    ctx.arc(140, 185, 2, 0, Math.PI * 2);
    ctx.fill();

    // Friendly smile with French beard
    const mouthY = 200;
    const mouthWidth = 22 + smile * 18;
    const mouthHeight = 5 + mouthOpenness * 20;
    const mouthCurve = smile * 10;
    
    // Lips
    ctx.fillStyle = '#d4567a';
    ctx.beginPath();
    ctx.ellipse(140, mouthY - mouthCurve, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Teeth when mouth open
    if (mouthOpenness > 0.3) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(140, mouthY - mouthCurve - 2, mouthWidth * 0.8, mouthHeight * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Well-groomed French beard
    ctx.fillStyle = '#2c1810';
    ctx.beginPath();
    ctx.moveTo(125, 215);
    ctx.quadraticCurveTo(140, 230, 155, 215);
    ctx.lineTo(155, 225);
    ctx.quadraticCurveTo(140, 240, 125, 225);
    ctx.closePath();
    ctx.fill();
    
    // Beard highlight
    ctx.fillStyle = '#3d2317';
    ctx.beginPath();
    ctx.moveTo(130, 220);
    ctx.quadraticCurveTo(140, 228, 150, 220);
    ctx.lineTo(150, 225);
    ctx.quadraticCurveTo(140, 233, 130, 225);
    ctx.closePath();
    ctx.fill();

    // Professional status indicators
    if (isListening) {
      ctx.shadowColor = '#4caf50';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(140, 170, 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    if (isSpeaking) {
      ctx.shadowColor = '#2196f3';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#2196f3';
      for (let i = 0; i < 3; i++) {
        const radius = 3 + Math.sin(Date.now() * 0.01 + i) * 2;
        ctx.beginPath();
        ctx.arc(240 + i * 15, 120 + Math.sin(Date.now() * 0.015 + i) * 6, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
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

export default AIAvatar;