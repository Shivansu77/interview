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

  const [questionCount, setQuestionCount] = useState(1);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasGeneratedFirst, setHasGeneratedFirst] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [allScores, setAllScores] = useState<any[]>([]);
  const [overallResults, setOverallResults] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const [isPaused, setIsPaused] = useState(false);
  const maxQuestions = 5;
  const socketRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5003');
    socketRef.current.emit('join-interview', sessionId);
    
    // Show welcome message first
    if (!hasGeneratedFirst) {
      setTimeout(() => {
        setShowWelcome(false);
        setHasGeneratedFirst(true);
        generateQuestion();
      }, 3000);
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
      
      const response = await fetch('http://localhost:5003/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: interviewType, 
          company: company,
          difficulty: 'medium',
          context: 'interview'
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
      const response = await fetch('http://localhost:5003/api/ai/analyze-answer', {
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
      
      // Store score for overall calculation
      const questionScore = {
        questionNumber: questionCount,
        question: currentQuestion,
        answer: transcript,
        contentScore: analysisData.contentScore,
        clarityScore: analysisData.clarityScore,
        completenessScore: analysisData.completenessScore,
        fluencyScore: analysisData.fluencyScore,
        eyeContactScore: eyeContactScore,
        isCorrect: analysisData.isCorrect,
        isAdequate: analysisData.isAdequate
      };
      
      const updatedScores = [...allScores, questionScore];
      setAllScores(updatedScores);
      
      // Check if interview is complete
      if (questionCount >= maxQuestions) {
        await completeInterview(updatedScores);
      } else {
        // Start 30-second timer for next question
        startTimer();
      }
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

  const completeInterview = async (scores: any[]) => {
    try {
      // Calculate overall scores
      const avgContent = scores.reduce((sum, s) => sum + s.contentScore, 0) / scores.length;
      const avgClarity = scores.reduce((sum, s) => sum + s.clarityScore, 0) / scores.length;
      const avgCompleteness = scores.reduce((sum, s) => sum + s.completenessScore, 0) / scores.length;
      const avgFluency = scores.reduce((sum, s) => sum + s.fluencyScore, 0) / scores.length;
      const avgEyeContact = scores.reduce((sum, s) => sum + s.eyeContactScore, 0) / scores.length;
      const overallScore = (avgContent + avgClarity + avgCompleteness + avgFluency) / 4;
      
      // Determine focus areas
      const focusAreas = [];
      if (avgContent < 6) focusAreas.push('Technical Knowledge');
      if (avgClarity < 6) focusAreas.push('Communication Clarity');
      if (avgCompleteness < 6) focusAreas.push('Answer Completeness');
      if (avgFluency < 6) focusAreas.push('Speaking Fluency');
      if (avgEyeContact < 60) focusAreas.push('Eye Contact');
      
      const results = {
        overallScore: Math.round(overallScore * 10) / 10,
        contentScore: Math.round(avgContent * 10) / 10,
        clarityScore: Math.round(avgClarity * 10) / 10,
        completenessScore: Math.round(avgCompleteness * 10) / 10,
        fluencyScore: Math.round(avgFluency * 10) / 10,
        eyeContactScore: Math.round(avgEyeContact),
        focusAreas: focusAreas,
        totalQuestions: maxQuestions,
        correctAnswers: scores.filter(s => s.isCorrect).length,
        adequateAnswers: scores.filter(s => s.isAdequate).length,
        interviewType: interviewType,
        company: company,
        completedAt: new Date().toISOString()
      };
      
      // Save to backend
      await fetch('http://localhost:5003/api/interview/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: results,
          questionScores: scores
        }),
      });
      
      setOverallResults(results);
      setInterviewComplete(true);
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };
  
  const startTimer = () => {
    setTimeLeft(30);
    setIsPaused(false);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-generate next question only if analysis is still showing
          if (analysis && questionCount < maxQuestions) {
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
  
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (analysis && questionCount < maxQuestions) {
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

  if (showWelcome) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        backgroundColor: '#1a1a1a',
        borderRadius: '10px',
        color: 'white',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>Welcome to Your AI Interview!</h2>
        <div style={{ fontSize: '18px', lineHeight: '1.6', maxWidth: '600px' }}>
          <p>📹 <strong>Camera:</strong> Position your face in the green guide</p>
          <p>🎤 <strong>Microphone:</strong> Speak clearly when answering</p>
          <p>🤖 <strong>AI Interviewer:</strong> Will ask you {maxQuestions} questions</p>
          <p>📊 <strong>Real-time Feedback:</strong> Get instant analysis</p>
        </div>
        <div style={{
          marginTop: '30px',
          padding: '15px 30px',
          backgroundColor: '#2a2a2a',
          borderRadius: '8px',
          border: '2px solid #4CAF50'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' }}>Interview Type: {interviewType.toUpperCase()}</div>
          <div style={{ fontSize: '14px', color: '#ccc', marginTop: '5px' }}>Company Focus: {company}</div>
        </div>
        <div style={{ marginTop: '20px', color: '#FF9800' }}>
          🔄 Preparing your first question...
        </div>
      </div>
    );
  }
  
  if (interviewComplete && overallResults) {
    return (
      <div className="interview-dashboard" style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#1a1a1a',
        borderRadius: '10px',
        color: 'white'
      }}>
        <h1 style={{ textAlign: 'center', color: '#4CAF50', marginBottom: '30px' }}>🎉 Interview Complete!</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ color: '#FF9800', marginBottom: '20px' }}>📊 Overall Performance</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', color: '#4CAF50' }}>
              {overallResults.overallScore}/10
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <div>✅ {overallResults.correctAnswers}/{overallResults.totalQuestions} Correct</div>
              <div>📈 {overallResults.adequateAnswers}/{overallResults.totalQuestions} Adequate</div>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ color: '#FF9800', marginBottom: '20px' }}>📋 Detailed Scores</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>📝 Content: <strong>{overallResults.contentScore}/10</strong></div>
              <div>🗣️ Clarity: <strong>{overallResults.clarityScore}/10</strong></div>
              <div>✅ Completeness: <strong>{overallResults.completenessScore}/10</strong></div>
              <div>🎤 Fluency: <strong>{overallResults.fluencyScore}/10</strong></div>
              <div style={{ gridColumn: '1 / -1' }}>👁️ Eye Contact: <strong>{overallResults.eyeContactScore}%</strong></div>
            </div>
          </div>
        </div>
        
        {overallResults.focusAreas.length > 0 && (
          <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
            <h3 style={{ color: '#f44336', marginBottom: '15px' }}>🎯 Areas to Focus On</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {overallResults.focusAreas.map((area: string, index: number) => (
                <span key={index} style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  {area}
                </span>
              ))}
            </div>
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#ccc' }}>
              💡 <strong>Tip:</strong> Practice these areas to improve your interview performance!
            </div>
          </div>
        )}
        
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 30px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🔄 Start New Interview
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="interview-room">
      <div className="video-section">
        <FaceMonitor onEyeContactUpdate={setEyeContactScore} />
      </div>
      
      <div className="question-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Question {questionCount} of {maxQuestions}</h2>
          <div style={{ 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '5px 15px', 
            borderRadius: '20px', 
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {Math.round((questionCount / maxQuestions) * 100)}% Complete
          </div>
        </div>
        <p style={{ fontSize: '18px', lineHeight: '1.6' }}>{currentQuestion}</p>
        {!analysis && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#2a2a2a', 
            borderRadius: '5px',
            fontSize: '14px',
            color: '#4CAF50'
          }}>
            🎤 <strong>Tip:</strong> Click the microphone and speak your answer clearly. Take your time!
          </div>
        )}
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
      
      {analysis && questionCount < maxQuestions && (
        <div style={{
          margin: '30px 0',
          padding: '0'
        }}>
          {/* Timer Section */}
          {timeLeft > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#2a2a2a',
              borderRadius: '12px',
              border: '1px solid #444',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: timeLeft <= 10 ? '#f44336' : '#4CAF50',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                <span>⏱️</span>
                <span>Next in {timeLeft}s</span>
              </div>
              
              <button
                onClick={isPaused ? resumeTimer : pauseTimer}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isPaused ? '#4CAF50' : '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
            </div>
          )}
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid #444',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}>
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
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              Next Question →
            </button>
            
            <button 
              onClick={() => {
                stopTimer();
                setAnalysis(null);
                generateQuestion();
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
              🔄 Retry Question
            </button>
          </div>
        </div>
      )}
      
      <div className="stats">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Eye Contact: {eyeContactScore}%</div>
          <div style={{ 
            fontSize: '12px', 
            color: eyeContactScore > 70 ? '#4CAF50' : eyeContactScore > 40 ? '#FF9800' : '#f44336', 
            marginTop: '5px',
            textAlign: 'center'
          }}>
            {eyeContactScore > 70 ? '✓ Excellent! Keep it up' : eyeContactScore > 40 ? '⚠ Good, look directly at camera' : '✗ Look at the camera lens'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Progress</div>
          <div style={{ fontSize: '14px', color: '#4CAF50' }}>{questionCount}/{maxQuestions} Questions</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Interview Type</div>
          <div style={{ fontSize: '14px', color: '#FF9800', textTransform: 'capitalize' }}>{interviewType}</div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;