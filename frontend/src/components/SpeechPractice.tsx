import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechPracticeProps {
  topic: string;
  field: 'webdev' | 'datascience' | 'ml' | 'behavioral';
  level: 'beginner' | 'intermediate' | 'advanced';
  userId: string;
  onBack: () => void;
}

interface Question {
  id: string;
  question: string;
  completed: boolean;
}

interface Line {
  id: number;
  text: string;
  spoken: boolean;
}

const SpeechPractice: React.FC<SpeechPracticeProps> = ({ 
  topic, 
  field, 
  level, 
  userId, 
  onBack 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedCompany, setSelectedCompany] = useState('google');

  const [isRecording, setIsRecording] = useState(false);
  const [spokenLines, setSpokenLines] = useState<Set<number>>(new Set());
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [suggestedAnswer, setSuggestedAnswer] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setShowAnswer(false);
      setCurrentQuestionIndex(0);
      const response = await fetch(`http://localhost:5003/api/learn/topic/${encodeURIComponent(topic)}/questions?level=${level}&field=${field}&company=${selectedCompany}`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [topic, field, level, selectedCompany]);

  const fetchAnswer = useCallback(async (question: string) => {
    try {
      setIsLoadingAnswer(true);
      const response = await fetch('http://localhost:5003/api/learn/question/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, level, field, topic, company: selectedCompany })
      });
      const data = await response.json();

      setLines(data.lines || []);
      setSuggestedAnswer(data.answer || '');
      setShowAnswer(true);
      setSpokenLines(new Set());
      setCurrentLineIndex(0);
      setAccuracy(0);
    } catch (error) {
      console.error('Error fetching answer:', error);
    } finally {
      setIsLoadingAnswer(false);
    }
  }, [level, field, topic, selectedCompany]);

  useEffect(() => {
    fetchQuestions();
    startWebcam();
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, field, level, selectedCompany, fetchQuestions]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setShowAnswer(false);
      setIsLoadingAnswer(true);
      const timer = setTimeout(() => {
        fetchAnswer(questions[currentQuestionIndex].question);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [questions, currentQuestionIndex, fetchAnswer]);


  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };
  
  const handleNextLine = () => {
    if (currentLineIndex < lines.length) {
      const newSpokenLines = new Set(spokenLines);
      newSpokenLines.add(currentLineIndex);
      setSpokenLines(newSpokenLines);
      setCurrentLineIndex(prev => prev + 1);
      
      const newAccuracy = ((currentLineIndex + 1) / lines.length) * 100;
      setAccuracy(newAccuracy);
      
      // Complete if all lines done
      if (currentLineIndex + 1 >= lines.length) {
        setTimeout(() => completeQuestion(), 500);
      }
    }
  };

  const completeQuestion = async () => {
    stopRecording();
    
    // Update progress
    try {
      await fetch('http://localhost:5003/api/learn/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          questionId: questions[currentQuestionIndex].id,
          completed: true,
          accuracy
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setShowAnswer(false);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1000);
    } else {
      // All questions completed
      setTimeout(() => {
        alert('🎉 Congratulations! You completed all questions for this topic!');
        onBack();
      }, 1000);
    }
  };

  const resetQuestion = () => {
    setSpokenLines(new Set());
    setCurrentLineIndex(0);
    setAccuracy(0);
    stopRecording();
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
        <h3>Loading practice questions...</h3>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <h3>No questions available for this topic</h3>
        <button onClick={onBack} style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}>
          Back to Roadmap
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="speech-practice" style={{
      display: 'grid',
      gridTemplateColumns: '350px 1fr',
      gap: '20px',
      minHeight: '70vh',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 20px'
    }}>
      {/* Left Panel - Question & Controls */}
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        padding: '20px',
        height: 'fit-content'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#4CAF50', marginBottom: '10px' }}>
            📝 {topic}
          </h2>
          
          {/* Company Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              🏢 Company Focus:
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: '2px solid #4CAF50',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="google">🔍 Google</option>
              <option value="microsoft">🪟 Microsoft</option>
              <option value="amazon">📦 Amazon</option>
              <option value="meta">👥 Meta (Facebook)</option>
              <option value="apple">🍎 Apple</option>
              <option value="netflix">🎬 Netflix</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ color: '#ccc' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span style={{
              backgroundColor: currentLineIndex >= lines.length ? '#4CAF50' : '#FF9800',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {currentLineIndex}/{lines.length} Lines
            </span>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1a1a1a',
          padding: '25px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '2px solid #4CAF50'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: '#4CAF50', margin: 0 }}>Interview Question:</h3>
            <span style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              marginLeft: '10px',
              textTransform: 'capitalize'
            }}>
              {selectedCompany}
            </span>
          </div>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'white' }}>
            {isLoadingAnswer ? 'Loading question...' : (currentQuestion?.question || 'Loading...')}
          </p>
        </div>

        {/* Webcam Mirror */}
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>📹 Practice Mirror</h4>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="280"
            height="210"
            style={{
              borderRadius: '8px',
              border: '2px solid #4CAF50',
              transform: 'scaleX(-1)',
              backgroundColor: '#000'
            }}
          />
        </div>
        
        {/* AI Analysis & Progress */}
        {currentLineIndex > 0 && (
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #4CAF50'
          }}>
            <h4 style={{ color: '#4CAF50', marginBottom: '15px' }}>🤖 AI Analysis</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                backgroundColor: '#2a2a2a',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#4CAF50', fontSize: '24px', fontWeight: 'bold' }}>
                  {Math.round(accuracy)}%
                </div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>Progress</div>
              </div>
              <div style={{
                backgroundColor: '#2a2a2a',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#FF9800', fontSize: '24px', fontWeight: 'bold' }}>
                  {currentLineIndex}
                </div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>Lines Read</div>
              </div>
            </div>
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#ccc'
            }}>
              💡 {currentLineIndex >= lines.length ? 'Excellent! You completed all lines.' : `Keep going! ${lines.length - currentLineIndex} lines remaining.`}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={resetQuestion}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Reset
            </button>
            
            {currentLineIndex < lines.length ? (
              <button
                onClick={handleNextLine}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  flex: '1'
                }}
              >
                ➡️ Next Line
              </button>
            ) : (
              <button
                onClick={completeQuestion}
                style={{
                  padding: '15px 30px',
                  backgroundImage: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  animation: 'pulse 2s infinite',
                  flex: '1'
                }}
              >
                🎉 Ready for Next Question!
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Answer Script */}
      <div style={{
        flex: '1',
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        padding: '25px',
        maxHeight: '70vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#FF9800', margin: 0 }}>
            📜 Practice Script
          </h3>
          {suggestedAnswer && (
            <button
              onClick={() => {
                const answerWindow = window.open('', '_blank', 'width=600,height=400');
                answerWindow?.document.write(`
                  <html>
                    <head><title>Suggested Answer</title></head>
                    <body style="font-family: Arial; padding: 20px; background: #1a1a1a; color: white;">
                      <h2 style="color: #4CAF50;">💡 Suggested Answer</h2>
                      <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; line-height: 1.6;">
                        ${suggestedAnswer.replace(/\n/g, '<br>')}
                      </div>
                    </body>
                  </html>
                `);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💡 View Answer
            </button>
          )}
        </div>
        
        {showAnswer ? (
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '25px',
            borderRadius: '10px',
            fontSize: '18px',
            lineHeight: '2.2',
            flex: '1',
            overflowY: 'auto',
            border: '2px solid #444'
          }}>
            {lines.map((line, index) => {
              const isSpoken = spokenLines.has(index);
              const isCurrent = index === currentLineIndex;
              const isNext = index > currentLineIndex;
              
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: isSpoken ? 'rgba(76, 175, 80, 0.2)' : isCurrent ? 'rgba(255, 152, 0, 0.2)' : 'transparent',
                    color: isSpoken ? '#4CAF50' : isCurrent ? '#FF9800' : isNext ? '#666' : '#bbb',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    margin: '0 0 15px 0',
                    display: 'block',
                    transition: 'all 0.4s ease',
                    fontWeight: isSpoken || isCurrent ? 'bold' : 'normal',
                    border: isSpoken ? '2px solid #4CAF50' : isCurrent ? '2px solid #FF9800' : '2px solid #444',
                    boxShadow: isSpoken ? '0 4px 15px rgba(76, 175, 80, 0.3)' : isCurrent ? '0 4px 15px rgba(255, 152, 0, 0.3)' : 'none',
                    fontSize: isCurrent ? '20px' : '18px',
                    lineHeight: '1.6',
                    animation: isCurrent ? 'pulse 2s infinite' : 'none',
                    position: 'relative'
                  }}
                >
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      left: '-10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#FF9800',
                      fontSize: '24px'
                    }}>
                      ▶️
                    </div>
                  )}
                  {isSpoken && (
                    <div style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      color: '#4CAF50',
                      fontSize: '20px'
                    }}>
                      ✓
                    </div>
                  )}
                  {line.text}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '50px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <p>Loading practice script...</p>
          </div>
        )}
        
        {/* Interactive Status Bar */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: isRecording ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
          borderRadius: '12px',
          border: `2px solid ${isRecording ? '#f44336' : '#4CAF50'}`,
          textAlign: 'center'
        }}>
          <div style={{ 
            color: isRecording ? '#f44336' : '#4CAF50', 
            fontWeight: 'bold', 
            fontSize: '16px',
            marginBottom: '8px'
          }}>
            {isRecording ? '🔴 RECORDING' : '⏸️ READY'} - {currentLineIndex >= lines.length ? 'All lines completed!' : 'Read the highlighted line'}
          </div>
          
          {currentLineIndex < lines.length && (
            <div style={{
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              margin: '10px 0',
              border: '1px solid #FF9800'
            }}>
              <div style={{ color: '#FF9800', fontWeight: 'bold', fontSize: '14px' }}>
                📍 Current Line {currentLineIndex + 1} of {lines.length}
              </div>
              <div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px' }}>
                💡 Read aloud, then click "Next Line" to continue
              </div>
            </div>
          )}
          
          {currentLineIndex >= lines.length && (
            <div style={{
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              padding: '15px',
              borderRadius: '8px',
              margin: '10px 0',
              border: '2px solid #4CAF50'
            }}>
              <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '16px' }}>
                🎉 Perfect! All lines completed!
              </div>
              <div style={{ fontSize: '14px', color: '#ccc', marginTop: '5px' }}>
                Click "Ready for Next Question" to continue your learning journey
              </div>
            </div>
          )}
          
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default SpeechPractice;