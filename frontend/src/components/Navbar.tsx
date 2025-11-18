import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="space-card" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 40px',
      borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
      margin: '10px 20px',
      borderRadius: '16px'
    }}>
      <div 
        onClick={() => navigate('/dashboard')}
        className="space-title"
        style={{ 
          fontSize: '24px', 
          fontWeight: '300',
          cursor: 'pointer',
          letterSpacing: '1px'
        }}
      >
        🚀 InterviewAI
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="space-text"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Mission Control
        </button>
        <button
          onClick={() => navigate('/interview')}
          className="space-text"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Interview
        </button>
        <button
          onClick={() => navigate('/english')}
          className="space-text"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          English
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="space-text"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '8px',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Space Chat
        </button>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="space-text-muted" style={{ fontSize: '13px' }}>
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="space-button"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }))}
              className="space-button"
              style={{
                background: 'transparent',
                border: '1px solid rgba(129, 140, 248, 0.6)',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              Login
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'register' }))}
              className="space-button"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;