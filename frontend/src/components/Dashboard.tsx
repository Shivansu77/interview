import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AuthModal from './AuthModal';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleAuthEvent = (e: any) => {
      setAuthMode(e.detail);
      setShowAuthModal(true);
    };
    window.addEventListener('openAuth', handleAuthEvent);
    return () => window.removeEventListener('openAuth', handleAuthEvent);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <Navbar />

      {/* Hero Section */}
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
          {user ? `Welcome back, ${user.name}!` : 'AI Interview Platform'}
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#ccc',
          marginBottom: '40px',
          lineHeight: '1.5'
        }}>
          {user ? 'Choose your practice mode and start improving your skills' : 'Master your interview skills with AI-powered practice sessions'}
        </p>
        {!user && (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
            <button
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              style={{
                background: 'transparent',
                border: '2px solid #fff',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              style={{
                background: '#fff',
                border: 'none',
                color: '#000',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div style={{
        padding: '0 50px 50px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
            {/* Interview Practice */}
            <div
              onClick={() => user ? navigate('/interview') : setShowAuthModal(true)}
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
            >
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/practice.jpg" 
                  alt="Interview Practice" 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                Interview Practice
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.5' }}>
                Practice technical and behavioral interviews with AI feedback
              </p>
            </div>

            <div
              onClick={() => user ? navigate('/learn') : setShowAuthModal(true)}
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
            >
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/learningpath.jpg" 
                  alt="Learning Paths" 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                Learning Paths
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.5' }}>
                Structured learning with hands-on practice
              </p>
            </div>

            <div
              onClick={() => user ? navigate('/english') : setShowAuthModal(true)}
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
            >
              <div style={{ fontSize: '48px', marginBottom: '20px' }}><img src="/mic.png" alt="English Practice" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />  </div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                English Practice
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.5' }}>
                Improve pronunciation and communication skills
              </p>
            </div>

            <div
              onClick={() => user ? navigate('/vocabulary') : setShowAuthModal(true)}
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
            >
              <div style={{ fontSize: '48px', marginBottom: '20px' }}><img src="/vocab.png" alt="Vocabulary Builder" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} /></div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                Vocabulary Builder
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.5' }}>
                Expand your professional vocabulary
              </p>
            </div>

            <div
              onClick={() => user ? navigate('/chat') : setShowAuthModal(true)}
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
            >
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/character.jpg" 
                  alt="AI Character" 
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                AI Characters
              </h3>
              <p style={{ color: '#ccc', lineHeight: '1.5' }}>
                Chat with AI characters for practice
              </p>
            </div>
        </div>
      </div>
      
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
};

export default Dashboard;