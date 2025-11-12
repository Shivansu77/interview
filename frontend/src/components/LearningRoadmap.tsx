import React, { useState, useEffect, useCallback } from 'react';

interface LearningRoadmapProps {
  field: 'webdev' | 'datascience' | 'ml' | 'behavioral';
  level: 'beginner' | 'intermediate' | 'advanced';
  onTopicSelect: (topic: string) => void;
  userId: string;
}

const LearningRoadmap: React.FC<LearningRoadmapProps> = ({ 
  field, 
  level, 
  onTopicSelect, 
  userId 
}) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/learn/roadmap/${field}?level=${level}`);
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  }, [field, level]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/learn/progress/${userId}`);
      const data = await response.json();
      setProgress(data.progress || {});
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoadmap();
    fetchProgress();
  }, [fetchRoadmap, fetchProgress]);

  const getTopicProgress = (topic: string) => {
    const topicQuestions = Object.keys(progress).filter(key => key.startsWith(topic));
    const completed = topicQuestions.filter(key => progress[key]?.completed).length;
    const total = topicQuestions.length || 5; // Default 5 questions per topic
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
        <h3>Loading your learning roadmap...</h3>
      </div>
    );
  }

  return (
    <div className="learning-roadmap">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {topics.map((topic, index) => {
          const topicProgress = getTopicProgress(topic);
          const isCompleted = topicProgress.percentage === 100;
          
          return (
            <div
              key={topic}
              onClick={() => onTopicSelect(topic)}
              style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                border: `2px solid ${isCompleted ? '#4CAF50' : '#444'}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Progress bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${topicProgress.percentage}%`,
                height: '4px',
                backgroundColor: '#4CAF50',
                transition: 'width 0.3s ease'
              }} />
              
              {/* Topic number */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#4CAF50' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>
              
              {/* Content */}
              <h3 style={{
                color: isCompleted ? '#4CAF50' : '#fff',
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {topic}
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ color: '#ccc', fontSize: '14px' }}>
                  Progress: {topicProgress.completed}/{topicProgress.total} questions
                </span>
                <span style={{
                  color: isCompleted ? '#4CAF50' : '#FF9800',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {Math.round(topicProgress.percentage)}%
                </span>
              </div>
              
              {/* Progress bar visual */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#444',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: `${topicProgress.percentage}%`,
                  height: '100%',
                  backgroundColor: isCompleted ? '#4CAF50' : '#FF9800',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  color: '#4CAF50',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {isCompleted ? '🎉 Completed!' : '🎯 Start Practice'}
                </span>
                <span style={{ color: '#ccc', fontSize: '12px' }}>
                  {level.charAt(0).toUpperCase() + level.slice(1)} Level
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {topics.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          backgroundColor: '#2a2a2a',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
          <h3>No topics available</h3>
          <p style={{ color: '#ccc' }}>
            Try selecting a different type or level from the dropdown above.
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningRoadmap;