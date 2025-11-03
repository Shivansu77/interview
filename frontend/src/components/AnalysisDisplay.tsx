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
      background: '#2a2a2a',
      padding: '20px',
      borderRadius: '10px',
      margin: '20px 0',
      border: '2px solid #FF9800',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ color: '#FF9800', margin: 0 }}>AI Analysis</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
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
              color: 'white'
            }}>
              {analysis.isAdequate ? 'ADEQUATE' : 'NEEDS IMPROVEMENT'}
            </div>
          )}
        </div>
      </div>
      
      <div className="scores" style={{ 
        display: 'grid', 
        gridTemplateColumns: analysis.fluencyScore ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', 
        gap: '15px', 
        marginBottom: '20px',
        width: '100%'
      }}>
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
        background: '#333',
        padding: '20px',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '16px',
        lineHeight: '1.5',
        width: '100%'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <strong style={{ color: '#FF9800' }}>Feedback:</strong>
          <div style={{ marginTop: '5px' }}>{analysis.feedback}</div>
        </div>
        
        {analysis.speechIssues && (
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#FF5722' }}>Speech Issues:</strong>
            <div style={{ marginTop: '5px' }}>{analysis.speechIssues}</div>
          </div>
        )}
        
        {analysis.corrections && (
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#f44336' }}>Corrections:</strong>
            <div style={{ marginTop: '5px' }}>{analysis.corrections}</div>
          </div>
        )}
        
        {analysis.betterAnswer && (
          <div>
            <strong style={{ color: '#4CAF50' }}>Better Answer:</strong>
            <div style={{ marginTop: '5px', padding: '10px', backgroundColor: '#444', borderRadius: '5px' }}>
              {analysis.betterAnswer}
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
};

export default AnalysisDisplay;