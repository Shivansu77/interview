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
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 50px',
      borderBottom: '1px solid #333',
      backgroundColor: '#000'
    }}>
      <div 
        onClick={() => navigate('/dashboard')}
        style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        InterviewAI
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '10px'
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/interview')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '10px'
          }}
        >
          Interview
        </button>
        <button
          onClick={() => navigate('/english')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '10px'
          }}
        >
          English
        </button>
        <button
          onClick={() => navigate('/chat')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '10px'
          }}
        >
          Chat
        </button>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#ccc', fontSize: '14px' }}>
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: '#fff',
                border: 'none',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
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
              style={{
                background: 'transparent',
                border: '1px solid #fff',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Login
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openAuth', { detail: 'register' }))}
              style={{
                background: '#fff',
                border: 'none',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
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