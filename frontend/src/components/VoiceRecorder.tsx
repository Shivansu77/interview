import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscript, 
  isRecording, 
  setIsRecording 
}) => {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    // Check microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      alert('Microphone access is required. Please allow microphone access and try again.');
      return;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => {
            const newText = prev ? prev + ' ' + finalTranscript : finalTranscript;
            return newText;
          });
        }
      };
      
      recognitionRef.current.onend = () => {
        // Only restart if still recording and no final result received
        if (isRecording && !transcript.trim()) {
          setTimeout(() => {
            try {
              if (recognitionRef.current && isRecording) {
                recognitionRef.current.start();
              }
            } catch (error) {
              console.log('Recognition restart failed:', error);
            }
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific error types
        if (event.error === 'no-speech') {
          // Don't stop recording for no-speech, just continue listening
          console.log('No speech detected, continuing to listen...');
          if (isRecording) {
            setTimeout(() => {
              try {
                if (recognitionRef.current && isRecording) {
                  recognitionRef.current.start();
                }
              } catch (error) {
                console.log('Failed to restart after no-speech:', error);
                setIsRecording(false);
              }
            }, 100);
          }
        } else if (event.error === 'audio-capture' || event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
          setIsRecording(false);
        } else {
          // For other errors, stop recording
          setIsRecording(false);
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // Clean up transcript and submit
      const cleanTranscript = transcript.replace(/\.\.\.+/g, '').trim();
      if (cleanTranscript) {
        onTranscript(cleanTranscript);
      }
      setTranscript('');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="voice-recorder">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={toggleRecording}
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          style={{
            padding: '20px 40px',
            borderRadius: '50px',
            border: 'none',
            backgroundColor: isRecording ? '#f44336' : '#4CAF50',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isRecording ? '0 0 20px rgba(244, 67, 54, 0.5)' : '0 0 20px rgba(76, 175, 80, 0.3)',
            transform: isRecording ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {isRecording ? '🛑 Stop & Submit' : '🎤 Record Answer'}
        </button>
        
        {!isRecording && !transcript && (
          <div style={{ 
            marginTop: '15px', 
            fontSize: '14px', 
            color: '#ccc',
            maxWidth: '400px',
            margin: '15px auto 0'
          }}>
            💡 <strong>Tip:</strong> Click the microphone, then speak your answer clearly. Click "Stop & Submit" when done.
          </div>
        )}
      </div>
      
      {transcript && (
        <div>
          <div className="transcript-preview" style={{ 
            marginTop: '10px', 
            padding: '15px', 
            backgroundColor: '#2a2a2a', 
            borderRadius: '8px',
            color: '#ffffff',
            border: '2px solid #4CAF50',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            <strong style={{ color: '#4CAF50' }}>Your answer:</strong> <span style={{ color: '#ffffff' }}>{transcript}</span>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '16px'
          }}>
            <button
              onClick={() => onTranscript(transcript)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              🤖 Submit for AI Feedback
            </button>
            
            <button
              onClick={() => {
                setTranscript('');
                setIsRecording(false);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1a1a1a',
                color: '#ccc',
                border: '1px solid #555',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
                e.currentTarget.style.borderColor = '#666';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.borderColor = '#555';
              }}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      )}
      
      {isRecording && (
        <div className="recording-indicator" style={{ 
          marginTop: '15px', 
          textAlign: 'center',
          padding: '15px',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '8px',
          border: '2px solid #f44336',
          animation: 'pulse 1.5s infinite'
        }}>
          <div style={{ fontSize: '18px', color: '#f44336', fontWeight: 'bold' }}>
            🔴 RECORDING
          </div>
          <div style={{ fontSize: '14px', color: '#ccc', marginTop: '5px' }}>
            Speak clearly and take your time...
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;