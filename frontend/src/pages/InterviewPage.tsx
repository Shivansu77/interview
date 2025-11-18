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
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Blob Backgrounds - Enhanced */}
      <AnimatedBlob 
        position="top-left" 
        color="#667eea" 
        size={550} 
        delay={0} 
        opacity={0.22} 
        duration={28} 
        animationType="liquid" 
        blur={90} 
        enableGlow={true} 
      />
      <AnimatedBlob 
        position="top-right" 
        color="#764ba2" 
        size={500} 
        delay={3} 
        opacity={0.18} 
        duration={32} 
        animationType="wave" 
        blur={85} 
        enableGlow={true} 
      />
      <AnimatedBlob 
        position="bottom-left" 
        color="#f093fb" 
        size={480} 
        delay={6} 
        opacity={0.16} 
        duration={30} 
        animationType="elastic" 
        blur={75} 
      />
      <AnimatedBlob 
        position="bottom-right" 
        color="#4facfe" 
        size={600} 
        delay={2} 
        opacity={0.2} 
        duration={25} 
        animationType="pulse" 
        blur={95} 
        enableGlow={true} 
      />
      <AnimatedBlob 
        position="center" 
        color="#43e97b" 
        size={420} 
        delay={8} 
        opacity={0.14} 
        duration={35} 
        animationType="breathe" 
        blur={70} 
      />
      
      <Navbar />
      
      <div style={{
        textAlign: 'center',
        padding: '100px 20px 80px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>

        <h1 className="space-title" style={{
          fontSize: '48px',
          fontWeight: '300',
          marginBottom: '20px',
          lineHeight: '1.2',
          letterSpacing: '1px'
        }}>
          🚀 AI Interview Practice
        </h1>
        <p className="space-text-muted" style={{
          fontSize: '18px',
          marginBottom: '40px',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Practice with AI-powered interviews tailored to your mission
        </p>
        
        <div className="space-card" style={{ marginBottom: '40px', padding: '20px', maxWidth: '400px', margin: '0 auto 40px' }}>
          <label className="space-text" style={{ 
            display: 'block', 
            marginBottom: '12px', 
            fontSize: '16px', 
            fontWeight: '500'
          }}>
            🎯 Target Mission
          </label>
          <select 
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            style={{ 
              padding: '16px 20px', 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              color: '#fff', 
              border: '2px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '12px', 
              fontSize: '17px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
              minWidth: '280px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
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
            style={{ 
              padding: '35px 25px', 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              color: '#fff', 
              border: '2px solid rgba(102, 126, 234, 0.3)', 
              borderRadius: '16px', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              fontSize: '17px', 
              fontWeight: '600',
              transition: 'all 0.3s',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.6)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.2)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.1)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌐</div>
            <div style={{ fontSize: '19px', marginBottom: '8px' }}>General Interview</div>
            <div style={{ fontSize: '13px', color: '#aaa', marginTop: '8px', lineHeight: '1.4' }}>
              Behavioral & soft skills questions
            </div>
          </button>
          
          <button 
            onClick={() => startInterview('technical')}
            disabled={isLoading}
            style={{ 
              padding: '35px 25px', 
              background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
              color: '#fff', 
              border: '2px solid rgba(79, 172, 254, 0.4)', 
              borderRadius: '16px', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              fontSize: '17px', 
              fontWeight: '600',
              transition: 'all 0.3s',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.7)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.25) 0%, rgba(0, 242, 254, 0.25) 100%)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(79, 172, 254, 0.25)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.4)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(79, 172, 254, 0.15)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💻</div>
            <div style={{ fontSize: '19px', marginBottom: '8px' }}>Technical Interview</div>
            <div style={{ fontSize: '13px', color: '#aaa', marginTop: '8px', lineHeight: '1.4' }}>
              Coding & system design challenges
            </div>
          </button>
          
          <button 
            onClick={() => startInterview('english')}
            disabled={isLoading}
            style={{ 
              padding: '35px 25px', 
              background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
              color: '#fff', 
              border: '2px solid rgba(240, 147, 251, 0.3)', 
              borderRadius: '16px', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              fontSize: '17px', 
              fontWeight: '600',
              transition: 'all 0.3s',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.borderColor = 'rgba(240, 147, 251, 0.6)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(240, 147, 251, 0.2)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(240, 147, 251, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(240, 147, 251, 0.1)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <div style={{ fontSize: '19px', marginBottom: '8px' }}>English Interview</div>
            <div style={{ fontSize: '13px', color: '#aaa', marginTop: '8px', lineHeight: '1.4' }}>
              Communication & language skills
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;