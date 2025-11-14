import React, { useRef, useEffect, useState } from 'react';

interface HeyGenAvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  text?: string;
}

const HeyGenAvatar: React.FC<HeyGenAvatarProps> = ({
  isListening = false,
  isSpeaking = false,
  text = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (text && isSpeaking) {
      generateHeyGenVideo(text);
    }
  }, [text, isSpeaking]);

  const generateHeyGenVideo = async (inputText: string) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-API-KEY': 'YOUR_HEYGEN_API_KEY',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_inputs: [{
            character: {
              type: 'avatar',
              avatar_id: 'Kristin_public_3_20240108',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: inputText,
              voice_id: 'en-US-JennyNeural'
            }
          }],
          dimension: {
            width: 1280,
            height: 720
          },
          aspect_ratio: '16:9'
        })
      });

      const data = await response.json();
      
      if (data.data?.video_id) {
        pollVideoStatus(data.data.video_id);
      }
    } catch (error) {
      console.error('HeyGen API error:', error);
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
          headers: {
            'X-API-KEY': 'YOUR_HEYGEN_API_KEY'
          }
        });

        const data = await response.json();

        if (data.data?.status === 'completed' && data.data?.video_url) {
          setVideoUrl(data.data.video_url);
          setIsGenerating(false);
          
          if (videoRef.current) {
            videoRef.current.src = data.data.video_url;
            videoRef.current.play();
          }
        } else if (data.data?.status === 'failed') {
          setIsGenerating(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 3000);
        } else {
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setIsGenerating(false);
      }
    };

    poll();
  };

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
      <div style={{
        width: '200px',
        height: '250px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isGenerating ? (
          <div style={{
            color: '#fff',
            textAlign: 'center'
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
            <div>Generating...</div>
          </div>
        ) : videoUrl ? (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            controls={false}
            autoPlay
            muted={false}
          />
        ) : (
          <img
            src="https://resource.heygen.ai/avatars/Kristin_public_3_20240108/full_body.jpg"
            alt="AI Interviewer"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}

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
      </div>
      
      <div style={{
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <span style={{ color: '#fff', fontSize: '11px' }}>
          HeyGen Avatar
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

export default HeyGenAvatar;