import React, { useState } from 'react';
import LearningRoadmap from './LearningRoadmap';
import SpeechPractice from './SpeechPractice';

interface LearnSectionProps {
  userId: string;
}

const LearnSection: React.FC<LearnSectionProps> = ({ userId }) => {
  const [currentView, setCurrentView] = useState<'roadmap' | 'practice'>('roadmap');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const [learningField, setLearningField] = useState<'webdev' | 'datascience' | 'ml' | 'behavioral'>('webdev');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentView('practice');
  };

  const handleBackToRoadmap = () => {
    setCurrentView('roadmap');
    setSelectedTopic('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{ color: '#10b981', margin: 0, fontSize: '28px', fontWeight: 'bold' }}>📚 Learn & Practice</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', margin: '8px 0 0 0', fontSize: '16px' }}>
              Master interview skills with AI-powered practice sessions
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={learningField}
              onChange={(e) => setLearningField(e.target.value as 'webdev' | 'datascience' | 'ml' | 'behavioral')}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
              }}
            >
              <option value="webdev" style={{ color: '#111827' }}>🌐 Web Development</option>
              <option value="datascience" style={{ color: '#111827' }}>📈 Data Science</option>
              <option value="ml" style={{ color: '#111827' }}>🤖 Machine Learning</option>
              <option value="behavioral" style={{ color: '#111827' }}>💬 Behavioral</option>
            </select>
            
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 146, 60, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
              }}
            >
              <option value="beginner" style={{ color: '#111827' }}>🌱 Beginner</option>
              <option value="intermediate" style={{ color: '#111827' }}>🚀 Intermediate</option>
              <option value="advanced" style={{ color: '#111827' }}>⭐ Advanced</option>
            </select>
            
            {currentView === 'practice' && (
              <button
                onClick={handleBackToRoadmap}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                ← Back to Roadmap
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {currentView === 'roadmap' ? (
          <LearningRoadmap
            field={learningField}
            level={level}
            onTopicSelect={handleTopicSelect}
            userId={userId}
          />
        ) : (
          <SpeechPractice
            topic={selectedTopic}
            field={learningField}
            level={level}
            userId={userId}
            onBack={handleBackToRoadmap}
          />
        )}
      </div>
    </div>
  );
};

export default LearnSection;