import React, { useRef, useEffect, useState } from 'react';

interface DIDAvatar {
  isListening?: boolean;
  isSpeaking?: boolean;
  text?: string;
}

const DIDAvatar: React.FC<DIDAvatar> = ({
  isListening = false,
  isSpeaking = false,
  text = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Generate talking video when text changes
  useEffect(() => {
    if (text && isSpeaking) {
      generateTalkingVideo(text);
    }
  }, [text, isSpeaking]);

  const generateTalkingVideo = async (inputText: string) => {
    setIsGenerating(true);
    
    try {
      // D-ID API call (requires API key)
      const response = await fetch('https://api.d-id.com/talks', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_DID_API_KEY',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',
          script: {
            type: 'text',
            input: inputText,
            provider: {
              type: 'microsoft',
              voice_id: 'en-US-JennyNeural'
            }
          },
          config: {
            fluent: true,
            pad_audio: 0
          }
        })
      });

      const data = await response.json();
      
      if (data.id) {
        // Poll for completion
        pollVideoStatus(data.id);
      }
    } catch (error) {
      console.error('D-ID API error:', error);
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (talkId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          headers: {
            'Authorization': 'Bearer YOUR_DID_API_KEY'
          }
        });

        const data = await response.json();

        if (data.status === 'done' && data.result_url) {
          setVideoUrl(data.result_url);
          setIsGenerating(false);
          
          // Play the video
          if (videoRef.current) {
            videoRef.current.src = data.result_url;
            videoRef.current.play();
          }
        } else if (data.status === 'error') {
          setIsGenerating(false);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
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
            src="https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg"
            alt="AI Interviewer"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}

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
      </div>
      
      <div style={{
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <span style={{ color: '#fff', fontSize: '11px' }}>
          AI Interviewer
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

export default DIDAvatar;