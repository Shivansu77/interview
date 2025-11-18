import React, { useState } from 'react';
import { InterviewConfig } from './InterviewModeSelector';

interface RoleBasedModeProps {
  onStartInterview: (config: InterviewConfig) => void;
  onBack: () => void;
}

const RoleBasedMode: React.FC<RoleBasedModeProps> = ({ onStartInterview, onBack }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const jobRoles = [
    { id: 'frontend', name: 'Frontend Developer', icon: '🎨' },
    { id: 'backend', name: 'Backend Developer', icon: '⚙️' },
    { id: 'fullstack', name: 'MERN Developer', icon: '🚀' },
    { id: 'devops', name: 'DevOps Engineer', icon: '🔧' },
    { id: 'data', name: 'Data Analyst', icon: '📊' },
    { id: 'hr', name: 'HR Round', icon: '💼' }
  ];

  const experienceLevels = [
    { id: 'fresher', name: 'Fresher', description: '0-1 years', icon: '🌱' },
    { id: 'junior', name: '1–2 years', description: 'Junior level', icon: '📈' },
    { id: 'mid', name: '3–5 years', description: 'Mid level', icon: '🎯' }
  ];

  const handleStartInterview = () => {
    onStartInterview({
      mode: 'role',
      role: selectedRole,
      level: selectedLevel,
      questionCount: 6
    });
  };

  return (
    <div className="role-based-mode">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="mode-container">
        <h2>Quick Role-Based Interview</h2>
        <p>Select your target role and experience level for focused questions</p>

        <div className="selection-section">
          <h3>Job Role</h3>
          <div className="role-grid">
            {jobRoles.map(role => (
              <div
                key={role.id}
                className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="role-icon">{role.icon}</div>
                <div className="role-name">{role.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="selection-section">
          <h3>Experience Level</h3>
          <div className="level-grid">
            {experienceLevels.map(level => (
              <div
                key={level.id}
                className={`level-card ${selectedLevel === level.id ? 'selected' : ''}`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <div className="level-icon">{level.icon}</div>
                <div className="level-info">
                  <div className="level-name">{level.name}</div>
                  <div className="level-desc">{level.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRole && selectedLevel && (
          <div className="interview-preview">
            <div className="avatar-preview">
              <div className="avatar-circle">
                <span className="avatar-emoji">🤖</span>
              </div>
              <div className="preview-message">
                "Perfect! I'll ask you 6 focused questions for {jobRoles.find(r => r.id === selectedRole)?.name} at {experienceLevels.find(l => l.id === selectedLevel)?.name} level."
              </div>
            </div>
            
            <button className="start-btn" onClick={handleStartInterview}>
              Start Interview (6 Questions)
            </button>
          </div>
        )}
      </div>

      <style>{`
        .role-based-mode {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .back-btn {
          background: none;
          border: none;
          color: #667eea;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 2rem;
        }

        .mode-container {
          text-align: center;
        }

        .mode-container h2 {
          color: #1a202c;
          margin-bottom: 0.5rem;
        }

        .mode-container > p {
          color: #718096;
          margin-bottom: 3rem;
        }

        .selection-section {
          margin-bottom: 3rem;
        }

        .selection-section h3 {
          color: #2d3748;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .role-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .role-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .role-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #ebf4ff 0%, #e6fffa 100%);
        }

        .role-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .role-name {
          color: #2d3748;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .level-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .level-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .level-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .level-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #ebf4ff 0%, #e6fffa 100%);
        }

        .level-icon {
          font-size: 1.5rem;
        }

        .level-info {
          text-align: left;
        }

        .level-name {
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .level-desc {
          color: #718096;
          font-size: 0.9rem;
        }

        .interview-preview {
          background: #f7fafc;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .avatar-preview {
          margin-bottom: 2rem;
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .avatar-emoji {
          font-size: 1.5rem;
        }

        .preview-message {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 1rem 1.5rem;
          color: #2d3748;
          font-style: italic;
          max-width: 400px;
          margin: 0 auto;
        }

        .start-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .start-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default RoleBasedMode;