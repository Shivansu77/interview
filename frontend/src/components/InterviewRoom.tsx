import React, { useState, useRef, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import MediaPipeFaceMonitor from './MediaPipeFaceMonitor';
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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const maxQuestions = 5;
  const socketRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = useCallback(async () => {
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
          context: 'interview',
          sessionId: sessionId
        })
      });
      const data = await response.json();
      setCurrentQuestion(data.question);
      
      // Always speak the question automatically
      setTimeout(() => {
        console.log('🤖 Auto-speaking question:', data.question);
        speakQuestion(data.question);
      }, 500);
    } catch (error) {
      console.error('Error generating question:', error);
    }
  }, [interviewType, company]);

  useEffect(() => {
    socketRef.current = io('http://localhost:5003');
    socketRef.current.emit('join-interview', sessionId);
    
    // Stop audio when page becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => speechSynthesis.cancel());
    
    // Initialize speech synthesis
    const initSpeech = () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
        // Load voices
        speechSynthesis.getVoices();
        console.log('🔊 Speech synthesis initialized');
      }
    };
    
    initSpeech();
    
    // Show welcome message first
    if (!hasGeneratedFirst) {
      setTimeout(() => {
        setShowWelcome(false);
        setHasGeneratedFirst(true);
        generateQuestion();
      }, 3000);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', () => {});
      speechSynthesis.cancel();
      setIsSpeaking(false);
      stopTimer();
      socketRef.current?.disconnect();
    };
  }, [sessionId, hasGeneratedFirst, generateQuestion]);

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/\{(.*?)\}/g, '$1')     // Remove {curly braces}
      .replace(/\[(.*?)\]/g, '$1')     // Remove [square brackets]
      .replace(/`(.*?)`/g, '$1')       // Remove `code`
      .replace(/#{1,6}\s/g, '')        // Remove # headers
      .replace(/\n+/g, '. ')           // Replace newlines with periods
      .replace(/\s+/g, ' ')            // Clean multiple spaces
      .trim();
  };

  const speakQuestion = (text: string) => {
    if (!speechSynthesis) return;
    
    const cleanText = cleanTextForSpeech(text);
    console.log('🔊 Speaking cleaned text:', cleanText);
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.8;
    utterance.volume = 1.0;
    utterance.lang = 'en-US';
    
    // Select a better voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Samantha') || 
      voice.name.includes('Daniel') ||
      voice.name.includes('Aaron') ||
      voice.name.includes('Fred')
    ) || voices.find(voice => voice.lang === 'en-US');
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log('🎤 Using voice:', preferredVoice.name);
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
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
        <div style={{ marginTop: '15px', fontSize: '14px', color: 'hsla(36, 81%, 49%, 0.92)', textAlign: 'center', padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          ⚠️ <strong>Important:</strong> Click "Test Audio" first to enable voice in your browser!
        </div>
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px', fontSize: '12px', color: '#ccc' }}>
          <div><strong>🔊 Audio Status:</strong></div>
          <div>• Speech Synthesis: {typeof speechSynthesis !== 'undefined' ? '✅ Ready' : '❌ Not Available'}</div>
          <div>• Voice Auto-Play: ✅ Enabled (Questions will be spoken automatically)</div>
          <div>• Browser Support: {speechSynthesis?.getVoices()?.length > 0 ? '✅ Good' : '⚠️ Loading...'}</div>
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              const testText = 'Hello! Audio test successful. Your AI interviewer is ready!';
              speakQuestion(testText);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            }}
          >
            🔊 Test Audio & Enable Voice
          </button>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              padding: '12px 24px',
              backgroundColor: voiceEnabled ? '#4CAF50' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
          </button>
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
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => {
              // Reset all states and start fresh
              setInterviewComplete(false);
              setOverallResults(null);
              setAllScores([]);
              setQuestionCount(1);
              setCurrentQuestion('');
              setAnalysis(null);
              setShowWelcome(true);
              setHasGeneratedFirst(false);
              speechSynthesis.cancel();
            }}
            style={{
              padding: '15px 30px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}
          >
            🔄 Start New Interview
          </button>
          
          <button 
            onClick={() => {
              const results = {
                ...overallResults,
                timestamp: new Date().toISOString(),
                questions: allScores.length
              };
              
              const dataStr = JSON.stringify(results, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `interview-results-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '15px 30px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            }}
          >
            📊 Download Results
          </button>
          
          <button 
            onClick={() => {
              const shareText = `I just completed an AI interview! 🎉\n\nOverall Score: ${overallResults.overallScore}/10\nCorrect Answers: ${overallResults.correctAnswers}/${overallResults.totalQuestions}\nEye Contact: ${overallResults.eyeContactScore}%\n\n#AIInterview #InterviewPractice`;
              
              if (navigator.share) {
                navigator.share({
                  title: 'My AI Interview Results',
                  text: shareText
                });
              } else {
                navigator.clipboard.writeText(shareText);
                alert('Results copied to clipboard!');
              }
            }}
            style={{
              padding: '15px 30px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
            }}
          >
            📤 Share Results
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', height: '100vh', padding: '20px' }}>
      {/* Left Side - Camera */}
      <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>📹 Camera Monitor</h3>
        <MediaPipeFaceMonitor onEyeContactUpdate={setEyeContactScore} />
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
          <div style={{ color: eyeContactScore > 70 ? '#4CAF50' : '#FF9800' }}>
            Eye Contact: {eyeContactScore}%
          </div>
        </div>
      </div>
      
      {/* Right Side - Question & Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Question Section */}
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '20px', flex: '1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ color: '#4CAF50' }}>Question {questionCount} of {maxQuestions}</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => speakQuestion(currentQuestion)}
                disabled={isSpeaking}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isSpeaking ? '#666' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSpeaking ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {isSpeaking ? '🔊 Speaking...' : '🔁 Repeat'}
              </button>
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                🔊 AUTO
              </div>
              <div style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '20px', 
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {Math.round((questionCount / maxQuestions) * 100)}%
              </div>
            </div>
          </div>
          <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'white' }}>{currentQuestion}</p>
          {!analysis && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px',
              fontSize: '14px',
              color: '#4CAF50',
              border: '1px solid #4CAF50'
            }}>
              🎤 <strong>Tip:</strong> Click the microphone below and speak your answer clearly.
            </div>
          )}
        </div>
        
        {/* Voice Recorder */}
        <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '20px' }}>
          <VoiceRecorder 
            onTranscript={handleAnswerSubmit}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
          
          {!analysis && !isAnalyzing && (
            <div style={{ marginTop: '15px', textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  const textAnswer = prompt('Enter your answer:');
                  if (textAnswer && textAnswer.trim()) {
                    handleAnswerSubmit(textAnswer.trim());
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ✍️ Type Answer
              </button>
              
              <button
                onClick={() => {
                  const answer = prompt('Quick Submit - Enter your answer:');
                  if (answer && answer.trim()) {
                    handleAnswerSubmit(answer.trim());
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}
              >
                🚀 Quick Submit
              </button>
            </div>
          )}
        </div>
        
        
        {/* Analysis Section */}
        {(isAnalyzing || analysis) && (
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '20px' }}>
            {isAnalyzing && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                border: '2px solid #FF9800',
                borderRadius: '8px',
                backgroundColor: '#1a1a1a'
              }}>
                <div style={{ color: '#FF9800', fontSize: '18px' }}>
                  🤖 Analyzing your answer...
                </div>
              </div>
            )}
            {analysis && (
              <div style={{ color: 'white' }}>
                <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>📊 AI Feedback</h3>
                
                {/* Spoken Text Display */}
                {analysis.spokenText && (
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    border: '1px solid #444'
                  }}>
                    <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>🎤 Your Response</h4>
                    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#fff' }}>
                      {analysis.spokenText}
                    </p>
                    {analysis.wordCount && (
                      <div style={{ marginTop: '10px', fontSize: '14px', color: '#ccc' }}>
                        📝 {analysis.wordCount} words • 🔧 {analysis.technicalTerms || 0} technical terms
                      </div>
                    )}
                  </div>
                )}
                
                {/* Score Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `2px solid ${analysis.contentScore >= 7 ? '#4CAF50' : analysis.contentScore >= 5 ? '#FF9800' : '#f44336'}`
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: analysis.contentScore >= 7 ? '#4CAF50' : analysis.contentScore >= 5 ? '#FF9800' : '#f44336' }}>
                      {analysis.contentScore}/10
                    </div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>📝 Content</div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `2px solid ${analysis.clarityScore >= 7 ? '#4CAF50' : analysis.clarityScore >= 5 ? '#FF9800' : '#f44336'}`
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: analysis.clarityScore >= 7 ? '#4CAF50' : analysis.clarityScore >= 5 ? '#FF9800' : '#f44336' }}>
                      {analysis.clarityScore}/10
                    </div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>🗣️ Clarity</div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `2px solid ${analysis.completenessScore >= 7 ? '#4CAF50' : analysis.completenessScore >= 5 ? '#FF9800' : '#f44336'}`
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: analysis.completenessScore >= 7 ? '#4CAF50' : analysis.completenessScore >= 5 ? '#FF9800' : '#f44336' }}>
                      {analysis.completenessScore}/10
                    </div>
                    <div style={{ fontSize: '14px', color: '#ccc' }}>✅ Completeness</div>
                  </div>
                </div>
                
                {/* Feedback */}
                <div style={{
                  backgroundColor: '#1a1a1a',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #444'
                }}>
                  <h4 style={{ color: '#FF9800', marginBottom: '10px' }}>💬 AI Feedback</h4>
                  <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{analysis.feedback}</p>
                </div>
                
                {/* Improvements */}
                <div style={{
                  backgroundColor: '#1a1a1a',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #444'
                }}>
                  <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>🔧 Improvements</h4>
                  <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{analysis.corrections}</p>
                </div>
                
                {/* Suggested Answer */}
                <div style={{
                  backgroundColor: '#1a1a1a',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #444'
                }}>
                  <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>💡 Suggested Approach</h4>
                  <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{analysis.betterAnswer}</p>
                </div>
                
                {/* Speech Analysis */}
                {analysis.speechAnalysis && (
                  <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '15px',
                    border: '1px solid #444'
                  }}>
                    <h4 style={{ color: '#9C27B0', marginBottom: '10px' }}>🎯 Speech Analysis</h4>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>Accuracy: {analysis.speechAnalysis.accuracy}%</span>
                      <span style={{ color: '#ccc', marginLeft: '20px' }}>({analysis.speechAnalysis.correctWords}/{analysis.speechAnalysis.totalWords} words correct)</span>
                    </div>
                    {analysis.speechAnalysis.errors.length > 0 && (
                      <div>
                        <div style={{ color: '#f44336', marginBottom: '10px' }}>Pronunciation Issues:</div>
                        {analysis.speechAnalysis.errors.slice(0, 5).map((error: any, index: number) => (
                          <div key={index} style={{ fontSize: '14px', color: '#ccc', marginBottom: '5px' }}>
                            • Expected: "{error.expected}" → Heard: "{error.actual}" ({error.type})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Next Question Controls */}
        {analysis && questionCount < maxQuestions && (
          <div style={{ backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '20px' }}>
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
                if (questionCount < maxQuestions) {
                  setQuestionCount(prev => prev + 1);
                  generateQuestion();
                }
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
                speechSynthesis.cancel();
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
      </div>
    </div>
  );
};

export default InterviewRoom;