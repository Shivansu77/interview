import React, { useRef, useEffect, useState } from 'react';

interface SimpleFaceMonitorProps {
  onEyeContactUpdate: (score: number) => void;
}

const SimpleFaceMonitor: React.FC<SimpleFaceMonitorProps> = ({ onEyeContactUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(0);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setIsActive(true);
            startMockDetection();
          }).catch(console.error);
        };
      }
    } catch (error) {
      console.error('Camera access failed:', error);
    }
  };

  const startMockDetection = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const detectFrame = () => {
      if (video.videoWidth === 0 || video.paused || video.ended) {
        requestAnimationFrame(detectFrame);
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Always show 0% - user must manually indicate when they're looking
      setEyeContactScore(0);
      onEyeContactUpdate(0);

      // Draw center target
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
      ctx.fill();

      requestAnimationFrame(detectFrame);
    };

    detectFrame();
  };

  return (
    <div style={{ position: 'relative' }}>
      <video 
        ref={videoRef} 
        style={{ display: 'none' }}
        autoPlay 
        muted 
        playsInline
      />
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px',
          backgroundColor: '#000',
          border: isActive ? '3px solid #00ff00' : '3px solid #ff0000'
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {isActive ? '✅ Camera Active' : '⏳ Starting...'}
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: eyeContactScore > 70 ? 'rgba(0, 255, 0, 0.8)' : 
                         eyeContactScore > 40 ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        Eye Contact: {eyeContactScore}%
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px'
      }}>
        🎯 Look at green circle
      </div>
    </div>
  );
};

export default SimpleFaceMonitor;