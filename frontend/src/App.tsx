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
import './styles/spaceTheme.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#fff' }}>
        <div className="space-card" style={{ padding: '40px', textAlign: 'center' }}>
          <ProfessionalAIBlob size={120} isActive={true} intensity="medium" primaryColor="#667eea" secondaryColor="#43e97b" />
          <p className="space-text" style={{ marginTop: '20px', fontSize: '16px' }}>Initializing Space Interface...</p>
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