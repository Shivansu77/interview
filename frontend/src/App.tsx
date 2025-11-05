import React, { useState } from 'react';
import InterviewRoom from './components/InterviewRoom';
import LearnSection from './components/LearnSection';
import EnglishPractice from './components/EnglishPractice';
import VocabularyChallenge from './components/VocabularyChallenge';
import './App.css';

function App() {
  const [currentSection, setCurrentSection] = useState<'home' | 'learn' | 'interview' | 'english' | 'vocabulary'>('home');
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [userId] = useState('demo-user-123');
  const [selectedCompany, setSelectedCompany] = useState('general');
  const [interviewType, setInterviewType] = useState('technical');
  const [isLoading, setIsLoading] = useState(false);

  const startInterview = async (type: string) => {
    try {
      setIsLoading(true);
      console.log('Starting interview with type:', type, 'company:', selectedCompany);
      setInterviewType(type);
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await fetch('http://localhost:5003/api/interview/start-session', {
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
      setCurrentSection('interview');
      setIsInterviewActive(true);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = () => {
    console.log('Ending interview...');
    
    // Stop all speech synthesis
    speechSynthesis.cancel();
    
    setIsInterviewActive(false);
    setSessionId('');
    setCurrentSection('home');
    
    // Clean up any media streams
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {});
  };

  return (
    <div className="App">
      <header className="App-header">
        {currentSection === 'home' && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto 30px'
          }}>
            <h1>AI Interview Platform</h1>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setCurrentSection('learn')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                📚 Learn & Practice
              </button>
              <button
                onClick={() => setCurrentSection('english')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                🗣️ English Practice
              </button>
              <button
                onClick={() => setCurrentSection('vocabulary')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                📚 Vocabulary
              </button>
            </div>
          </div>
        )}
        
        {(currentSection === 'learn' || currentSection === 'english' || currentSection === 'vocabulary') && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto 30px'
          }}>
            <h1>AI Interview Platform</h1>
            <button
              onClick={() => setCurrentSection('home')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ← Back to Home
            </button>
          </div>
        )}
        
        {currentSection === 'interview' && <h1>AI Interview Platform</h1>}
        
        {currentSection === 'learn' ? (
          <LearnSection userId={userId} />
        ) : currentSection === 'english' ? (
          <EnglishPractice onBack={() => setCurrentSection('home')} />
        ) : currentSection === 'vocabulary' ? (
          <VocabularyChallenge onBack={() => setCurrentSection('home')} />
        ) : isLoading ? (
          <div className="loading-screen" style={{
            textAlign: 'center',
            padding: '50px',
            color: '#4CAF50'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
            <h2>Preparing Your AI Interview...</h2>
            <div style={{ 
              width: '200px', 
              height: '4px', 
              backgroundColor: '#333', 
              borderRadius: '2px', 
              margin: '20px auto',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#4CAF50',
                animation: 'loading 1.5s ease-in-out infinite'
              }} />
            </div>
            <p>Setting up camera, microphone, and AI systems...</p>
            <style>{`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        ) : currentSection === 'home' && !isInterviewActive ? (
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
                  disabled={isLoading}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: isLoading ? '#666' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    width: '200px',
                    transition: 'all 0.3s ease',
                    transform: isLoading ? 'scale(0.95)' : 'scale(1)'
                  }}
                >
                  {isLoading ? '🔄 Starting...' : '🚀 Start Technical'}
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
                  disabled={isLoading}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    backgroundColor: isLoading ? '#666' : '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    width: '200px',
                    transition: 'all 0.3s ease',
                    transform: isLoading ? 'scale(0.95)' : 'scale(1)'
                  }}
                >
                  {isLoading ? '🔄 Starting...' : '💬 Start English'}
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
        ) : currentSection === 'interview' && isInterviewActive ? (
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
        ) : null}
      </header>
    </div>
  );
}

export default App;