import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import InterviewRoom from '../components/InterviewRoom';
import Navbar from '../components/Navbar';
import AnimatedBlob from '../components/AnimatedBlob';

const InterviewPage: React.FC = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('general');
  const [interviewType, setInterviewType] = useState('technical');
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  const startInterview = async (type: string) => {
    try {
      setIsLoading(true);
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
          difficulty: 'medium'
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
  };

  if (isInterviewActive) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px' }}>
        <InterviewRoom sessionId={sessionId} userId={user?.id || ''} interviewType={interviewType} company={selectedCompany} />
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          maxWidth: '950px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => startInterview('general')}
            disabled={isLoading}
            className="bento-item"
            style={{
              padding: '30px',
              textAlign: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '40px' }}>🌐</div>
            <div style={{ fontSize: '19px', fontWeight: '600', color: 'var(--text-primary)' }}>General Interview</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Behavioral & soft skills questions
            </div>
          </button>

          <button
            onClick={() => startInterview('technical')}
            disabled={isLoading}
            className="bento-item"
            style={{
              padding: '30px',
              textAlign: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '40px' }}>💻</div>
            <div style={{ fontSize: '19px', fontWeight: '600', color: 'var(--text-primary)' }}>Technical Interview</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Coding & system design challenges
            </div>
          </button>

          <button
            onClick={() => startInterview('english')}
            disabled={isLoading}
            className="bento-item"
            style={{
              padding: '30px',
              textAlign: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-primary)',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '40px' }}>💬</div>
            <div style={{ fontSize: '19px', fontWeight: '600', color: 'var(--text-primary)' }}>English Interview</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Communication & language skills
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;