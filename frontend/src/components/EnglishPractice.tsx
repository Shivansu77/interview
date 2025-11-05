import React, { useState, useRef } from 'react';

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
  
  const recognitionRef = useRef<any>(null);
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
      // Convert audio to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const audioData = reader.result?.toString().split(',')[1];
        
        // First, get speech-to-text transcription
        const transcriptResponse = await fetch('http://localhost:5003/api/ai/speech-to-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData })
        });
        
        const transcriptResult = await transcriptResponse.json();
        
        if (transcriptResult.success && transcriptResult.transcript) {
          setTranscription(transcriptResult.transcript);
          setPracticeText(transcriptResult.transcript);
          
          // Then get AI analysis of the transcribed text
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
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      color: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#4CAF50' }}>🗣️ English Speaking Practice</h1>
        <button onClick={onBack} style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          ← Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Practice Section */}
        <div>
          <h3 style={{ color: '#FF9800', marginBottom: '20px' }}>📝 Practice Text</h3>
          
          {/* Sample Texts */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px', display: 'block' }}>
              Choose a practice sentence:
            </label>
            <select
              onChange={(e) => setPracticeText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2a2a2a',
                color: 'white',
                border: '2px solid #4CAF50',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            >
              <option value="">Select a practice text...</option>
              {practiceTexts.map((text, index) => (
                <option key={index} value={text}>{text.substring(0, 50)}...</option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <textarea
            value={practiceText}
            onChange={(e) => setPracticeText(e.target.value)}
            placeholder="Type your own text or select from above..."
            style={{
              width: '100%',
              height: '120px',
              padding: '15px',
              backgroundColor: '#2a2a2a',
              color: 'white',
              border: '2px solid #4CAF50',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />

          {/* Controls */}
          {/* Recording Status */}
          {recordingStep !== 'ready' && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: recordingStep === 'recording' ? 'rgba(244, 67, 54, 0.1)' : 
                             recordingStep === 'processing' ? 'rgba(255, 152, 0, 0.1)' : 
                             'rgba(76, 175, 80, 0.1)',
              borderRadius: '10px',
              border: `2px solid ${recordingStep === 'recording' ? '#f44336' : 
                                   recordingStep === 'processing' ? '#FF9800' : 
                                   '#4CAF50'}`,
              textAlign: 'center'
            }}>
              <div style={{
                color: recordingStep === 'recording' ? '#f44336' : 
                       recordingStep === 'processing' ? '#FF9800' : 
                       '#4CAF50',
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '8px'
              }}>
                {recordingStep === 'recording' && '🔴 Recording... Speak clearly'}
                {recordingStep === 'processing' && '⏳ Processing your speech...'}
                {recordingStep === 'complete' && '✅ Analysis complete!'}
              </div>
            </div>
          )}

          {/* Transcription Display */}
          {transcription && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#2a2a2a',
              borderRadius: '10px',
              border: '2px solid #2196F3'
            }}>
              <h4 style={{ color: '#2196F3', marginBottom: '10px' }}>🎤 What you said:</h4>
              <p style={{ fontSize: '16px', lineHeight: '1.5', color: 'white', fontStyle: 'italic' }}>
                "{transcription}"
              </p>
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={recordingStep === 'processing'}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '50px',
                border: 'none',
                backgroundColor: isRecording ? '#f44336' : 
                               recordingStep === 'processing' ? '#666' : '#4CAF50',
                color: 'white',
                cursor: recordingStep === 'processing' ? 'not-allowed' : 'pointer',
                marginRight: '15px',
                boxShadow: isRecording ? '0 0 20px rgba(244, 67, 54, 0.5)' : '0 0 20px rgba(76, 175, 80, 0.3)'
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
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                🔄 Record Again
              </button>
            )}

            {practiceText && !isRecording && recordingStep !== 'processing' && (
              <button
                onClick={checkGrammar}
                disabled={isAnalyzing}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  marginLeft: '15px'
                }}
              >
                ✓ Check Grammar Only
              </button>
            )}
          </div>

          {/* Word Lookup */}
          <div style={{ marginTop: '30px' }}>
            <h4 style={{ color: '#FF9800', marginBottom: '15px' }}>📚 Vocabulary Helper</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                placeholder="Enter a word to look up..."
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#2a2a2a',
                  color: 'white',
                  border: '2px solid #FF9800',
                  borderRadius: '8px'
                }}
              />
              <button
                onClick={() => lookupWord(selectedWord)}
                disabled={!selectedWord.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedWord.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                🔍 Look Up
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>📊 Assessment Results</h3>
          
          {isAnalyzing && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#2a2a2a',
              borderRadius: '10px',
              border: '2px solid #FF9800'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
              <div style={{ color: '#FF9800', fontSize: '18px' }}>Analyzing your speech...</div>
            </div>
          )}

          {assessment && (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '20px',
              borderRadius: '10px',
              border: '2px solid #4CAF50'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4CAF50' }}>
                  {assessment.overallScore}/100
                </div>
                <div style={{ color: '#ccc' }}>Overall Score</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {assessment.pronunciationScore}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>Pronunciation</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                    {assessment.grammarScore}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>Grammar</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
                    {assessment.fluencyScore}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>Fluency</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
                    {assessment.vocabularyScore}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>Vocabulary</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>💡 Feedback</h4>
                {Object.entries(assessment.feedback || {}).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '5px', fontSize: '14px' }}>
                    <strong style={{ textTransform: 'capitalize', color: '#FF9800' }}>{key}:</strong> {value as string}
                  </div>
                ))}
              </div>

              {assessment.improvements && assessment.improvements.length > 0 && (
                <div style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                  <h4 style={{ color: '#f44336', marginBottom: '10px' }}>🎯 Areas to Improve</h4>
                  {assessment.improvements.map((improvement: string, index: number) => (
                    <div key={index} style={{ fontSize: '14px', marginBottom: '5px', color: '#ccc' }}>
                      • {improvement}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {wordInfo && (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '20px',
              borderRadius: '10px',
              border: '2px solid #FF9800',
              marginTop: '20px'
            }}>
              <h4 style={{ color: '#FF9800', marginBottom: '15px' }}>📖 {wordInfo.word}</h4>
              
              {wordInfo.pronunciation && (
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#4CAF50' }}>Pronunciation:</strong> {wordInfo.pronunciation.all || 'N/A'}
                </div>
              )}

              {wordInfo.definitions && wordInfo.definitions.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#4CAF50' }}>Definition:</strong>
                  <div style={{ marginTop: '5px', color: '#ccc' }}>
                    {wordInfo.definitions[0].definition}
                  </div>
                </div>
              )}

              {wordInfo.synonyms && wordInfo.synonyms.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#4CAF50' }}>Synonyms:</strong>
                  <div style={{ marginTop: '5px', color: '#ccc' }}>
                    {wordInfo.synonyms.slice(0, 5).join(', ')}
                  </div>
                </div>
              )}

              {wordInfo.examples && wordInfo.examples.length > 0 && (
                <div>
                  <strong style={{ color: '#4CAF50' }}>Example:</strong>
                  <div style={{ marginTop: '5px', color: '#ccc', fontStyle: 'italic' }}>
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