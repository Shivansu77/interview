import React, { useState, useRef, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import MediaPipeFaceMonitor from './MediaPipeFaceMonitor';
import VoiceRecorder from './VoiceRecorder';
import AnimatedBlob from './AnimatedBlob';
import ProfessionalAIBlob from './ProfessionalAIBlob';
import InterviewModeSelector, { InterviewConfig, CVProfile } from './InterviewModeSelector';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';


// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0% { opacity: 0.3; }
    100% { opacity: 0.8; }
  }
  @keyframes wave {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(2deg); }
  }

`;
document.head.appendChild(style);



interface InterviewRoomProps {
  sessionId: string;
  userId: string;
  interviewType: string;
  company: string;
  profile?: CVProfile;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ sessionId, userId, interviewType, company, profile }) => {
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
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { isAnalyzing: isListening } = useAudioAnalyzer();

  const [isPaused, setIsPaused] = useState(false);

  const socketRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const speakQuestion = useCallback((text: string) => {
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
  }, []);

  const generateQuestion = useCallback(async (config?: InterviewConfig) => {
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
          sessionId: sessionId,
          interviewConfig: config || interviewConfig
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
  }, [interviewType, company, sessionId, interviewConfig, speakQuestion]);

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
    if (!hasGeneratedFirst && !showModeSelector && interviewConfig) {
      setTimeout(() => {
        setShowWelcome(false);
        setHasGeneratedFirst(true);
        generateQuestion(interviewConfig);
      }, 3000);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', () => {});
      speechSynthesis.cancel();
      setIsSpeaking(false);
      stopTimer();
      socketRef.current?.disconnect();
    };
  }, [sessionId, hasGeneratedFirst, generateQuestion, showModeSelector, interviewConfig]);

  const handleStartInterview = (config: InterviewConfig) => {
    setInterviewConfig(config);
    setShowModeSelector(false);
    
    // Set max questions based on mode
    if (config.mode === 'cv') {
      setMaxQuestions(7);
    } else if (config.mode === 'role') {
      setMaxQuestions(6);
    } else if (config.mode === 'practice') {
      setMaxQuestions(5);
    }
  };

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
      
      // AI speaks feedback after analysis
      if (analysisData.feedback) {
        setTimeout(() => {
          const feedbackText = `Well, you have great experience in web development. ${analysisData.feedback}`;
          speakQuestion(feedbackText);
        }, 1000);
      }
      
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
              generateQuestion(interviewConfig || undefined);
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
              generateQuestion(interviewConfig || undefined);
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

  if (showModeSelector) {
    return <InterviewModeSelector onStartInterview={handleStartInterview} />;
  }

  if (showWelcome) {
    return (
      <div style={{
        backgroundColor: '#000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Blob Backgrounds - Optimized */}
        <AnimatedBlob 
          position="top-left" 
          color="#667eea" 
          size={520} 
          delay={0} 
          opacity={0.2} 
          duration={30} 
          animationType="wave" 
          blur={85} 
          enableGlow={true} 
        />
        <AnimatedBlob 
          position="top-right" 
          color="#764ba2" 
          size={480} 
          delay={4} 
          opacity={0.18} 
          duration={35} 
          animationType="elastic" 
          blur={80} 
          enableGlow={true} 
        />
        <AnimatedBlob 
          position="bottom-left" 
          color="#f093fb" 
          size={550} 
          delay={2} 
          opacity={0.15} 
          duration={32} 
          animationType="liquid" 
          blur={75} 
        />
        <AnimatedBlob 
          position="bottom-right" 
          color="#43e97b" 
          size={490} 
          delay={6} 
          opacity={0.16} 
          duration={28} 
          animationType="pulse" 
          blur={70} 
          enableGlow={true} 
        />
        <AnimatedBlob 
          position="center" 
          color="#4facfe" 
          size={420} 
          delay={8} 
          opacity={0.12} 
          duration={38} 
          animationType="breathe" 
          blur={75} 
        />
        
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid #333',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ fontSize: '60px', marginBottom: '15px', animation: 'bounce 2s infinite' }}>🚀</div>
          <h1 className="space-title" style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>Welcome to Your AI Mission!</h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {[
              { icon: '🛸', title: 'Visual Scanner', desc: 'Position your face in the cosmic guide' },
              { icon: '📡', title: 'Audio Transmitter', desc: 'Speak clearly when responding' },
              { icon: '🤖', title: 'AI Commander', desc: `Will transmit ${maxQuestions} challenges` },
              { icon: '🌌', title: 'Real-time Analysis', desc: 'Get instant cosmic feedback' }
            ].map((item, i) => (
              <div key={i} style={{
                backgroundColor: '#111',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#fff', fontSize: '12px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          
          <div className="space-card" style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '18px',
            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              Mission Type: {interviewType.toUpperCase()}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>Sector Focus: {company}</div>
          </div>
          
          <div className="space-card" style={{
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '15px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '14px' }}>🛸 Initializing first transmission...</div>
          </div>
          
          <div className="space-card" style={{
            background: 'rgba(251, 191, 36, 0.2)',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '15px',
            border: '1px solid rgba(251, 191, 36, 0.3)'
          }}>
            <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '13px' }}>⚠️ Critical: Activate "Test Transmission" first!</div>
          </div>
          
          <div className="space-card" style={{
            background: 'rgba(59, 130, 246, 0.2)',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '18px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#3b82f6', fontSize: '14px' }}>📡 Transmission Status</div>
            <div style={{ textAlign: 'left', fontSize: '12px', lineHeight: '1.6' }}>
              <div>• Voice Synthesis: {typeof speechSynthesis !== 'undefined' ? '✅ Online' : '❌ Offline'}</div>
              <div>• Auto-Transmission: ✅ Active</div>
              <div>• System: {speechSynthesis?.getVoices()?.length > 0 ? '✅ Operational' : '⚠️ Initializing...'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const testText = 'Hello! Audio test successful. Your AI interviewer is ready!';
                speakQuestion(testText);
              }}
              className="space-button"
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📡 Test Transmission
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={voiceEnabled ? 'space-button' : 'space-button-outline'}
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {voiceEnabled ? '📡 Transmission ON' : '📵 Transmission OFF'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (interviewComplete && overallResults) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Blob Backgrounds for Results - Celebration Theme */}
        <AnimatedBlob 
          position="top-left" 
          color="#4CAF50" 
          size={520} 
          delay={0} 
          opacity={0.2} 
          duration={28} 
          animationType="wave" 
          blur={85} 
          enableGlow={true} 
        />
        <AnimatedBlob 
          position="top-right" 
          color="#FF9800" 
          size={470} 
          delay={3} 
          opacity={0.18} 
          duration={25} 
          animationType="elastic" 
          blur={80} 
          enableGlow={true} 
        />
        <AnimatedBlob 
          position="bottom-left" 
          color="#2196F3" 
          size={500} 
          delay={5} 
          opacity={0.16} 
          duration={30} 
          animationType="liquid" 
          blur={75} 
        />
        <AnimatedBlob 
          position="bottom-right" 
          color="#9C27B0" 
          size={540} 
          delay={2} 
          opacity={0.17} 
          duration={32} 
          animationType="pulse" 
          blur={70} 
          enableGlow={true} 
        />
        <AnimatedBlob 
          position="center" 
          color="#FFD700" 
          size={420} 
          delay={7} 
          opacity={0.14} 
          duration={35} 
          animationType="breathe" 
          blur={75} 
        />
        
        <div className="interview-dashboard" style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          color: 'white',
          position: 'relative',
          zIndex: 1
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
            className="space-button"
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            🔄 Start New Mission
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
              link.download = `mission-results-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="space-button"
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            📊 Download Data
          </button>
          
          <button 
            onClick={() => {
              const shareText = `I just completed an AI mission! 🚀\n\nOverall Score: ${overallResults.overallScore}/10\nCorrect Answers: ${overallResults.correctAnswers}/${overallResults.totalQuestions}\nEye Contact: ${overallResults.eyeContactScore}%\n\n#AIMission #InterviewPractice`;
              
              if (navigator.share) {
                navigator.share({
                  title: 'My AI Mission Results',
                  text: shareText
                });
              } else {
                navigator.clipboard.writeText(shareText);
                alert('Results copied to clipboard!');
              }
            }}
            className="space-button"
            style={{
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            📤 Share Results
          </button>
        </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr', 
      gap: '20px', 
      minHeight: '100vh', 
      padding: '20px', 
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Blob Backgrounds - Interview Room */}
      <AnimatedBlob 
        position="top-left" 
        color="#667eea" 
        size={450} 
        delay={0} 
        opacity={0.18} 
        duration={30} 
        animationType="elastic" 
        blur={80} 
        enableGlow={true} 
      />
      <AnimatedBlob 
        position="top-right" 
        color="#f093fb" 
        size={400} 
        delay={5} 
        opacity={0.15} 
        duration={28} 
        animationType="wave" 
        blur={75} 
      />
      <AnimatedBlob 
        position="bottom-left" 
        color="#4facfe" 
        size={480} 
        delay={2} 
        opacity={0.17} 
        duration={26} 
        animationType="liquid" 
        blur={85} 
        enableGlow={true} 
      />
      <AnimatedBlob 
        position="center" 
        color="#764ba2" 
        size={420} 
        delay={7} 
        opacity={0.14} 
        duration={35} 
        animationType="breathe" 
        blur={70} 
      />
      <AnimatedBlob 
        position="bottom-right" 
        color="#43e97b" 
        size={380} 
        delay={4} 
        opacity={0.12} 
        duration={32} 
        animationType="pulse" 
        blur={70} 
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', position: 'relative', zIndex: 1 }}>
        {/* Left Side - Camera & Avatar */}
        <div className="space-card" style={{
          padding: '20px',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h3 className="space-text" style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px', margin: 0 }}>🛸 Visual Monitor</h3>
            <MediaPipeFaceMonitor onEyeContactUpdate={setEyeContactScore} />
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
              <div style={{ color: eyeContactScore > 70 ? '#fff' : '#ccc', fontWeight: '500' }}>
                Eye Contact: {eyeContactScore}%
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="space-text" style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px', margin: 0 }}>🌌 AI Commander</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              borderRadius: '12px',
              border: '1px solid #333',
              position: 'relative'
            }}>
              <ProfessionalAIBlob
                size={120}
                primaryColor={isSpeaking ? '#e91e63' : isListening || isRecording ? '#bb86fc' : '#9c27b0'}
                secondaryColor={isSpeaking ? '#ff5722' : isListening || isRecording ? '#6200ea' : '#673ab7'}
                isActive={isSpeaking || isListening || isRecording}
                intensity={isSpeaking ? 'high' : isListening || isRecording ? 'medium' : 'low'}
              />
              
              <div style={{
                marginTop: '15px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                zIndex: 2,
                position: 'relative'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isListening || isRecording ? '#00ff00' : '#666'
                }} />
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>
                  {isSpeaking ? 'Speaking...' : isListening || isRecording ? 'Listening...' : 'Ready'}
                </span>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isSpeaking ? '#ff6b6b' : '#666'
                }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Question & Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Question Section */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 className="space-title" style={{ fontSize: '24px', fontWeight: '300', margin: 0 }}>🚀 Transmission {questionCount} of {maxQuestions}</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => speakQuestion(currentQuestion)}
                  disabled={isSpeaking}
                  className="space-button"
                  style={{
                    padding: '8px 14px',
                    cursor: isSpeaking ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  {isSpeaking ? '🔊 Speaking...' : '🔁 Repeat'}
                </button>
                <div className="space-button" style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  🔊 AUTO
                </div>
                <div className="space-button" style={{ 
                  padding: '6px 10px', 
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {Math.round((questionCount / maxQuestions) * 100)}%
                </div>
              </div>
            </div>
            <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'white', marginBottom: '16px' }}>{currentQuestion}</p>
            {!analysis && (
              <div style={{ 
                marginTop: '16px', 
                padding: '16px', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '8px',
                fontSize: '14px',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                🎤 <strong>Tip:</strong> Click the microphone below and speak your answer clearly.
              </div>
            )}
          </div>
        
          {/* Voice Recorder */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <VoiceRecorder 
              onTranscript={handleAnswerSubmit}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
            
            {!analysis && !isAnalyzing && (
              <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const textAnswer = prompt('Enter your response:');
                    if (textAnswer && textAnswer.trim()) {
                      handleAnswerSubmit(textAnswer.trim());
                    }
                  }}
                  className="space-button"
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  ✍️ Type Response
                </button>
                
                <button
                  onClick={() => {
                    const answer = prompt('Quick Transmit - Enter your response:');
                    if (answer && answer.trim()) {
                      handleAnswerSubmit(answer.trim());
                    }
                  }}
                  className="space-button"
                  style={{
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  🚀 Quick Transmit
                </button>
              </div>
            )}
          </div>
        
        
          {/* Analysis Section */}
          {(isAnalyzing || analysis) && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {isAnalyzing && (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)'
                }}>
                  <div style={{ color: '#f59e0b', fontSize: '18px', fontWeight: '500' }}>
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
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {/* Timer Section */}
              {timeLeft > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: timeLeft <= 10 ? '#ef4444' : '#10b981',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    <span>⏱️</span>
                    <span>Next in {timeLeft}s</span>
                  </div>
                  
                  <button
                    onClick={isPaused ? resumeTimer : pauseTimer}
                    className="space-button"
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      background: isPaused ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)'
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
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => {
                    speechSynthesis.cancel();
                    stopTimer();
                    setAnalysis(null);
                    if (questionCount < maxQuestions) {
                      setQuestionCount(prev => prev + 1);
                      generateQuestion(interviewConfig || undefined);
                    }
                  }}
                  className="space-button"
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  Next Transmission →
                </button>
                
                <button 
                  onClick={() => {
                    speechSynthesis.cancel();
                    stopTimer();
                    setAnalysis(null);
                    generateQuestion(interviewConfig || undefined);
                  }}
                  className="space-button-outline"
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🔄 Retry Transmission
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;