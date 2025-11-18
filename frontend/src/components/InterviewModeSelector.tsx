import React, { useState } from 'react';
import CVUploadMode from './CVUploadMode';
import RoleBasedMode from './RoleBasedMode';
import PracticeMode from './PracticeMode';

export interface CVProfile {
  name: string;
  experience: string;
  skills: string[];
  projects: string[];
  education: string;
  technologies: string[];
  achievements?: string[];
}

export interface InterviewConfig {
  mode: 'cv' | 'role' | 'practice';
  profile?: CVProfile;
  role?: string;
  level?: string;
  topics?: string[];
  questionCount?: number;
}

interface InterviewModeSelectorProps {
  onStartInterview: (config: InterviewConfig) => void;
}

const InterviewModeSelector: React.FC<InterviewModeSelectorProps> = ({ onStartInterview }) => {
  const [selectedMode, setSelectedMode] = useState<'choice' | 'cv' | 'role' | 'practice'>('choice');

  if (selectedMode === 'cv') {
    return <CVUploadMode onStartInterview={onStartInterview} onBack={() => setSelectedMode('choice')} />;
  }

  if (selectedMode === 'role') {
    return <RoleBasedMode onStartInterview={onStartInterview} onBack={() => setSelectedMode('choice')} />;
  }

  if (selectedMode === 'practice') {
    return <PracticeMode onStartInterview={onStartInterview} onBack={() => setSelectedMode('choice')} />;
  }

  return (
    <div className="interview-mode-selector">
      <div className="avatar-welcome">
        <div className="avatar-container">
          <div className="avatar-circle">
            <span className="avatar-emoji">🤖</span>
          </div>
        </div>
        <div className="welcome-message">
          <h2>"Welcome! Let's create a personalized interview experience for you."</h2>
        </div>
      </div>

      <div className="mode-options">
        <div className="mode-card recommended" onClick={() => setSelectedMode('cv')}>
          <div className="mode-icon">📄</div>
          <h3>Smart Interview (Upload CV)</h3>
          <p>Reads CV → Personalized questions</p>
          <span className="recommended-badge">Recommended</span>
        </div>

        <div className="mode-card" onClick={() => setSelectedMode('role')}>
          <div className="mode-icon">⚡</div>
          <h3>Quick Role-Based Interview</h3>
          <p>User selects role → Asks 6–10 questions</p>
        </div>

        <div className="mode-card" onClick={() => setSelectedMode('practice')}>
          <div className="mode-icon">🎯</div>
          <h3>Practice Mode (Choose Your Own Questions)</h3>
          <p>Select specific topics to practice</p>
        </div>
      </div>

      <style>{`
        .interview-mode-selector {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
        }

        .avatar-welcome {
          margin-bottom: 3rem;
        }

        .avatar-container {
          margin-bottom: 1rem;
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          animation: pulse 2s infinite;
        }

        .avatar-emoji {
          font-size: 2rem;
        }

        .welcome-message h2 {
          color: #333;
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0;
        }

        .mode-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .mode-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .mode-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .mode-card.recommended {
          border-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
        }

        .mode-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .mode-card h3 {
          color: #1a202c;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .mode-card p {
          color: #718096;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .recommended-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #10b981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default InterviewModeSelector;