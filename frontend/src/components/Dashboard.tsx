import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import { ArrowRight, Sparkles } from 'lucide-react';
import {
  InterviewVisual,
  LearningVisual,
  EnglishVisual,
  VocabularyVisual,
  CharactersVisual
} from './BentoVisuals';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const handleAuthEvent = (e: any) => {
      setAuthMode(e.detail);
      setShowAuthModal(true);
    };
    window.addEventListener('openAuth', handleAuthEvent);
    return () => window.removeEventListener('openAuth', handleAuthEvent);
  }, []);

  const bentoItems = [
    {
      title: "Interview Practice",
      description: "Master technical and behavioral interviews with real-time AI feedback.",
      visual: <InterviewVisual />,
      path: "/interview",
      className: "span-2 row-span-2"
    },
    {
      title: "Learning Paths",
      description: "Structured curriculum from beginner to expert.",
      visual: <LearningVisual />,
      path: "/learn",
      className: "span-1 row-span-2" // Tall item
    },
    {
      title: "English Mastery",
      description: "Refine pronunciation and communication.",
      visual: <EnglishVisual />,
      path: "/english",
      className: "span-1"
    },
    {
      title: "Vocabulary",
      description: "Expand your professional lexicon.",
      visual: <VocabularyVisual />,
      path: "/vocabulary",
      className: "span-1"
    },
    {
      title: "AI Characters",
      description: "Roleplay with diverse AI personas.",
      visual: <CharactersVisual />,
      path: "/chat",
      className: "span-2"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="container">
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          padding: '100px 20px 60px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '100px',
            backgroundColor: 'var(--bg-secondary)',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--text-secondary)'
          }}>
            <Sparkles size={14} />
            <span>AI-Powered Career Acceleration</span>
          </div>

          <h1 className="minimal-title" style={{ marginBottom: '24px' }}>
            Master your interview <br />
            <span style={{ color: 'var(--text-tertiary)' }}>before it happens.</span>
          </h1>

          <p className="minimal-subtitle" style={{ marginBottom: '40px' }}>
            {user
              ? 'Welcome back. Ready to continue your journey?'
              : 'Join thousands of professionals using AI to land their dream jobs. Practice interviews, improve English, and upskill with personalized feedback.'}
          </p>

          {!user && (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                className="minimal-button-primary"
              >
                Get Started <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="minimal-button-secondary"
              >
                Log in
              </button>
            </div>
          )}
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {bentoItems.map((item, index) => (
            <div
              key={index}
              onClick={() => user ? navigate(item.path) : setShowAuthModal(true)}
              className={`bento-item ${item.className || ''}`}
            >
              <div className="visual-container">
                {item.visual}
              </div>
              <div className="bento-content">
                <h3 className="bento-title">{item.title}</h3>
                <p className="bento-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

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