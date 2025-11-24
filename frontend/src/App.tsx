import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProfessionalAIBlob from './components/ProfessionalAIBlob';
import Dashboard from './components/Dashboard';
import InterviewPage from './pages/InterviewPage';
import LearnPage from './pages/LearnPage';
import EnglishPage from './pages/EnglishPage';
import VocabularyPage from './pages/VocabularyPage';
import ChatPage from './pages/ChatPage';
import './styles/blobAnimations.css';
import './styles/aiBlob.css';
// import './styles/spaceTheme.css';
import './styles/minimalTheme.css';

// Add loading animations
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
`;
document.head.appendChild(style);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}>

        <div className="minimal-card" style={{
          padding: '60px 40px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          maxWidth: '400px',
          width: '90%',
          border: 'none',
          boxShadow: 'none'
        }}>
          <div style={{
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <ProfessionalAIBlob
              size={140}
              isActive={true}
              intensity="high"
              primaryColor="#000000"
              secondaryColor="#666666"
            />
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '16px',
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)'
          }}>
            Initializing Interface
          </h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--text-primary)',
                  animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both`
                }}
              />
            ))}
          </div>

          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            Connecting to servers...
          </p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          } />
          <Route path="/learn" element={
            <ProtectedRoute>
              <LearnPage />
            </ProtectedRoute>
          } />
          <Route path="/english" element={
            <ProtectedRoute>
              <EnglishPage />
            </ProtectedRoute>
          } />
          <Route path="/vocabulary" element={
            <ProtectedRoute>
              <VocabularyPage />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;