import React, { useState, useEffect, useRef } from 'react';

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
  const [currentAnswer, setCurrentAnswer] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [spokenLines, setSpokenLines] = useState<Set<number>>(new Set());
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchQuestions();
    startWebcam();
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [topic, field, level]);

  useEffect(() => {
    if (questions.length > 0 && !showAnswer) {
      fetchAnswer(questions[currentQuestionIndex].question);
    }
  }, [currentQuestionIndex, questions, showAnswer]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5002/api/learn/topic/${encodeURIComponent(topic)}/questions?level=${level}&field=${field}`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnswer = async (question: string) => {
    try {
      const response = await fetch('http://localhost:5002/api/learn/question/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, level, field, topic })
      });
      const data = await response.json();
      setCurrentAnswer(data.answer);
      setLines(data.lines || []);
      setShowAnswer(true);
      setSpokenLines(new Set());
      setCurrentLineIndex(0);
      setAccuracy(0);
    } catch (error) {
      console.error('Error fetching answer:', error);
    }
  };

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Process both final and interim results for real-time highlighting
        const fullTranscript = finalTranscript + interimTranscript;
        if (fullTranscript.trim()) {
          processSpokenText(fullTranscript.toLowerCase());
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

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

  const processSpokenText = (transcript: string) => {
    const spokenText = transcript.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Sequential line matching - line by line practice
    if (currentLineIndex < lines.length) {
      const currentLine = lines[currentLineIndex].text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const currentLineWords = currentLine.split(' ').filter(w => w.length > 2);
      const spokenWords = spokenText.split(' ').filter(w => w.length > 2);
      
      // Check if most words from current line are spoken
      let matchedWords = 0;
      currentLineWords.forEach(lineWord => {
        if (spokenWords.some(spokenWord => 
          spokenWord.includes(lineWord) || lineWord.includes(spokenWord) ||
          (lineWord.length > 3 && spokenWord.length > 3 && 
           (lineWord.substring(0, 4) === spokenWord.substring(0, 4)))
        )) {
          matchedWords++;
        }
      });
      
      const lineAccuracy = currentLineWords.length > 0 ? (matchedWords / currentLineWords.length) : 0;
      
      // If 70% of line words are matched, consider line complete
      if (lineAccuracy >= 0.7) {
        const newSpokenLines = new Set(spokenLines);
        newSpokenLines.add(currentLineIndex);
        setSpokenLines(newSpokenLines);
        setCurrentLineIndex(prev => prev + 1);
        
        const newAccuracy = ((currentLineIndex + 1) / lines.length) * 100;
        setAccuracy(newAccuracy);
        
        // Auto-complete if all lines spoken
        if (currentLineIndex + 1 >= lines.length) {
          setTimeout(() => completeQuestion(), 1500);
        }
      }
    }
  };

  const completeQuestion = async () => {
    stopRecording();
    
    // Update progress
    try {
      await fetch('http://localhost:5002/api/learn/progress/update', {
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
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowAnswer(false);
      }, 2000);
    } else {
      // All questions completed
      setTimeout(() => {
        alert('🎉 Congratulations! You completed all questions for this topic!');
        onBack();
      }, 2000);
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
          <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>Question:</h3>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'white' }}>
            {currentQuestion.question}
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
        
        {/* Controls */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: isRecording ? '#f44336' : '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '20px',
              boxShadow: isRecording ? '0 0 20px rgba(244, 67, 54, 0.5)' : '0 0 20px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {isRecording ? '🛑 Stop Practice' : '🎤 Start Speaking'}
          </button>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={resetQuestion}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 Reset
            </button>
            
            {currentLineIndex >= lines.length && (
              <button
                onClick={completeQuestion}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  animation: 'pulse 1s infinite'
                }}
              >
                🎉 Perfect! Next Question
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
        <h3 style={{ color: '#FF9800', marginBottom: '20px' }}>
          📜 Practice Script
        </h3>
        
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
        
        {isRecording && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderRadius: '8px',
            border: '2px solid #f44336',
            textAlign: 'center'
          }}>
            <div style={{ color: '#f44336', fontWeight: 'bold', fontSize: '16px' }}>
              🔴 RECORDING - Read the script aloud
            </div>
            <div style={{ fontSize: '14px', color: '#ccc', marginTop: '8px' }}>
              🎯 Current line: <span style={{color: '#FF9800', fontWeight: 'bold'}}>ORANGE</span> | Completed: <span style={{color: '#4CAF50', fontWeight: 'bold'}}>GREEN</span>
            </div>
            <div style={{ fontSize: '12px', color: '#FF9800', marginTop: '5px' }}>
              💡 Read each line completely before moving to the next!
            </div>
            <style>{`
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechPractice;