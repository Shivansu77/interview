import React, { useState, useRef, useEffect } from 'react';

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
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) { // 2 minutes = 120 seconds
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

      // Auto-stop after 2 minutes
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 120000);

      // Start speech recognition
      startSpeechRecognition();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access is required. Please allow microphone access and try again.');
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalTranscript.trim()) {
        setTranscript(prev => {
          const newText = prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim();
          return newText;
        });
      }
    };
    
    recognitionRef.current.onend = () => {
      if (isRecording) {
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
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access and try again.');
        setIsRecording(false);
        return;
      }
    };

    recognitionRef.current.start();
  };



  const stopRecording = () => {
    setIsRecording(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const submitAnswer = () => {
    const cleanTranscript = transcript.replace(/\.\.\.+/g, '').trim();
    if (cleanTranscript) {
      onTranscript(cleanTranscript);
      setTranscript('');
      setRecordingTime(0);
    }
  };

  const retryRecording = () => {
    setTranscript('');
    setRecordingTime(0);
    setIsRecording(false);
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
          disabled={isProcessing}
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          style={{
            padding: '20px 40px',
            borderRadius: '50px',
            border: 'none',
            backgroundColor: isRecording ? '#f44336' : '#4CAF50',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isRecording ? '0 0 20px rgba(244, 67, 54, 0.5)' : '0 0 20px rgba(76, 175, 80, 0.3)',
            transform: isRecording ? 'scale(1.05)' : 'scale(1)',
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          {isProcessing ? '🔄 Processing...' : 
           isRecording ? `🔴 Stop (${formatTime(recordingTime)})` : 
           '🎤 Record Answer'}
        </button>
        
        {!isRecording && !transcript && !isProcessing && (
          <div style={{ 
            marginTop: '15px', 
            fontSize: '14px', 
            color: '#ccc',
            maxWidth: '400px',
            margin: '15px auto 0'
          }}>
            💡 <strong>Tip:</strong> Click the microphone, then speak your answer clearly. Recording will auto-stop after 2 minutes.
          </div>
        )}
      </div>
      
      {isRecording && (
        <div className="recording-indicator" style={{ 
          marginTop: '15px', 
          textAlign: 'center',
          padding: '20px',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '12px',
          border: '2px solid #f44336',
          animation: 'pulse 1.5s infinite'
        }}>
          <div style={{ fontSize: '24px', color: '#f44336', fontWeight: 'bold', marginBottom: '10px' }}>
            🔴 RECORDING - {formatTime(recordingTime)} / 2:00
          </div>
          <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '15px' }}>
            Speak clearly and take your time... Auto-stops at 2 minutes
          </div>
          {transcript && (
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#fff',
              textAlign: 'left',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              <strong>Live transcript:</strong> {transcript}
            </div>
          )}
        </div>
      )}
      
      {transcript && !isRecording && (
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
            <strong style={{ color: '#4CAF50' }}>Your answer ({formatTime(recordingTime)}):</strong> 
            <span style={{ color: '#ffffff' }}>{transcript}</span>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '16px'
          }}>
            <button
              onClick={submitAnswer}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                opacity: isProcessing ? 0.7 : 1
              }}
              onMouseOver={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = '#4CAF50')}
            >
              🤖 Submit for AI Feedback
            </button>
            
            <button
              onClick={retryRecording}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1a1a1a',
                color: '#ccc',
                border: '1px solid #555',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isProcessing ? 0.7 : 1
              }}
              onMouseOver={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = '#333')}
              onMouseOut={(e) => !isProcessing && (e.currentTarget.style.backgroundColor = '#1a1a1a')}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;