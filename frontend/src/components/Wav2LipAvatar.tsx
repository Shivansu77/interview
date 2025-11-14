import React, { useRef, useEffect, useState } from 'react';

interface Wav2LipAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  audioUrl?: string;
  text?: string;
}

const Wav2LipAvatar: React.FC<Wav2LipAvatarProps> = ({
  isListening = false,
  isSpeaking = false,
  audioUrl = '',
  text = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState('');

  // Generate lip-synced video when audio changes
  useEffect(() => {
    if (audioUrl && text) {
      generateLipSync(audioUrl);
    }
  }, [audioUrl, text]);

  const generateLipSync = async (audio: string) => {
    setIsProcessing(true);
    
    try {
      // Create FormData for Wav2Lip API
      const formData = new FormData();
      
      // Use default avatar image
      const avatarImage = await fetch('/avatar-face.jpg');
      const imageBlob = await avatarImage.blob();
      formData.append('face', imageBlob, 'face.jpg');
      
      // Add audio file
      const audioBlob = await fetch(audio);
      const audioFile = await audioBlob.blob();
      formData.append('audio', audioFile, 'audio.wav');
      
      // Call Wav2Lip backend service
      const response = await fetch('http://localhost:5003/api/wav2lip/generate', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        setAvatarVideoUrl(videoUrl);
        
        // Play the generated video
        if (videoRef.current) {
          videoRef.current.src = videoUrl;
          videoRef.current.play();
        }
      }
    } catch (error) {
      console.error('Wav2Lip generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // MediaPipe face detection for nodding
  useEffect(() => {
    if (isListening) {
      startNodding();
    }
  }, [isListening]);

  const startNodding = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Simple nodding animation overlay
    let angle = 0;
    const animate = () => {
      if (!isListening) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw nodding indicator
      ctx.save();
      ctx.translate(canvas.width / 2, 50);
      ctx.rotate(Math.sin(angle) * 0.1);
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.fillRect(-20, -5, 40, 10);
      ctx.restore();
      
      angle += 0.1;
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '15px',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      borderRadius: '12px',
      border: '1px solid #333',
      position: 'relative'
    }}>
      <div style={{
        width: '200px',
        height: '250px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#000',
        position: 'relative'
      }}>
        {isProcessing ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#fff',
            flexDirection: 'column'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #333',
              borderTop: '3px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '10px'
            }} />
            <div>Generating Avatar...</div>
          </div>
        ) : avatarVideoUrl ? (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            loop
            muted={false}
            playsInline
          />
        ) : (
          <img
            src="/avatar-face.jpg"
            alt="AI Interviewer"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
        
        {/* Nodding overlay canvas */}
        <canvas
          ref={canvasRef}
          width={200}
          height={250}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        />
        
        {/* Status indicators */}
        {isListening && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 255, 0, 0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            LISTENING
          </div>
        )}
        
        {isSpeaking && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 107, 107, 0.8)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            SPEAKING
          </div>
        )}
      </div>
      
      <div style={{
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <span style={{ color: '#fff', fontSize: '11px' }}>
          Wav2Lip Avatar
        </span>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Wav2LipAvatar;