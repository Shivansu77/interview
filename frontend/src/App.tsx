import React, { useState } from 'react';
import InterviewRoom from './components/InterviewRoom';
import './App.css';

function App() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [userId] = useState('demo-user-123');

  const startInterview = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/interview/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          type: 'technical', 
          difficulty: 'medium' 
        })
      });
      const data = await response.json();
      setSessionId(data.sessionId);
      setIsInterviewActive(true);
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setSessionId('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Interview Platform</h1>
        
        {!isInterviewActive ? (
          <div className="start-screen">
            <h2>Ready for your AI-powered interview?</h2>
            <p>Practice technical interviews with real-time feedback on:</p>
            <ul>
              <li>✅ Eye contact monitoring</li>
              <li>✅ Speech fluency analysis</li>
              <li>✅ AI-generated questions</li>
              <li>✅ Voice interaction</li>
            </ul>
            <button 
              onClick={startInterview}
              className="start-btn"
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="interview-container">
            <InterviewRoom sessionId={sessionId} userId={userId} />
            <button 
              onClick={endInterview}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              End Interview
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;