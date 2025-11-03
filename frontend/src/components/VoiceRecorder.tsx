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

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
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
      if (transcript) {
        onTranscript(transcript);
        setTranscript('');
      }
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
      <button 
        onClick={toggleRecording}
        className={`record-btn ${isRecording ? 'recording' : ''}`}
        style={{
          padding: '15px 30px',
          borderRadius: '50px',
          border: 'none',
          backgroundColor: isRecording ? '#f44336' : '#4CAF50',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
      </button>
      
      {transcript && (
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
      )}
      
      {isRecording && (
        <div className="recording-indicator" style={{ marginTop: '10px', color: '#f44336' }}>
          🔴 Recording... Speak your answer
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;