import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import FaceMonitor from './FaceMonitor';
import VoiceRecorder from './VoiceRecorder';
import AnalysisDisplay from './AnalysisDisplay';

interface InterviewRoomProps {
  sessionId: string;
  userId: string;
  interviewType: string;
  company: string;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ sessionId, userId, interviewType, company }) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [eyeContactScore, setEyeContactScore] = useState(0);
  const [eyeContactFeedback, setEyeContactFeedback] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasGeneratedFirst, setHasGeneratedFirst] = useState(false);
  const socketRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5001');
    socketRef.current.emit('join-interview', sessionId);
    
    // Only generate first question once
    if (!hasGeneratedFirst) {
      setHasGeneratedFirst(true);
      generateQuestion();
    }
    
    return () => {
      // Cleanup on unmount
      speechSynthesis.cancel();
      stopTimer();
      socketRef.current.disconnect();
    };
  }, [sessionId]);

  const generateQuestion = async () => {
    try {
      // Stop any ongoing speech first
      speechSynthesis.cancel();
      
      const response = await fetch('http://localhost:5001/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: interviewType, 
          company: company,
          difficulty: 'medium' 
        })
      });
      const data = await response.json();
      setCurrentQuestion(data.question);
      
      // Only increment count for subsequent questions
      if (hasGeneratedFirst && questionCount > 1) {
        setQuestionCount(prev => prev + 1);
      }
      
      // Small delay before speaking to ensure clean state
      setTimeout(() => {
        speakQuestion(data.question);
      }, 500);
    } catch (error) {
      console.error('Error generating question:', error);
    }
  };

  const speakQuestion = (text: string) => {
    // Stop any ongoing speech first
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const handleAnswerSubmit = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      console.log('Submitting answer:', transcript);
      const response = await fetch('http://localhost:5001/api/ai/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: currentQuestion, 
          answer: transcript 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analysisData = await response.json();
      console.log('Analysis received:', analysisData);
      setAnalysis(analysisData);
      
      // Start 30-second timer for next question
      startTimer();
    } catch (error) {
      console.error('Error analyzing answer:', error);
      setAnalysis({
        contentScore: 5,
        clarityScore: 4,
        completenessScore: 5,
        fluencyScore: 3,
        isCorrect: false,
        isAdequate: false,
        feedback: 'Server connection issue. Please check if backend is running.',
        speechIssues: 'Unable to analyze speech patterns',
        corrections: 'Ensure backend server is running on port 5001',
        betterAnswer: 'Please restart the backend server and try again'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startTimer = () => {
    setTimeLeft(30);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-generate next question only if analysis is still showing
          if (analysis) {
            setAnalysis(null);
            setTimeout(() => {
              setQuestionCount(prev => prev + 1);
              generateQuestion();
            }, 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(0);
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
      
      {isAnalyzing && (
        <div style={{
          background: '#1a1a1a',
          padding: '15px',
          borderRadius: '8px',
          margin: '15px 0',
          border: '2px solid #FF9800',
          textAlign: 'center'
        }}>
          <div style={{ color: '#FF9800', fontSize: '16px' }}>
            🤖 Analyzing...
          </div>
        </div>
      )}
      
      <AnalysisDisplay analysis={analysis} />
      
      {analysis && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          {timeLeft > 0 && (
            <div style={{
              fontSize: '18px',
              color: '#FF9800',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              Next question in: {timeLeft}s
            </div>
          )}
          
          <button 
            onClick={() => {
              speechSynthesis.cancel();
              stopTimer();
              setAnalysis(null);
              setQuestionCount(prev => prev + 1);
              generateQuestion();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Next Question → {timeLeft > 0 ? `(${timeLeft}s)` : ''}
          </button>
        </div>
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