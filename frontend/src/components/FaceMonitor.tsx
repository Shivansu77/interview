import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

interface FaceMonitorProps {
  onEyeContactUpdate: (score: number) => void;
}

const FaceMonitor: React.FC<FaceMonitorProps> = ({ onEyeContactUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(0);

  useEffect(() => {
    startCamera();
    loadModel();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const loadModel = async () => {
    try {
      await tf.ready();
      setIsModelLoaded(true);
      startFaceDetection();
    } catch (error) {
      console.error('Error loading TensorFlow model:', error);
    }
  };

  const startFaceDetection = () => {
    const detectFace = () => {
      if (videoRef.current && canvasRef.current && isModelLoaded) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Simple eye contact simulation (replace with actual face detection)
          const mockEyeContact = Math.random() > 0.3 ? 85 + Math.random() * 15 : 40 + Math.random() * 30;
          setEyeContactScore(Math.round(mockEyeContact));
          onEyeContactUpdate(Math.round(mockEyeContact));
        }
      }
      requestAnimationFrame(detectFace);
    };
    detectFace();
  };

  return (
    <div className="face-monitor">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        width="320" 
        height="240"
        style={{ transform: 'scaleX(-1)' }}
      />
      <canvas 
        ref={canvasRef} 
        width="320" 
        height="240" 
        style={{ display: 'none' }}
      />
      <div className="eye-contact-indicator">
        Eye Contact: {eyeContactScore}%
        <div 
          className="score-bar"
          style={{
            width: '100px',
            height: '10px',
            backgroundColor: '#ddd',
            borderRadius: '5px',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              width: `${eyeContactScore}%`,
              height: '100%',
              backgroundColor: eyeContactScore > 70 ? '#4CAF50' : eyeContactScore > 40 ? '#FF9800' : '#F44336',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FaceMonitor;