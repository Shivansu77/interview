import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import InterviewRoom from '../components/InterviewRoom';
import Navbar from '../components/Navbar';
import AnimatedBlob from '../components/AnimatedBlob';
import InterviewModeSelector from '../components/InterviewModeSelector';

const InterviewPage: React.FC = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('general');
  const [interviewType, setInterviewType] = useState('technical');
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<any>(null);

  const startInterview = async (config: any) => {
    try {
      setIsLoading(true);
      setInterviewConfig(config);

      // Determine type based on config mode
      let type = 'technical';
      if (config.mode === 'cv') type = 'technical'; // CV interviews are technical by default
      else if (config.mode === 'role') type = 'technical';
      else if (config.mode === 'practice') type = 'technical';

      setInterviewType(type);

      const response = await fetch('http://localhost:5003/api/interview/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?.id,
          type,
          company: selectedCompany,
          difficulty: 'medium',
          interviewConfig: config
        })
      });

      const data = await response.json();
      setSessionId(data.sessionId);
      setIsInterviewActive(true);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setSessionId('');
    setInterviewConfig(null);
  };

  if (isInterviewActive) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px' }}>
        <InterviewRoom
          sessionId={sessionId}
          userId={user?.id || ''}
          interviewType={interviewType}
          company={selectedCompany}
          config={interviewConfig}
        />
        <button
          onClick={endInterview}
          className="space-button"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            borderRadius: '12px',
            fontWeight: '500',
            zIndex: 50,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕ End Mission
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Navbar />

      <div style={{
        textAlign: 'center',
        padding: '100px 20px 80px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>

        <h1 className="minimal-title" style={{ marginBottom: '20px' }}>
          AI Interview Practice
        </h1>
        <p className="minimal-subtitle" style={{ marginBottom: '40px' }}>
          Practice with AI-powered interviews tailored to your mission
        </p>

        <div className="bento-item" style={{ marginBottom: '40px', padding: '20px', maxWidth: '400px', margin: '0 auto 40px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            🎯 Target Mission
          </label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            <option value="general">🌐 General</option>
            <option value="google">🔍 Google</option>
            <option value="microsoft">🪟 Microsoft</option>
            <option value="amazon">📦 Amazon</option>
            <option value="meta">👥 Meta</option>
            <option value="apple">🍎 Apple</option>
            <option value="netflix">🎬 Netflix</option>
          </select>
        </div>

        <InterviewModeSelector onStartInterview={startInterview} />
      </div>
    </div>
  );
};

export default InterviewPage;