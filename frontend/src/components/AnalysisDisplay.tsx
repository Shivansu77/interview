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
  } | null;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="analysis-display" style={{
      background: '#1a1a1a',
      padding: '20px',
      borderRadius: '10px',
      margin: '20px 0',
      border: '2px solid #FF9800'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#FF9800', margin: 0, marginRight: '15px' }}>AI Analysis</h3>
        {analysis.isCorrect !== undefined && (
          <div style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: analysis.isCorrect ? '#4CAF50' : '#f44336',
            color: 'white'
          }}>
            {analysis.isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
          </div>
        )}
        {analysis.isAdequate !== undefined && (
          <div style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: analysis.isAdequate ? '#2196F3' : '#FF9800',
            color: 'white',
            marginLeft: '10px'
          }}>
            {analysis.isAdequate ? 'ADEQUATE' : 'NEEDS IMPROVEMENT'}
          </div>
        )}
      </div>
      
      <div className="scores" style={{ display: 'grid', gridTemplateColumns: analysis.fluencyScore ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#4CAF50', fontSize: '24px', fontWeight: 'bold' }}>{analysis.contentScore}/10</div>
          <div style={{ color: '#ffffff', fontSize: '14px' }}>Content</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#2196F3', fontSize: '24px', fontWeight: 'bold' }}>{analysis.clarityScore}/10</div>
          <div style={{ color: '#ffffff', fontSize: '14px' }}>Clarity</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#9C27B0', fontSize: '24px', fontWeight: 'bold' }}>{analysis.completenessScore}/10</div>
          <div style={{ color: '#ffffff', fontSize: '14px' }}>Completeness</div>
        </div>
        {analysis.fluencyScore && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#FF5722', fontSize: '24px', fontWeight: 'bold' }}>{analysis.fluencyScore}/10</div>
            <div style={{ color: '#ffffff', fontSize: '14px' }}>Fluency</div>
          </div>
        )}
      </div>
      
      <div className="feedback" style={{
        background: '#2a2a2a',
        padding: '15px',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#FF9800' }}>Feedback:</strong> {analysis.feedback}
        </div>
        
        {analysis.speechIssues && (
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#FF5722' }}>Speech Issues:</strong> {analysis.speechIssues}
          </div>
        )}
        
        {analysis.corrections && (
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#f44336' }}>Corrections:</strong> {analysis.corrections}
          </div>
        )}
        
        {analysis.betterAnswer && (
          <div>
            <strong style={{ color: '#4CAF50' }}>Better Answer:</strong> {analysis.betterAnswer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDisplay;