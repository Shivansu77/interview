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
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      {/* Header */}
      <div className="minimal-card" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <h1 className="minimal-title" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
              Learn & Practice
            </h1>
            <p className="minimal-subtitle" style={{ margin: 0, maxWidth: '100%' }}>
              Master interview skills with AI-powered practice sessions tailored to your field.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="select-wrapper">
              <select
                value={learningField}
                onChange={(e) => setLearningField(e.target.value as 'webdev' | 'datascience' | 'ml' | 'behavioral')}
                className="minimal-input"
                style={{ paddingRight: '32px' }}
              >
                <option value="webdev">🌐 Web Development</option>
                <option value="datascience">📈 Data Science</option>
                <option value="ml">🤖 Machine Learning</option>
                <option value="behavioral">💬 Behavioral</option>
              </select>
            </div>

            <div className="select-wrapper">
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                className="minimal-input"
                style={{ paddingRight: '32px' }}
              >
                <option value="beginner">🌱 Beginner</option>
                <option value="intermediate">🚀 Intermediate</option>
                <option value="advanced">⭐ Advanced</option>
              </select>
            </div>

            {currentView === 'practice' && (
              <button
                onClick={handleBackToRoadmap}
                className="minimal-button-secondary"
              >
                ← Back to Roadmap
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="fade-in">
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