import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="minimal-nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            fontSize: '20px',
            fontWeight: '600',
            cursor: 'pointer',
            letterSpacing: '-0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-primary)'
          }}
        >
          <span style={{ fontSize: '24px' }}>⚡️</span> Interview.io
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate('/dashboard')} className="minimal-nav-link">
            Dashboard
          </button>
          <button onClick={() => navigate('/interview')} className="minimal-nav-link">
            Interview
          </button>
          <button onClick={() => navigate('/english')} className="minimal-nav-link">
            English
          </button>
          <button onClick={() => navigate('/chat')} className="minimal-nav-link">
            Chat
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-light)', margin: '0 12px' }} />

          {user ? (
            <UserProfile />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'login' }))}
                className="minimal-button-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Log in
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'register' }))}
                className="minimal-button-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;