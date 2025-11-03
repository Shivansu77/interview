import React, { useState, useEffect } from 'react';
import LearningRoadmap from './LearningRoadmap';
import SpeechPractice from './SpeechPractice';

interface LearnSectionProps {
  userId: string;
}

const LearnSection: React.FC<LearnSectionProps> = ({ userId }) => {
  const [currentView, setCurrentView] = useState<'roadmap' | 'practice'>('roadmap');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [learningField, setLearningField] = useState<'webdev' | 'datascience' | 'ml' | 'behavioral'>('webdev');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentView('practice');
  };

  const handleBackToRoadmap = () => {
    setCurrentView('roadmap');
    setSelectedTopic('');
    setSelectedQuestion(null);
  };

  return (
    <div className="learn-section" style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '20px',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#2a2a2a',
          borderRadius: '10px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h1 style={{ color: '#4CAF50', margin: 0 }}>📚 Learn & Practice</h1>
            <p style={{ color: '#ccc', margin: '5px 0 0 0' }}>
              Master interview skills with AI-powered practice sessions
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={learningField}
              onChange={(e) => setLearningField(e.target.value as 'webdev' | 'datascience' | 'ml' | 'behavioral')}
              style={{
                padding: '8px 15px',
                borderRadius: '5px',
                border: '2px solid #4CAF50',
                backgroundColor: '#2a2a2a',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="webdev">🌐 Web Development</option>
              <option value="datascience">📈 Data Science</option>
              <option value="ml">🤖 Machine Learning</option>
              <option value="behavioral">💬 Behavioral</option>
            </select>
            
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              style={{
                padding: '8px 15px',
                borderRadius: '5px',
                border: '2px solid #FF9800',
                backgroundColor: '#2a2a2a',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">🚀 Intermediate</option>
              <option value="advanced">⭐ Advanced</option>
            </select>
            
            {currentView === 'practice' && (
              <button
                onClick={handleBackToRoadmap}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
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