import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const tryFeature = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 50px',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          InterviewAI
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => openAuth('login')}
            style={{
              background: 'transparent',
              border: '1px solid #fff',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
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
            Log in
          </button>
          <button
            onClick={() => openAuth('register')}
            style={{
              background: '#fff',
              border: 'none',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
            }}
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '100px 20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Master Your Interview Skills with AI
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#ccc',
          marginBottom: '40px',
          lineHeight: '1.5'
        }}>
          Practice interviews, improve pronunciation, and get real-time feedback 
          powered by advanced AI technology.
        </p>
        <button
          onClick={tryFeature}
          style={{
            background: '#fff',
            border: 'none',
            color: '#000',
            padding: '15px 30px',
            fontSize: '18px',
            borderRadius: '8px',
            cursor: 'pointer',
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
          Try InterviewAI
        </button>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        padding: '50px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {[
          {
            icon: '🤖',
            title: 'AI-Powered Questions',
            description: 'Get personalized interview questions based on your target company and role'
          },
          {
            icon: '🎤',
            title: 'Voice Analysis',
            description: 'Real-time speech analysis with pronunciation and fluency feedback'
          },
          {
            icon: '👁️',
            title: 'Eye Contact Tracking',
            description: 'Monitor your eye contact and body language during practice sessions'
          },
          {
            icon: '📊',
            title: 'Performance Analytics',
            description: 'Detailed insights and improvement suggestions after each session'
          },
          {
            icon: '📚',
            title: 'Learning Roadmaps',
            description: 'Structured learning paths for different tech roles and skill levels'
          },
          {
            icon: '🗣️',
            title: 'English Practice',
            description: 'Improve your English pronunciation and grammar with AI feedback'
          }
        ].map((feature, index) => (
          <div
            key={index}
            style={{
              padding: '30px',
              border: '1px solid #333',
              borderRadius: '12px',
              textAlign: 'center',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#fff';
              e.currentTarget.style.backgroundColor = '#111';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={tryFeature}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
              {feature.title}
            </h3>
            <p style={{ color: '#ccc', lineHeight: '1.5' }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default LandingPage;