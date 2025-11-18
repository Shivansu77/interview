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
            <div className="ai-core"></div>
            <div className="wave-ring wave-1"></div>
            <div className="wave-ring wave-2"></div>
            <div className="wave-ring wave-3"></div>
          </div>
        </div>
        <div className="welcome-message">
          <h2 className="space-title">"Welcome! Let's create a personalized mission experience for you."</h2>
        </div>
      </div>

      <div className="mode-options">
        <div className="mode-card space-card recommended" onClick={() => setSelectedMode('cv')}>
          <div className="mode-icon">🛸</div>
          <h3 className="space-text">Smart Mission (Upload CV)</h3>
          <p className="space-text-muted">Reads CV → Personalized transmissions</p>
          <span className="recommended-badge">Recommended</span>
        </div>

        <div className="mode-card space-card" onClick={() => setSelectedMode('role')}>
          <div className="mode-icon">⚡</div>
          <h3 className="space-text">Quick Role-Based Mission</h3>
          <p className="space-text-muted">User selects role → Asks 6–10 transmissions</p>
        </div>

        <div className="mode-card space-card" onClick={() => setSelectedMode('practice')}>
          <div className="mode-icon">🎯</div>
          <h3 className="space-text">Practice Mode (Choose Your Own Missions)</h3>
          <p className="space-text-muted">Select specific topics to practice</p>
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
          width: 100px;
          height: 100px;
          position: relative;
          margin: 0 auto;
        }

        .ai-core {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #667eea, #764ba2);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: coreGlow 3s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
        }

        .wave-ring {
          position: absolute;
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: ripple 2s ease-out infinite;
        }

        .wave-1 {
          width: 100px;
          height: 100px;
          animation-delay: 0s;
        }

        .wave-2 {
          width: 120px;
          height: 120px;
          animation-delay: 0.5s;
        }

        .wave-3 {
          width: 140px;
          height: 140px;
          animation-delay: 1s;
        }

        .welcome-message h2 {
          font-size: 1.5rem;
          font-weight: 300;
          margin: 0;
        }

        .mode-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .mode-card {
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .mode-card:hover {
          transform: translateY(-5px);
          border-color: rgba(129, 140, 248, 0.6);
        }

        .mode-card.recommended {
          border-color: rgba(34, 197, 94, 0.6);
        }

        .mode-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .mode-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .mode-card p {
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .recommended-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: rgba(34, 197, 94, 0.9);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        @keyframes coreGlow {
          0%, 100% {
            filter: brightness(1) saturate(1);
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
          }
          50% {
            filter: brightness(1.2) saturate(1.2);
            box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
          }
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewModeSelector;