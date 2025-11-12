import React, { useState } from 'react';
import InterviewRoom from './components/InterviewRoom';
import LearnSection from './components/LearnSection';
import EnglishPractice from './components/EnglishPractice';
import VocabularyChallenge from './components/VocabularyChallenge';
import CharacterChat from './components/CharacterChat';

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
    speechSynthesis.cancel();
    setIsInterviewActive(false);
    setSessionId('');
    setCurrentSection('home');
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {});
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={currentSection === 'home' ? { backgroundColor: '#ffffff' } : { background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', minHeight: '100vh' }}>
        
        {(currentSection === 'learn' || currentSection === 'english' || currentSection === 'vocabulary' || currentSection === 'character-chat') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>AI Interview Platform</h1>
            <button
              onClick={() => setCurrentSection('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <span>←</span> Back to Home
            </button>
          </div>
        )}
        
        {currentSection === 'interview' && (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>AI Interview Platform</h1>
          </div>
        )}
        
        {currentSection === 'learn' ? (
          <LearnSection userId={userId} />
        ) : currentSection === 'english' ? (
          <EnglishPractice onBack={() => setCurrentSection('home')} />
        ) : currentSection === 'vocabulary' ? (
          <VocabularyChallenge onBack={() => setCurrentSection('home')} />
        ) : currentSection === 'character-chat' ? (
          <CharacterChat />
        ) : isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', margin: '40px', padding: '64px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', color: '#7c3aed' }}>🤖</div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Preparing Your AI Interview...</h2>
            <div style={{ width: '320px', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #7c3aed)', animation: 'pulse 2s infinite' }} />
            </div>
            <p style={{ color: '#6b7280' }}>Setting up camera, microphone, and AI systems...</p>
          </div>
        ) : currentSection === 'home' && !isInterviewActive ? (
          <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
            {/* Navigation Header */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>🤖</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>InterviewAI</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '8px 16px', color: '#6b7280', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCurrentSection('learn')}>Practice</button>
                <button style={{ padding: '8px 16px', color: '#6b7280', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCurrentSection('english')}>English</button>
                <button style={{ padding: '8px 16px', color: '#6b7280', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCurrentSection('vocabulary')}>Vocabulary</button>
                <button style={{ padding: '8px 16px', color: '#6b7280', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setCurrentSection('character-chat')}>Chat</button>
              </div>
            </nav>

            {/* Hero Section */}
            <div style={{ padding: '80px 32px', textAlign: 'center', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: 'white' }}>
              <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.02em' }}>
                  Master Your <span style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interview Skills</span>
                </h1>
                <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'rgba(219, 234, 254, 0.9)', marginBottom: '48px', fontWeight: '400', maxWidth: '512px', margin: '0 auto 48px' }}>
                  AI-powered interview practice with real-time feedback, personalized coaching, and comprehensive skill development
                </p>
                
                {/* Quick Start Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', marginBottom: '32px', alignItems: 'center' }}>
                  <button 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 32px', backgroundColor: '#111827', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', minWidth: '256px', fontSize: '16px', fontWeight: '600', transition: 'all 0.2s' }}
                    onClick={() => startInterview('technical')}
                    disabled={isLoading}
                  >
                    <span style={{ fontSize: '20px' }}>💻</span>
                    {isLoading ? 'Starting...' : 'Start Technical Interview'}
                  </button>
                  <button 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px 32px', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px', cursor: 'pointer', minWidth: '256px', fontSize: '16px', fontWeight: '600', transition: 'all 0.2s' }}
                    onClick={() => startInterview('english')}
                    disabled={isLoading}
                  >
                    <span style={{ fontSize: '20px' }}>💬</span>
                    {isLoading ? 'Starting...' : 'Start English Interview'}
                  </button>
                </div>

                {/* Company Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <span style={{ color: 'rgba(219, 234, 254, 0.9)', fontWeight: '500' }}>Target Company:</span>
                  <select 
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    style={{ padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', backdropFilter: 'blur(8px)', minWidth: '160px', fontSize: '14px' }}
                  >
                    <option value="general" style={{ color: '#111827' }}>🌐 General</option>
                    <option value="google" style={{ color: '#111827' }}>🔍 Google</option>
                    <option value="microsoft" style={{ color: '#111827' }}>🪟 Microsoft</option>
                    <option value="amazon" style={{ color: '#111827' }}>📦 Amazon</option>
                    <option value="meta" style={{ color: '#111827' }}>👥 Meta</option>
                    <option value="apple" style={{ color: '#111827' }}>🍎 Apple</option>
                    <option value="netflix" style={{ color: '#111827' }}>🎬 Netflix</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div style={{ padding: '80px 32px', backgroundColor: '#ffffff' }}>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', color: '#111827', marginBottom: '48px' }}>Everything you need to succeed</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }} onClick={() => setCurrentSection('learn')}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Learn & Practice</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>Structured learning paths with hands-on coding challenges</p>
                  <span style={{ color: '#9ca3af', fontSize: '18px' }}>→</span>
                </div>
                
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }} onClick={() => setCurrentSection('english')}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎤</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Speech Training</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>Improve pronunciation and communication skills</p>
                  <span style={{ color: '#9ca3af', fontSize: '18px' }}>→</span>
                </div>
                
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }} onClick={() => setCurrentSection('vocabulary')}>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📖</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Vocabulary Builder</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>Expand your professional and technical vocabulary</p>
                  <span style={{ color: '#9ca3af', fontSize: '18px' }}>→</span>
                </div>
                
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', position: 'relative' }} onClick={() => setCurrentSection('character-chat')}>
                  <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#10b981', color: 'white', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>New</span>
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎭</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>AI Characters</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.5', marginBottom: '16px' }}>Practice with realistic interview scenarios</p>
                  <span style={{ color: '#9ca3af', fontSize: '18px' }}>→</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div style={{ padding: '64px 32px', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>10K+</div>
                  <div style={{ color: '#6b7280', fontWeight: '500' }}>Practice Sessions</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>95%</div>
                  <div style={{ color: '#6b7280', fontWeight: '500' }}>Success Rate</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>500+</div>
                  <div style={{ color: '#6b7280', fontWeight: '500' }}>Questions</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>24/7</div>
                  <div style={{ color: '#6b7280', fontWeight: '500' }}>AI Support</div>
                </div>
              </div>
            </div>
          </div>
        ) : currentSection === 'interview' && isInterviewActive ? (
          <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', minHeight: '100vh', padding: '20px' }}>
            <InterviewRoom sessionId={sessionId} userId={userId} interviewType={interviewType} company={selectedCompany} />
            <button 
              onClick={endInterview}
              style={{ position: 'fixed', top: '20px', right: '20px', padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '600', zIndex: 50, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              ✕ End Interview
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;