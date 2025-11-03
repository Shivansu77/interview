import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import FaceMonitor from './FaceMonitor';
import VoiceRecorder from './VoiceRecorder';
import AnalysisDisplay from './AnalysisDisplay';

interface InterviewRoomProps {
  sessionId: string;
  userId: string;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ sessionId, userId }) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(0);
  const [eyeContactFeedback, setEyeContactFeedback] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5001');
    socketRef.current.emit('join-interview', sessionId);
    
    generateQuestion();
    
    return () => socketRef.current.disconnect();
  }, [sessionId]);

  const generateQuestion = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'technical', difficulty: 'medium' })
      });
      const data = await response.json();
      setCurrentQuestion(data.question);
      setQuestionCount(prev => prev + 1);
      
      // Text-to-speech for AI voice
      speakQuestion(data.question);
    } catch (error) {
      console.error('Error generating question:', error);
    }
  };

  const speakQuestion = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const handleAnswerSubmit = async (transcript: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/ai/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: currentQuestion, 
          answer: transcript 
        })
      });
      const analysisData = await response.json();
      setAnalysis(analysisData);
      
      // Don't auto-generate next question - wait for user action
    } catch (error) {
      console.error('Error analyzing answer:', error);
    }
  };

  return (
    <div className="interview-room">
      <div className="video-section">
        <FaceMonitor onEyeContactUpdate={setEyeContactScore} />
      </div>
      
      <div className="question-section">
        <h2>Question {questionCount}</h2>
        <p>{currentQuestion}</p>
      </div>
      
      <div className="controls">
        <VoiceRecorder 
          onTranscript={handleAnswerSubmit}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />
      </div>
      
      <AnalysisDisplay analysis={analysis} />
      
      {analysis && (
        <button 
          onClick={() => {
            setAnalysis(null);
            generateQuestion();
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '20px 0'
          }}
        >
          Next Question →
        </button>
      )}
      
      <div className="stats">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div>Eye Contact Score: {eyeContactScore}%</div>
          <div style={{ fontSize: '12px', color: eyeContactScore > 70 ? '#4CAF50' : eyeContactScore > 40 ? '#FF9800' : '#f44336', marginTop: '5px' }}>
            {eyeContactScore > 70 ? '✓ Good eye contact' : eyeContactScore > 40 ? '⚠ Look at camera more' : '✗ Poor eye contact - focus on camera'}
          </div>
        </div>
        <div>Questions Answered: {questionCount}</div>
      </div>
    </div>
  );
};

export default InterviewRoom;