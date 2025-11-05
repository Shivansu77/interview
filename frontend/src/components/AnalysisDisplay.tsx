import React from 'react';

interface AnalysisDisplayProps {
  analysis: any;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50'; // Green
    if (score >= 6) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return '✅';
    if (score >= 6) return '⚠️';
    return '❌';
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '1px solid #333'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #333'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: '#4CAF50',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          <span style={{ fontSize: '16px' }}>🤖</span>
        </div>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: 'white'
        }}>
          AI Analysis Results
        </h3>
      </div>

      {/* Overall Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: analysis.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
        borderRadius: '12px',
        border: `1px solid ${analysis.isCorrect ? '#4CAF50' : '#FF9800'}`
      }}>
        <span style={{ fontSize: '20px', marginRight: '12px' }}>
          {analysis.isCorrect ? '✅' : '⚠️'}
        </span>
        <span style={{
          fontSize: '16px',
          fontWeight: '600',
          color: analysis.isCorrect ? '#4CAF50' : '#FF9800'
        }}>
          {analysis.isCorrect ? 'EXCELLENT ANSWER' : 'NEEDS IMPROVEMENT'}
        </span>
      </div>

      {/* Score Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Content', score: analysis.contentScore, icon: '📝' },
          { label: 'Clarity', score: analysis.clarityScore, icon: '🗣️' },
          { label: 'Completeness', score: analysis.completenessScore, icon: '✅' },
          { label: 'Fluency', score: analysis.fluencyScore, icon: '🎤' }
        ].map((item, index) => (
          <div key={index} style={{
            padding: '16px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid #444',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>
              <span style={{
                fontSize: '24px',
                fontWeight: '700',
                color: getScoreColor(item.score)
              }}>
                {item.score}/10
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#ccc',
              fontWeight: '500'
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Section */}
      <div style={{
        padding: '20px',
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #444',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>💬</span>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#4CAF50'
          }}>
            AI Feedback
          </h4>
        </div>
        <p style={{
          margin: 0,
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#ccc'
        }}>
          {analysis.feedback}
        </p>
      </div>

      {/* Improvements */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderRadius: '12px',
        border: '1px solid #FF9800',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>🔧</span>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#FF9800'
          }}>
            Improvements
          </h4>
        </div>
        <p style={{
          margin: 0,
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#FFB74D'
        }}>
          {analysis.corrections}
        </p>
      </div>

      {/* Suggested Answer */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderRadius: '12px',
        border: '1px solid #4CAF50'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>💡</span>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#4CAF50'
          }}>
            Suggested Answer
          </h4>
        </div>
        <p style={{
          margin: 0,
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#81C784'
        }}>
          {analysis.betterAnswer}
        </p>
      </div>
    </div>
  );
};

export default AnalysisDisplay;