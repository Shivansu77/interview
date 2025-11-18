import React, { useState } from 'react';
import { InterviewConfig } from './InterviewModeSelector';

interface PracticeModeProps {
  onStartInterview: (config: InterviewConfig) => void;
  onBack: () => void;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ onStartInterview, onBack }) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const practiceTopics = [
    { id: 'api', name: 'REST API', icon: '🔌', description: 'API design, endpoints, HTTP methods' },
    { id: 'auth', name: 'Authentication', icon: '🔐', description: 'JWT, OAuth, security practices' },
    { id: 'system', name: 'System Design', icon: '🏗️', description: 'Scalability, architecture patterns' },
    { id: 'projects', name: 'Projects', icon: '🚀', description: 'Your portfolio and experience' },
    { id: 'oop', name: 'OOP Concepts', icon: '📦', description: 'Classes, inheritance, polymorphism' },
    { id: 'hr', name: 'HR Questions', icon: '💼', description: 'Behavioral and situational questions' },
    { id: 'communication', name: 'Communication', icon: '💬', description: 'Explaining technical concepts' },
    { id: 'confidence', name: 'Confidence Practice', icon: '💪', description: 'Building interview confidence' }
  ];

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleStartInterview = () => {
    onStartInterview({
      mode: 'practice',
      topics: selectedTopics,
      questionCount: 5
    });
  };

  return (
    <div className="practice-mode">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="mode-container">
        <h2>Practice Mode</h2>
        <p>Choose specific topics you want to practice. Perfect for daily skill improvement!</p>

        <div className="topics-section">
          <h3>Select Topics to Practice</h3>
          <div className="topics-grid">
            {practiceTopics.map(topic => (
              <div
                key={topic.id}
                className={`topic-card ${selectedTopics.includes(topic.id) ? 'selected' : ''}`}
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="topic-header">
                  <div className="topic-icon">{topic.icon}</div>
                  <div className="topic-name">{topic.name}</div>
                  <div className="checkbox">
                    {selectedTopics.includes(topic.id) ? '✓' : ''}
                  </div>
                </div>
                <div className="topic-description">{topic.description}</div>
              </div>
            ))}
          </div>
        </div>

        {selectedTopics.length > 0 && (
          <div className="practice-preview">
            <div className="avatar-preview">
              <div className="avatar-circle">
                <span className="avatar-emoji">🤖</span>
              </div>
              <div className="preview-message">
                "Great choice! I'll ask you 5 questions focusing on: {selectedTopics.map(id => practiceTopics.find(t => t.id === id)?.name).join(', ')}. This is perfect for targeted practice!"
              </div>
            </div>
            
            <div className="practice-benefits">
              <h4>Why Practice Mode is Best:</h4>
              <ul>
                <li>✓ Focus on your weak areas</li>
                <li>✓ Perfect for daily practice sessions</li>
                <li>✓ Build confidence in specific topics</li>
                <li>✓ Track improvement over time</li>
              </ul>
            </div>
            
            <button className="start-btn" onClick={handleStartInterview}>
              Start Practice Session (5 Questions)
            </button>
          </div>
        )}

        {selectedTopics.length === 0 && (
          <div className="selection-hint">
            <div className="hint-icon">👆</div>
            <p>Select at least one topic to start your practice session</p>
          </div>
        )}
      </div>

      <style>{`
        .practice-mode {
          max-width: 900px;
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

        .topics-section {
          margin-bottom: 3rem;
        }

        .topics-section h3 {
          color: #2d3748;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .topic-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .topic-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }

        .topic-card.selected {
          border-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
        }

        .topic-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .topic-icon {
          font-size: 1.5rem;
        }

        .topic-name {
          color: #2d3748;
          font-weight: 600;
          flex: 1;
        }

        .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #cbd5e0;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: white;
        }

        .topic-card.selected .checkbox {
          background: #10b981;
          border-color: #10b981;
        }

        .topic-description {
          color: #718096;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .practice-preview {
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
          max-width: 500px;
          margin: 0 auto;
        }

        .practice-benefits {
          background: #ecfdf5;
          border: 2px solid #10b981;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .practice-benefits h4 {
          color: #065f46;
          margin-bottom: 1rem;
        }

        .practice-benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .practice-benefits li {
          color: #047857;
          margin-bottom: 0.5rem;
          font-weight: 500;
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

        .selection-hint {
          background: #fffbeb;
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .hint-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .selection-hint p {
          color: #92400e;
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default PracticeMode;