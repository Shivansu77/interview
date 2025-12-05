import React, { useState, useRef } from 'react';
import UserProfile from './UserProfile';

interface EnglishPracticeProps {
  onBack: () => void;
}

const EnglishPractice: React.FC<EnglishPracticeProps> = ({ onBack }) => {
  const [practiceText, setPracticeText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [assessment, setAssessment] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [wordInfo, setWordInfo] = useState<any>(null);
  const [transcription, setTranscription] = useState('');
  const [recordingStep, setRecordingStep] = useState<'ready' | 'recording' | 'processing' | 'complete'>('ready');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const practiceTexts = [
    "Hello, my name is John and I am excited to practice English speaking today.",
    "Technology has revolutionized the way we communicate and learn new languages.",
    "Effective communication requires clear pronunciation, proper grammar, and confident delivery.",
    "I believe that consistent practice and dedication are key to mastering any skill."
  ];

  const startRecording = async () => {
    try {
      setRecordingStep('recording');
      setTranscription('');
      setAssessment(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Microphone access required for speech analysis');
      setRecordingStep('ready');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingStep('processing');
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const audioData = reader.result?.toString().split(',')[1];

        const transcriptResponse = await fetch('http://localhost:5003/api/ai/speech-to-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData })
        });

        const transcriptResult = await transcriptResponse.json();

        if (transcriptResult.success && transcriptResult.transcript) {
          setTranscription(transcriptResult.transcript);
          setPracticeText(transcriptResult.transcript);

          setIsAnalyzing(true);
          const assessmentResponse = await fetch('http://localhost:5003/api/english/assess/comprehensive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: transcriptResult.transcript,
              audioData: audioData
            })
          });

          const assessmentResult = await assessmentResponse.json();
          setAssessment(assessmentResult.assessment);
          setRecordingStep('complete');
        } else {
          alert('Could not transcribe audio. Please try speaking more clearly.');
          setRecordingStep('ready');
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing recording. Please try again.');
      setRecordingStep('ready');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkGrammar = async () => {
    if (!practiceText.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:5003/api/english/grammar/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: practiceText })
      });

      const result = await response.json();
      setAssessment((prev: any) => ({
        ...prev,
        grammarScore: result.grammarScore,
        corrections: result.corrections
      }));
    } catch (error) {
      console.error('Grammar check error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const lookupWord = async (word: string) => {
    setSelectedWord(word);
    try {
      const response = await fetch(`http://localhost:5003/api/english/vocabulary/word/${word}`);
      const result = await response.json();
      setWordInfo(result);
    } catch (error) {
      console.error('Word lookup error:', error);
    }
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="minimal-title" style={{ fontSize: '2.5rem', margin: 0 }}>English Communication Lab</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="minimal-button-secondary">
            ← Back
          </button>
          <UserProfile />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Practice Section */}
        <div className="minimal-card" style={{ padding: '32px' }}>
          <h3 className="minimal-subtitle" style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 600 }}>
            🚀 Practice Mission
          </h3>

          {/* Sample Texts */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Choose a practice sentence:
            </label>
            <div className="select-wrapper">
              <select
                onChange={(e) => setPracticeText(e.target.value)}
                className="minimal-input"
                style={{ width: '100%' }}
              >
                <option value="">Select a practice text...</option>
                {practiceTexts.map((text, index) => (
                  <option key={index} value={text}>{text.substring(0, 50)}...</option>
                ))}
              </select>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            value={practiceText}
            onChange={(e) => setPracticeText(e.target.value)}
            placeholder="Type your own text or select from above..."
            className="minimal-input"
            style={{
              width: '100%',
              height: '120px',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.6'
            }}
          />

          {/* Controls */}
          {/* Recording Status */}
          {recordingStep !== 'ready' && (
            <div className={`state-${recordingStep === 'recording' ? 'error' :
                recordingStep === 'processing' ? 'warning' :
                  'success'
              }`} style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: 500
              }}>
              {recordingStep === 'recording' && '🔴 Recording... Speak clearly'}
              {recordingStep === 'processing' && '⏳ Processing your speech...'}
              {recordingStep === 'complete' && '✅ Analysis complete!'}
            </div>
          )}

          {/* Transcription Display */}
          {transcription && (
            <div className="state-info" style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: '12px',
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontWeight: 600 }}>🎤 What you said:</h4>
              <p style={{ margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>
                "{transcription}"
              </p>
            </div>
          )}

          <div style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={recordingStep === 'processing'}
              className={isRecording ? "minimal-button-primary" : "minimal-button-primary"}
              style={{
                backgroundColor: isRecording ? '#ef4444' : undefined,
                borderColor: isRecording ? '#ef4444' : undefined,
                flex: 1
              }}
            >
              {isRecording ? '🛑 Stop Recording' :
                recordingStep === 'processing' ? '⏳ Processing...' :
                  '🎤 Start Recording'}
            </button>

            {recordingStep === 'complete' && (
              <button
                onClick={() => {
                  setRecordingStep('ready');
                  setTranscription('');
                  setPracticeText('');
                  setAssessment(null);
                }}
                className="minimal-button-secondary"
              >
                🔄 Record Again
              </button>
            )}

            {practiceText && !isRecording && recordingStep !== 'processing' && (
              <button
                onClick={checkGrammar}
                disabled={isAnalyzing}
                className="minimal-button-secondary"
              >
                ✓ Check Grammar Only
              </button>
            )}
          </div>

          {/* Word Lookup */}
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border-light)' }}>
            <h4 style={{ marginBottom: '16px', fontWeight: 600 }}>📚 Vocabulary Helper</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                placeholder="Enter a word to look up..."
                className="minimal-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => lookupWord(selectedWord)}
                disabled={!selectedWord.trim()}
                className="minimal-button-secondary"
              >
                🔍 Look Up
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="minimal-card" style={{ padding: '32px' }}>
          <h3 className="minimal-subtitle" style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 600 }}>
            📊 Mission Analysis
          </h3>

          {isAnalyzing && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <div className="pulse-indicator" style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <div>Analyzing your speech...</div>
            </div>
          )}

          {!isAnalyzing && !assessment && !wordInfo && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-tertiary)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
              <div>Start recording or check grammar to see analysis results here.</div>
            </div>
          )}

          {assessment && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div className="animated-score" style={{
                  fontSize: '64px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1
                }}>
                  {assessment.overallScore}
                  <span style={{ fontSize: '24px', color: 'var(--text-tertiary)', fontWeight: 400 }}>/100</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Overall Score</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'Pronunciation', score: assessment.pronunciationScore, color: 'text-primary' },
                  { label: 'Grammar', score: assessment.grammarScore, color: 'accent-highlight' },
                  { label: 'Fluency', score: assessment.fluencyScore, color: 'text-primary' },
                  { label: 'Vocabulary', score: assessment.vocabularyScore, color: 'text-primary' }
                ].map((item, i) => (
                  <div key={i} style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
                      {item.score}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="natural-feedback" style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>💡 Feedback</h4>
                {Object.entries(assessment.feedback || {}).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '8px', fontSize: '15px' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{key}:</strong> {value as string}
                  </div>
                ))}
              </div>

              {assessment.improvements && assessment.improvements.length > 0 && (
                <div className="state-warning" style={{ padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#92400e' }}>🎯 Areas to Improve</h4>
                  {assessment.improvements.map((improvement: string, index: number) => (
                    <div key={index} style={{ marginBottom: '6px', fontSize: '14px' }}>
                      • {improvement}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {wordInfo && (
            <div className="fade-in" style={{
              marginTop: '32px',
              padding: '24px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-medium)'
            }}>
              <h4 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>📖 {wordInfo.word}</h4>

              {wordInfo.pronunciation && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Pronunciation:</strong> <span style={{ fontFamily: 'monospace', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{wordInfo.pronunciation.all || 'N/A'}</span>
                </div>
              )}

              {wordInfo.definitions && wordInfo.definitions.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Definition:</strong>
                  <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                    {wordInfo.definitions[0].definition}
                  </div>
                </div>
              )}

              {wordInfo.synonyms && wordInfo.synonyms.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Synonyms:</strong>
                  <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                    {wordInfo.synonyms.slice(0, 5).join(', ')}
                  </div>
                </div>
              )}

              {wordInfo.examples && wordInfo.examples.length > 0 && (
                <div>
                  <strong>Example:</strong>
                  <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{wordInfo.examples[0]}"
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnglishPractice;