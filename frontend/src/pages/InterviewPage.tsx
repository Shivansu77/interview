import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InterviewRoom from '../components/InterviewRoom';
import Navbar from '../components/Navbar';

const InterviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      <div style={{ backgroundColor: '#000', minHeight: '100vh', padding: '20px' }}>
        <InterviewRoom sessionId={sessionId} userId={user?.id || ''} interviewType={interviewType} company={selectedCompany} />
        <button 
          onClick={endInterview}
          style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            padding: '12px 24px', 
            backgroundColor: '#fff', 
            color: '#000', 
            borderRadius: '8px', 
            fontWeight: '600', 
            zIndex: 50, 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          ✕ End Interview
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <Navbar />
      
      <div style={{
        textAlign: 'center',
        padding: '80px 20px 60px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Interview Practice
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#ccc',
          marginBottom: '40px',
          lineHeight: '1.5'
        }}>
          Choose your interview type and target company
        </p>
        
        <div style={{ marginBottom: '40px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '18px', color: '#fff' }}>Target Company:</label>
          <select 
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            style={{ 
              padding: '12px 16px', 
              backgroundColor: '#000', 
              color: '#fff', 
              border: '1px solid #333', 
              borderRadius: '8px', 
              fontSize: '16px' 
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

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button 
            onClick={() => startInterview('technical')}
            disabled={isLoading}
            style={{ 
              padding: '20px 40px', 
              backgroundColor: '#fff', 
              color: '#000', 
              borderRadius: '12px', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '18px', 
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
            }}
          >
            💻 Technical Interview
          </button>
          <button 
            onClick={() => startInterview('english')}
            disabled={isLoading}
            style={{ 
              padding: '20px 40px', 
              backgroundColor: 'transparent', 
              color: '#fff', 
              border: '1px solid #fff', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontSize: '18px', 
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#fff';
            }}
          >
            💬 English Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;