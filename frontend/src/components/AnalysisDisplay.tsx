import React from 'react';

interface AnalysisDisplayProps {
  analysis: {
    contentScore: number;
    clarityScore: number;
    completenessScore: number;
    fluencyScore?: number;
    isCorrect?: boolean;
    isAdequate?: boolean;
    feedback: string;
    speechIssues?: string;
    corrections?: string;
    betterAnswer?: string;
    wordSuggestions?: Array<{
      original: string;
      suggestion: string;
      reason: string;
    }>;
    addWords?: string[];
    removeWords?: string[];
  } | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="analysis-display" style={{
      background: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
      padding: '25px',
      borderRadius: '15px',
      margin: '20px 0',
      border: '2px solid #FF9800',
      width: '100%',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #444'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '28px' }}>🤖</div>
          <h3 style={{ color: '#FF9800', margin: 0, fontSize: '22px', fontWeight: 'bold' }}>AI Analysis Results</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {analysis.isCorrect !== undefined && (
            <div style={{
              padding: '8px 16px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: analysis.isCorrect ? '#4CAF50' : '#f44336',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {analysis.isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}
            </div>
          )}
          {analysis.isAdequate !== undefined && (
            <div style={{
              padding: '8px 16px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: analysis.isAdequate ? '#2196F3' : '#FF9800',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {analysis.isAdequate ? '👍 ADEQUATE' : '⚠️ NEEDS IMPROVEMENT'}
            </div>
          )}
        </div>
      </div>
      
      <div className="scores" style={{ 
        display: 'grid', 
        gridTemplateColumns: analysis.fluencyScore ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', 
        gap: '20px', 
        marginBottom: '25px',
        width: '100%'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #4CAF50',
          boxShadow: '0 4px 15px rgba(76, 175, 80, 0.2)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
          <div style={{ color: '#4CAF50', fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>{analysis.contentScore}/10</div>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>Content</div>
        </div>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #2196F3',
          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.2)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🗣️</div>
          <div style={{ color: '#2196F3', fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>{analysis.clarityScore}/10</div>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>Clarity</div>
        </div>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #9C27B0',
          boxShadow: '0 4px 15px rgba(156, 39, 176, 0.2)'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
          <div style={{ color: '#9C27B0', fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>{analysis.completenessScore}/10</div>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>Completeness</div>
        </div>
        {analysis.fluencyScore && (
          <div style={{ 
            textAlign: 'center',
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #FF5722',
            boxShadow: '0 4px 15px rgba(255, 87, 34, 0.2)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎤</div>
            <div style={{ color: '#FF5722', fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>{analysis.fluencyScore}/10</div>
            <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '500' }}>Fluency</div>
          </div>
        )}
      </div>
      
      <div className="feedback" style={{
        background: 'linear-gradient(135deg, #333 0%, #2a2a2a 100%)',
        padding: '25px',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '16px',
        lineHeight: '1.6',
        width: '100%',
        border: '1px solid #444',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <strong style={{ color: '#FF9800', fontSize: '18px' }}>AI Feedback</strong>
          </div>
          <div style={{ 
            marginTop: '8px', 
            padding: '15px',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderRadius: '8px',
            borderLeft: '4px solid #FF9800'
          }}>{analysis.feedback}</div>
        </div>
        
        {analysis.speechIssues && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>🎯</span>
              <strong style={{ color: '#FF5722', fontSize: '18px' }}>Speech Analysis</strong>
            </div>
            <div style={{ 
              marginTop: '8px', 
              padding: '15px',
              backgroundColor: 'rgba(255, 87, 34, 0.1)',
              borderRadius: '8px',
              borderLeft: '4px solid #FF5722'
            }}>{analysis.speechIssues}</div>
          </div>
        )}
        
        {analysis.corrections && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔧</span>
              <strong style={{ color: '#f44336', fontSize: '18px' }}>Improvements</strong>
            </div>
            <div style={{ 
              marginTop: '8px', 
              padding: '15px',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderRadius: '8px',
              borderLeft: '4px solid #f44336'
            }}>{analysis.corrections}</div>
          </div>
        )}
        
        {analysis.betterAnswer && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <strong style={{ color: '#4CAF50', fontSize: '18px' }}>Suggested Answer</strong>
            </div>
            <div style={{ 
              marginTop: '8px', 
              padding: '18px', 
              backgroundColor: 'rgba(76, 175, 80, 0.1)', 
              borderRadius: '8px',
              borderLeft: '4px solid #4CAF50',
              fontStyle: 'italic'
            }}>
              {analysis.betterAnswer}
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
};

export default AnalysisDisplay;