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
      description: "Master technical and behavioral interviews with AI-powered feedback and real-time analysis.",
      visual: <InterviewVisual />,
      path: "/interview",
      className: "span-2 row-span-2",
      accent: "primary",
      badge: "Most Popular"
    },
    {
      title: "Learning Paths",
      description: "Structured curriculum from beginner to expert with personalized roadmaps.",
      visual: <LearningVisual />,
      path: "/learn",
      className: "span-1 row-span-2",
      accent: "purple"
    },
    {
      title: "English Mastery",
      description: "Perfect your pronunciation and fluency with advanced speech analysis.",
      visual: <EnglishVisual />,
      path: "/english",
      className: "span-1",
      accent: "blue"
    },
    {
      title: "Vocabulary Builder",
      description: "Expand your professional vocabulary with daily challenges.",
      visual: <VocabularyVisual />,
      path: "/vocabulary",
      className: "span-1",
      accent: "teal"
    },
    {
      title: "AI Characters",
      description: "Practice conversations with diverse AI personalities for any scenario.",
      visual: <CharactersVisual />,
      path: "/chat",
      className: "span-2",
      accent: "gradient"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>AI-Powered Career Acceleration</span>
          </div>

          <h1 className="hero-title">
            Master your interview <br />
            <span className="hero-title-accent">before it happens.</span>
          </h1>

          <p className="hero-subtitle">
            {user
              ? 'Welcome back. Ready to continue your journey?'
              : 'Join thousands of professionals using AI to land their dream jobs. Practice interviews, improve English, and upskill with personalized feedback.'}
          </p>

          {!user && (
            <div className="hero-buttons">
              <button
                onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                className="minimal-button-primary hero-cta"
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

          {/* Stats for social proof */}
          {!user && (
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Interviews Practiced</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {bentoItems.map((item, index) => (
            <div
              key={index}
              onClick={() => user ? navigate(item.path) : setShowAuthModal(true)}
              className={`bento-item ${item.className || ''} accent-${item.accent || 'default'}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  user ? navigate(item.path) : setShowAuthModal(true);
                }
              }}
              aria-label={`Navigate to ${item.title}`}
            >
              {item.badge && (
                <div className="bento-badge">
                  <Sparkles size={12} />
                  {item.badge}
                </div>
              )}
              <div className="visual-container">
                {item.visual}
              </div>
              <div className="bento-content">
                <h3 className="bento-title">{item.title}</h3>
                <p className="bento-description">{item.description}</p>
                <div className="bento-arrow">
                  <ArrowRight size={20} />
                </div>
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