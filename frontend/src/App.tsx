import React, { useState } from 'react';
import InterviewRoom from './components/InterviewRoom';
import './App.css';

function App() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [userId] = useState('demo-user-123');
  const [selectedCompany, setSelectedCompany] = useState('general');
  const [interviewType, setInterviewType] = useState('technical');

  const startInterview = async (type: string) => {
    try {
      console.log('Starting interview with type:', type, 'company:', selectedCompany);
      setInterviewType(type);
      const response = await fetch('http://localhost:5001/api/interview/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          type, 
          company: selectedCompany,
          difficulty: 'medium' 
        })
      });
      const data = await response.json();
      console.log('Session started:', data);
      setSessionId(data.sessionId);
      setIsInterviewActive(true);
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const endInterview = () => {
    console.log('Ending interview...');
    
    // Stop all speech synthesis
    speechSynthesis.cancel();
    
    setIsInterviewActive(false);
    setSessionId('');
    
    // Clean up any media streams
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {});
    
    window.location.reload();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Interview Platform</h1>
        
        {!isInterviewActive ? (
          <div className="start-screen">
            <h2>Ready for your AI-powered interview?</h2>
            <p>Practice interviews with real-time feedback on:</p>
            <ul>
              <li>✅ Eye contact monitoring</li>
              <li>✅ Speech fluency analysis</li>
              <li>✅ AI-generated questions</li>
              <li>✅ Voice interaction</li>
            </ul>
            
            <div style={{ margin: '30px 0', display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>🔧 Technical Interview</h3>
                <p style={{ fontSize: '14px', marginBottom: '15px' }}>Programming, algorithms, system design</p>
                <button 
                  onClick={() => startInterview('technical')}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '200px'
                  }}
                >
                  Start Technical
                </button>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#2196F3', marginBottom: '15px' }}>💬 English Interview</h3>
                <p style={{ fontSize: '14px', marginBottom: '15px' }}>Communication, behavioral questions</p>
                <button 
                  onClick={() => {
                    console.log('English button clicked');
                    startInterview('english');
                  }}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    width: '200px'
                  }}
                >
                  Start English
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <label style={{ color: '#FF9800', fontSize: '16px', fontWeight: 'bold' }}>Company Focus:</label>
              <select 
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                style={{
                  marginLeft: '10px',
                  padding: '8px 15px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '2px solid #FF9800',
                  backgroundColor: '#2a2a2a',
                  color: 'white'
                }}
              >
                <option value="general">General Questions</option>
                <option value="google">Google</option>
                <option value="microsoft">Microsoft</option>
                <option value="amazon">Amazon</option>
                <option value="meta">Meta (Facebook)</option>
                <option value="apple">Apple</option>
                <option value="netflix">Netflix</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="interview-container">
            <InterviewRoom sessionId={sessionId} userId={userId} interviewType={interviewType} company={selectedCompany} />
            <button 
              onClick={endInterview}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 24px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              ✕ End Interview
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;