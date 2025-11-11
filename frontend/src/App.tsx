import React, { useState } from 'react';
import InterviewRoom from './components/InterviewRoom';
import LearnSection from './components/LearnSection';
import EnglishPractice from './components/EnglishPractice';
import VocabularyChallenge from './components/VocabularyChallenge';
import CharacterChat from './components/CharacterChat';
import MLComponent from './components/MLComponent';

import './App.css';

function App() {
  const [currentSection, setCurrentSection] = useState<'home' | 'learn' | 'interview' | 'english' | 'vocabulary' | 'character-chat' | 'ml'>('home');
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
            margin: '0 auto 40px',
            padding: '0 20px'
          }}>
            <h1>AI Interview Platform</h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => setCurrentSection('learn')} className="nav-button">
                <span className="icon">📚</span> Learn & Practice
              </button>
              <button onClick={() => setCurrentSection('english')} className="nav-button">
                <span className="icon">🎤</span> English Practice
              </button>
              <button onClick={() => setCurrentSection('vocabulary')} className="nav-button">
                <span className="icon">📖</span> Vocabulary
              </button>
              <button onClick={() => setCurrentSection('character-chat')} className="nav-button">
                <span className="icon">🎭</span> Character Chat
              </button>

            </div>
          </div>
        )}
        
        {(currentSection === 'learn' || currentSection === 'english' || currentSection === 'vocabulary' || currentSection === 'character-chat') && (
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
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span className="icon">←</span> Back to Home
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
        ) : currentSection === 'character-chat' ? (
          <CharacterChat />

        ) : isLoading ? (
          <div className="loading-screen" style={{
            textAlign: 'center',
            padding: '50px',
            color: '#4CAF50'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', color: '#7877c6' }}>🤖</div>
            <h2>Preparing Your AI Interview...</h2>
            <div className="loading-bar">
              <div className="loading-progress" />
            </div>
            <p>Setting up camera, microphone, and AI systems...</p>

          </div>
        ) : currentSection === 'home' && !isInterviewActive ? (
          <div className="modern-home">
            <div className="hero-section">
              <h2>Master Your Interview Skills</h2>
              <p>AI-powered practice with real-time feedback and personalized coaching</p>
            </div>
            
            <div className="features-grid">
              <div className="feature-card" onClick={() => setCurrentSection('learn')}>
                <div className="feature-icon">📚</div>
                <h3>Learn & Practice</h3>
                <p>Structured learning paths for technical skills</p>
                <div className="feature-badge">Popular</div>
              </div>
              
              <div className="feature-card" onClick={() => setCurrentSection('vocabulary')}>
                <div className="feature-icon">📖</div>
                <h3>Vocabulary Builder</h3>
                <p>Expand your professional vocabulary</p>
              </div>
              
              <div className="feature-card" onClick={() => setCurrentSection('english')}>
                <div className="feature-icon">🎤</div>
                <h3>English Practice</h3>
                <p>Improve pronunciation and fluency</p>
              </div>
              
              <div className="feature-card" onClick={() => setCurrentSection('character-chat')}>
                <div className="feature-icon">🎭</div>
                <h3>Character Chat</h3>
                <p>Practice conversations with AI characters</p>
                <div className="feature-badge new">New</div>
              </div>
            </div>
            
            <div className="interview-section">
              <h3>Start Your Interview Practice</h3>
              <div className="interview-cards">
                <div className="interview-card primary">
                  <div className="card-header">
                    <span className="card-icon">💻</span>
                    <h4>Technical Interview</h4>
                  </div>
                  <p>Programming, algorithms, and system design questions</p>
                  <button 
                    onClick={() => startInterview('technical')}
                    disabled={isLoading}
                    className="interview-btn primary"
                  >
                    {isLoading ? 'Starting...' : 'Start Technical'}
                  </button>
                </div>
                
                <div className="interview-card secondary">
                  <div className="card-header">
                    <span className="card-icon">💬</span>
                    <h4>English Interview</h4>
                  </div>
                  <p>Communication skills and behavioral questions</p>
                  <button 
                    onClick={() => startInterview('english')}
                    disabled={isLoading}
                    className="interview-btn secondary"
                  >
                    {isLoading ? 'Starting...' : 'Start English'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="company-section">
              <label className="company-label">
                <span className="label-icon">🏢</span>
                Target Company
              </label>
              <select 
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="company-select"
              >
                <option value="general">🌐 General Questions</option>
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