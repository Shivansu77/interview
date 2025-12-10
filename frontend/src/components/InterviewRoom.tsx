
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { Mic, Send, Play, Pause, RotateCcw, Download, Share2, CheckCircle, AlertCircle, Clock, Volume2, VolumeX, ChevronRight, Sparkles, Eye, MessageSquare, Activity } from 'lucide-react';
import MediaPipeFaceMonitor from './MediaPipeFaceMonitor';
import VoiceRecorder from './VoiceRecorder';
import ProfessionalAIBlob from './ProfessionalAIBlob';
import InterviewModeSelector, { InterviewConfig } from './InterviewModeSelector';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';





interface InterviewRoomProps {
  sessionId: string;
  userId: string;
  interviewType: string;
  company: string;
  config?: InterviewConfig;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ sessionId, userId, interviewType, company, config }) => {
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
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(config || null);
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { isAnalyzing: isListening } = useAudioAnalyzer();

  const [isPaused, setIsPaused] = useState(false);

  const socketRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const speakQuestion = useCallback((text: string) => {
    if (!speechSynthesis || !text) return;

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

      if (data.question) {
        setCurrentQuestion(data.question);

        // Always speak the question automatically
        setTimeout(() => {
          console.log('🤖 Auto-speaking question:', data.question);
          speakQuestion(data.question);
        }, 500);
      } else {
        console.error('No question received from backend:', data);
      }
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
      document.removeEventListener('visibilitychange', () => { });
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
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\{(.*?)\}/g, '$1')
      .replace(/\[(.*?)\]/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
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
          answer: transcript,
          interviewType: interviewType,
          company: company,
          interviewConfig: interviewConfig
        })
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }

      const analysisData = await response.json();
      console.log('Analysis received:', analysisData);
      setAnalysis(analysisData);

      // Generate and speak NATURAL feedback (not the technical analysis)
      if (analysisData) {
        try {
          // Request natural feedback from backend
          const feedbackResponse = await fetch('http://localhost:5003/api/ai/generate-natural-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ analysisData })
          });

          if (feedbackResponse.ok) {
            const { naturalFeedback } = await feedbackResponse.json();

            // Speak the natural, conversational feedback
            setTimeout(() => {
              console.log('🗣️ Speaking natural feedback:', naturalFeedback);
              speakQuestion(naturalFeedback);
            }, 1000);
          } else {
            // Fallback: create simple natural feedback on frontend
            const overallScore = (analysisData.contentScore + analysisData.clarityScore +
              analysisData.completenessScore + analysisData.fluencyScore) / 4;
            let simpleFeedback = overallScore >= 7
              ? 'Great job on that answer! '
              : overallScore >= 5
                ? 'Thanks for your answer. '
                : 'I can see you\'re working on this. ';

            // Add one key insight
            if (analysisData.fluencyMetrics?.fillerWordCount > 3) {
              simpleFeedback += `I noticed a few filler words. Try to speak more deliberately next time.`;
            } else if (analysisData.contentScore >= 7) {
              simpleFeedback += `Your technical understanding came through well. Keep it up!`;
            } else {
              simpleFeedback += `Think about adding more specific examples in your next answer.`;
            }

            setTimeout(() => {
              speakQuestion(simpleFeedback);
            }, 1000);
          }
        } catch (feedbackError) {
          console.error('Natural feedback error:', feedbackError);
          // Fallback to simple encouraging message
          setTimeout(() => {
            speakQuestion('Thanks for your answer. Let\'s continue to the next question.');
          }, 1000);
        }
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
        clarityScore: 5,
        completenessScore: 5,
        fluencyScore: 5,
        isCorrect: false,
        isAdequate: true,
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
        backgroundColor: 'var(--bg-primary)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--text-primary)'
      }}>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ fontSize: '60px', marginBottom: '15px', animation: 'bounce 2s infinite' }}>🚀</div>
          <h1 className="minimal-title" style={{
            fontSize: '36px',
            marginBottom: '20px'
          }}>Welcome to Your AI Mission!</h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {[
              { icon: <Eye size={24} />, title: 'Visual Scanner', desc: 'Position your face in the guide' },
              { icon: <Mic size={24} />, title: 'Audio Transmitter', desc: 'Speak clearly when responding' },
              { icon: <MessageSquare size={24} />, title: 'AI Commander', desc: 'Will transmit ' + maxQuestions + ' challenges' },
              { icon: <Activity size={24} />, title: 'Real-time Analysis', desc: 'Get instant feedback' }
            ].map((item, i) => (
              <div key={i} style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ color: 'var(--text-primary)' }}>{item.icon}</div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '12px' }}>{item.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '18px',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>
              Mission Type: {interviewType.toUpperCase()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sector Focus: {company}</div>
          </div>

          <div style={{
            background: '#fffbeb',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '15px',
            border: '1px solid #fcd34d',
            textAlign: 'center'
          }}>
            <div style={{ color: '#b45309', fontWeight: '600', fontSize: '14px' }}>🛸 Initializing first transmission...</div>
          </div>

          <div style={{
            background: '#fef3c7',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '15px',
            border: '1px solid #fcd34d'
          }}>
            <div style={{ color: '#d97706', fontWeight: '600', fontSize: '13px' }}>⚠️ Critical: Activate "Test Transmission" first!</div>
          </div>

          <div style={{
            background: '#eff6ff',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '18px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '10px', color: '#1d4ed8', fontSize: '14px' }}>📡 Transmission Status</div>
            <div style={{ textAlign: 'left', fontSize: '12px', lineHeight: '1.6', color: '#1e40af' }}>
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
              className="minimal-button-primary"
            >
              <Volume2 size={16} />
              Test Transmission
            </button>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="minimal-button-secondary"
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {voiceEnabled ? 'Transmission ON' : 'Transmission OFF'}
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
        backgroundColor: 'var(--bg-primary)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        color: 'var(--text-primary)'
      }}>

        <div className="interview-dashboard" style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '40px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '30px', fontSize: '32px' }}>
            <Sparkles size={32} style={{ display: 'inline', marginRight: '10px', color: '#eab308' }} />
            Interview Complete!
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} /> Overall Performance
              </h3>
              <div style={{ fontSize: '64px', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
                {overallResults.overallScore}<span style={{ fontSize: '24px', color: 'var(--text-tertiary)' }}>/10</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                  <CheckCircle size={16} /> {overallResults.correctAnswers}/{overallResults.totalQuestions} Correct
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ca8a04' }}>
                  <Activity size={16} /> {overallResults.adequateAnswers}/{overallResults.totalQuestions} Adequate
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} /> Detailed Scores
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Content</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{overallResults.contentScore}/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Clarity</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{overallResults.clarityScore}/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Completeness</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{overallResults.completenessScore}/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fluency</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{overallResults.fluencyScore}/10</strong>
                </div>
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Eye size={16} /> Eye Contact
                  </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{overallResults.eyeContactScore}%</strong>
                </div>
              </div>
            </div>
          </div>

          {overallResults.focusAreas.length > 0 && (
            <div style={{
              backgroundColor: '#fef2f2',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '30px',
              border: '1px solid #fecaca'
            }}>
              <h3 style={{ color: '#dc2626', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} /> Areas to Focus On
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {overallResults.focusAreas.map((area: string, index: number) => (
                  <span key={index} style={{
                    backgroundColor: '#fff',
                    color: '#dc2626',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    border: '1px solid #fecaca',
                    fontWeight: '500'
                  }}>
                    {area}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: '15px', fontSize: '14px', color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} /> <strong>Tip:</strong> Practice these areas to improve your interview performance!
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
              className="minimal-button-primary"
            >
              <RotateCcw size={18} /> Start New Mission
            </button>

            <button
              onClick={() => {
                const results = {
                  ...overallResults,
                  timestamp: new Date().toISOString(),
                  questions: allScores.length
                };

                const dataStr = JSON.stringify(results, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'mission-results-' + new Date().toISOString().split('T')[0] + '.json';
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="minimal-button-secondary"
            >
              <Download size={18} /> Download Data
            </button>

            <button
              onClick={() => {
                const shareText = 'I just completed an AI mission! 🚀\n\nOverall Score: ' + overallResults.overallScore + '/10\nCorrect Answers: ' + overallResults.correctAnswers + '/' + overallResults.totalQuestions + '\nEye Contact: ' + overallResults.eyeContactScore + '%\n\n#AIMission #InterviewPractice';

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
              className="minimal-button-secondary"
            >
              <Share2 size={18} /> Share Results
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
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', position: 'relative', zIndex: 1 }}>
        {/* Left Side - Camera & Avatar */}
        <div style={{
          padding: '20px',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} /> Visual Monitor
            </h3>
            <MediaPipeFaceMonitor onEyeContactUpdate={setEyeContactScore} />
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
              <div style={{ color: eyeContactScore > 70 ? '#16a34a' : '#ca8a04', fontWeight: '600' }}>
                Eye Contact: {eyeContactScore}%
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> AI Commander
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              position: 'relative'
            }}>
              <ProfessionalAIBlob
                size={120}
                primaryColor={isSpeaking ? '#2563eb' : isListening || isRecording ? '#16a34a' : '#4b5563'}
                secondaryColor={isSpeaking ? '#3b82f6' : isListening || isRecording ? '#22c55e' : '#6b7280'}
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
                  backgroundColor: isListening || isRecording ? '#16a34a' : '#9ca3af'
                }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>
                  {isSpeaking ? 'Speaking...' : isListening || isRecording ? 'Listening...' : 'Ready'}
                </span>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isSpeaking ? '#2563eb' : '#9ca3af'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Question & Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Question Section */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>
                  {questionCount}/{maxQuestions}
                </span>
                Current Question
              </h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => speakQuestion(currentQuestion)}
                  disabled={isSpeaking}
                  className="minimal-button-secondary"
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  {isSpeaking ? <Volume2 size={14} /> : <RotateCcw size={14} />}
                  {isSpeaking ? 'Speaking...' : 'Repeat'}
                </button>
                <div style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-light)'
                }}>
                  AUTO-PLAY ON
                </div>
              </div>
            </div>
            <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: '500' }}>{currentQuestion}</p>
            {!analysis && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Mic size={16} /> <strong>Tip:</strong> Click the microphone below and speak your answer clearly.
              </div>
            )}
          </div>

          {/* Voice Recorder */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-sm)'
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
                  className="minimal-button-secondary"
                >
                  <MessageSquare size={16} /> Type Response
                </button>

                <button
                  onClick={() => {
                    const answer = prompt('Quick Transmit - Enter your response:');
                    if (answer && answer.trim()) {
                      handleAnswerSubmit(answer.trim());
                    }
                  }}
                  className="minimal-button-primary"
                >
                  <Send size={16} /> Quick Transmit
                </button>
              </div>
            )}
          </div>


          {/* Analysis Section */}
          {(isAnalyzing || analysis) && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {isAnalyzing && (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  backgroundColor: '#fffbeb'
                }}>
                  <div style={{ color: '#b45309', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Activity className="animate-pulse" /> Analyzing your answer...
                  </div>
                </div>
              )}
              {analysis && (
                <div style={{ color: 'var(--text-primary)' }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} /> AI Feedback
                  </h3>

                  {/* Spoken Text Display */}
                  {analysis.spokenText && (
                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Response</h4>
                      <p style={{ fontSize: '16px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                        {analysis.spokenText}
                      </p>
                      {analysis.wordCount && (
                        <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
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
                      backgroundColor: 'var(--bg-primary)',
                      padding: '15px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid ' + (analysis.contentScore >= 7 ? '#16a34a' : analysis.contentScore >= 5 ? '#ca8a04' : '#dc2626')
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: analysis.contentScore >= 7 ? '#16a34a' : analysis.contentScore >= 5 ? '#ca8a04' : '#dc2626' }}>
                        {analysis.contentScore}/10
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Content</div>
                    </div>

                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '15px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid ' + (analysis.clarityScore >= 7 ? '#16a34a' : analysis.clarityScore >= 5 ? '#ca8a04' : '#dc2626')
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: analysis.clarityScore >= 7 ? '#16a34a' : analysis.clarityScore >= 5 ? '#ca8a04' : '#dc2626' }}>
                        {analysis.clarityScore}/10
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Clarity</div>
                    </div>

                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '15px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid ' + (analysis.completenessScore >= 7 ? '#16a34a' : analysis.completenessScore >= 5 ? '#ca8a04' : '#dc2626')
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: analysis.completenessScore >= 7 ? '#16a34a' : analysis.completenessScore >= 5 ? '#ca8a04' : '#dc2626' }}>
                        {analysis.completenessScore}/10
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Completeness</div>
                    </div>

                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '15px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid ' + (analysis.fluencyScore >= 7 ? '#16a34a' : analysis.fluencyScore >= 5 ? '#ca8a04' : '#dc2626')
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: analysis.fluencyScore >= 7 ? '#16a34a' : analysis.fluencyScore >= 5 ? '#ca8a04' : '#dc2626' }}>
                        {analysis.fluencyScore}/10
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Fluency</div>
                    </div>
                  </div>

                  {/* Fluency Metrics - NEW */}
                  {analysis.fluencyMetrics && (
                    <div className="analysis-card" style={{ marginBottom: '20px', padding: '20px' }}>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                        <Activity size={18} /> Speech Analysis
                      </h4>

                      {/* Fluency Meter */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Overall Fluency</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: analysis.fluencyScore >= 7 ? '#16a34a' : analysis.fluencyScore >= 5 ? '#ca8a04' : '#dc2626' }}>
                            {analysis.fluencyScore >= 8 ? 'Excellent' : analysis.fluencyScore >= 6 ? 'Good' : analysis.fluencyScore >= 4 ? 'Fair' : 'Needs Work'}
                          </span>
                        </div>
                        <div className="fluency-meter">
                          <div className="fluency-meter-fill" style={{ width: `${Math.min(100, analysis.fluencyScore * 10)}%` }}></div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        {analysis.fluencyMetrics.fillerWordCount !== undefined && (
                          <div style={{
                            backgroundColor: analysis.fluencyMetrics.fillerWordCount > 3 ? '#fee2e2' : '#f0fdf4',
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1px solid ${analysis.fluencyMetrics.fillerWordCount > 3 ? '#fca5a5' : '#86efac'}`
                          }}>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: analysis.fluencyMetrics.fillerWordCount > 3 ? '#dc2626' : '#16a34a' }}>
                              {analysis.fluencyMetrics.fillerWordCount}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Filler Words</div>
                            {analysis.fluencyMetrics.detectedFillers && analysis.fluencyMetrics.detectedFillers.length > 0 && (
                              <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-tertiary)' }}>
                                {analysis.fluencyMetrics.detectedFillers.slice(0, 2).map((f: any) => f.word).join(', ')}
                              </div>
                            )}
                          </div>
                        )}

                        {analysis.fluencyMetrics.wordsPerMinute && (
                          <div style={{
                            backgroundColor: analysis.fluencyMetrics.wordsPerMinute >= 120 && analysis.fluencyMetrics.wordsPerMinute <= 160 ? '#f0fdf4' : '#fef3c7',
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1px solid ${analysis.fluencyMetrics.wordsPerMinute >= 120 && analysis.fluencyMetrics.wordsPerMinute <= 160 ? '#86efac' : '#fcd34d'}`
                          }}>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: analysis.fluencyMetrics.wordsPerMinute >= 120 && analysis.fluencyMetrics.wordsPerMinute <= 160 ? '#16a34a' : '#ca8a04' }}>
                              {analysis.fluencyMetrics.wordsPerMinute}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Words/Min</div>
                            <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-tertiary)' }}>
                              {analysis.fluencyMetrics.wordsPerMinute < 100 ? 'Too slow' : analysis.fluencyMetrics.wordsPerMinute > 180 ? 'Too fast' : 'Good pace'}
                            </div>
                          </div>
                        )}

                        {analysis.fluencyMetrics.repeatedWords && analysis.fluencyMetrics.repeatedWords.length > 0 && (
                          <div style={{
                            backgroundColor: analysis.fluencyMetrics.repeatedWords.length > 2 ? '#fee2e2' : '#f0fdf4',
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1px solid ${analysis.fluencyMetrics.repeatedWords.length > 2 ? '#fca5a5' : '#86efac'}`
                          }}>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: analysis.fluencyMetrics.repeatedWords.length > 2 ? '#dc2626' : '#16a34a' }}>
                              {analysis.fluencyMetrics.repeatedWords.length}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Repeated Words</div>
                            <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-tertiary)' }}>
                              {analysis.fluencyMetrics.repeatedWords.length > 2 ? 'Reduce repetition' : 'Minimal'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div style={{
                    backgroundColor: '#fffbeb',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    border: '1px solid #fcd34d'
                  }}>
                    <h4 style={{ color: '#b45309', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={16} /> AI Feedback
                    </h4>
                    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#78350f' }}>{analysis.feedback}</p>
                  </div>

                  {/* Improvements */}
                  <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <h4 style={{ color: '#1e40af', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={16} /> Improvements
                    </h4>
                    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#1e3a8a' }}>{analysis.corrections}</p>
                  </div>

                  {/* Suggested Answer */}
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0'
                  }}>
                    <h4 style={{ color: '#166534', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} /> Suggested Approach
                    </h4>
                    <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#14532d' }}>{analysis.betterAnswer}</p>
                  </div>

                  {/* How You Could Answer This - NEW */}
                  {analysis.improvedAnswer && (
                    <div style={{
                      backgroundColor: '#fefce8',
                      padding: '18px',
                      borderRadius: '8px',
                      marginTop: '15px',
                      border: '2px solid #facc15',
                      boxShadow: '0 2px 8px rgba(250, 204, 21, 0.1)'
                    }}>
                      <h4 style={{ color: '#854d0e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600' }}>
                        <MessageSquare size={18} /> How You Could Answer This
                      </h4>
                      <div style={{
                        backgroundColor: '#fffbeb',
                        padding: '14px',
                        borderRadius: '6px',
                        border: '1px solid #fde047'
                      }}>
                        <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#713f12', margin: 0, whiteSpace: 'pre-wrap' }}>
                          {analysis.improvedAnswer}
                        </p>
                      </div>
                      <div style={{
                        marginTop: '10px',
                        fontSize: '13px',
                        color: '#a16207',
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Sparkles size={14} />
                        {analysis.contentScore >= 4
                          ? 'This builds on your response with enhanced structure and technical depth.'
                          : 'Here\'s a strong example answer to guide your future responses.'}
                      </div>
                    </div>
                  )}

                  {/* Speech Analysis */}
                  {analysis.speechAnalysis && (
                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '15px',
                      borderRadius: '8px',
                      marginTop: '15px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Speech Analysis</h4>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Accuracy: {analysis.speechAnalysis.accuracy}%</span>
                        <span style={{ color: 'var(--text-tertiary)', marginLeft: '20px' }}>({analysis.speechAnalysis.correctWords}/{analysis.speechAnalysis.totalWords} words correct)</span>
                      </div>
                      {analysis.speechAnalysis.errors.length > 0 && (
                        <div>
                          <div style={{ color: '#dc2626', marginBottom: '10px' }}>Pronunciation Issues:</div>
                          {analysis.speechAnalysis.errors.slice(0, 5).map((error: any, index: number) => (
                            <div key={index} style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
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
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {/* Timer Section */}
              {timeLeft > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: timeLeft <= 10 ? '#dc2626' : '#16a34a',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    <Clock size={18} />
                    <span>Next in {timeLeft}s</span>
                  </div>

                  <button
                    onClick={isPaused ? resumeTimer : pauseTimer}
                    className="minimal-button-secondary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px'
                    }}
                  >
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                    {isPaused ? 'Resume' : 'Pause'}
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
                  className="minimal-button-primary"
                >
                  Next Question <ChevronRight size={18} />
                </button>

                <button
                  onClick={() => {
                    speechSynthesis.cancel();
                    stopTimer();
                    setAnalysis(null);
                    generateQuestion(interviewConfig || undefined);
                  }}
                  className="minimal-button-secondary"
                >
                  <RotateCcw size={18} /> Retry Question
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