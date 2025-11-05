import React, { useState, useEffect } from 'react';

interface VocabularyProps {
  onBack: () => void;
}

const VocabularyChallenge: React.FC<VocabularyProps> = ({ onBack }) => {
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [randomWord, setRandomWord] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('vocabulary');
  const [isLoading, setIsLoading] = useState(false);

  const wordTypes = [
    { value: 'vocabulary', label: '📚 Vocabulary', icon: '📚' },
    { value: 'noun', label: '🏷️ Nouns', icon: '🏷️' },
    { value: 'verb', label: '⚡ Verbs', icon: '⚡' },
    { value: 'adjective', label: '🎨 Adjectives', icon: '🎨' },
    { value: 'idiom', label: '💭 Idioms', icon: '💭' },
    { value: 'sentence', label: '📝 Sentences', icon: '📝' }
  ];

  useEffect(() => {
    fetchDailyChallenge();
    fetchRandomWord();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/english/vocabulary/daily-challenge');
      const data = await response.json();
      setDailyChallenge(data.dailyChallenge);
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    }
  };

  const fetchRandomWord = async (type = selectedType) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5003/api/english/vocabulary/random/${type}`);
      const data = await response.json();
      setRandomWord(data);
    } catch (error) {
      console.error('Error fetching random word:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    fetchRandomWord(type);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      speechSynthesis.speak(utterance);
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
        <h1 style={{ color: '#4CAF50' }}>📚 Vocabulary Challenge</h1>
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
        {/* Daily Challenge */}
        <div>
          <h3 style={{ color: '#FF9800', marginBottom: '20px' }}>🌟 Today's Challenge</h3>
          
          {dailyChallenge ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Vocabulary Word */}
              <div style={{
                backgroundColor: '#2a2a2a',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #4CAF50'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: '#4CAF50', margin: 0 }}>📚 Word of the Day</h4>
                  <button
                    onClick={() => speakWord(dailyChallenge.vocabulary.word)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔊 Listen
                  </button>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '5px' }}>
                  {dailyChallenge.vocabulary.word}
                </div>
                <div style={{ fontSize: '14px', color: '#FF9800', marginBottom: '10px' }}>
                  /{dailyChallenge.vocabulary.pronunciation}/
                </div>
                <div style={{ color: '#ccc' }}>
                  {dailyChallenge.vocabulary.definition}
                </div>
              </div>

              {/* Idiom */}
              <div style={{
                backgroundColor: '#2a2a2a',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #2196F3'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: '#2196F3', margin: 0 }}>💭 Idiom of the Day</h4>
                  <button
                    onClick={() => speakWord(dailyChallenge.idiom.phrase)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔊 Listen
                  </button>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196F3', marginBottom: '10px' }}>
                  "{dailyChallenge.idiom.phrase}"
                </div>
                <div style={{ color: '#ccc' }}>
                  {dailyChallenge.idiom.definition}
                </div>
              </div>

              {/* Practice Sentence */}
              <div style={{
                backgroundColor: '#2a2a2a',
                padding: '20px',
                borderRadius: '10px',
                border: '2px solid #FF9800'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: '#FF9800', margin: 0 }}>📝 Practice Sentence</h4>
                  <button
                    onClick={() => speakWord(dailyChallenge.sentence.text)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔊 Listen
                  </button>
                </div>
                <div style={{ fontSize: '18px', fontStyle: 'italic', color: '#FF9800', marginBottom: '10px' }}>
                  "{dailyChallenge.sentence.text}"
                </div>
                <div style={{ color: '#ccc' }}>
                  {dailyChallenge.sentence.definition}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
              <p>Loading today's challenge...</p>
            </div>
          )}
        </div>

        {/* Random Word Generator */}
        <div>
          <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>🎲 Random Word Generator</h3>
          
          {/* Word Type Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px', display: 'block' }}>
              Choose word type:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {wordTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  style={{
                    padding: '10px',
                    backgroundColor: selectedType === type.value ? '#4CAF50' : '#2a2a2a',
                    color: 'white',
                    border: `2px solid ${selectedType === type.value ? '#4CAF50' : '#444'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {type.icon} {type.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Random Word Display */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#2a2a2a', borderRadius: '10px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎲</div>
              <div style={{ color: '#4CAF50' }}>Generating random word...</div>
            </div>
          ) : randomWord ? (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '25px',
              borderRadius: '10px',
              border: '2px solid #4CAF50',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {randomWord.type}
                  </span>
                </div>
                <button
                  onClick={() => speakWord(randomWord.word)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🔊 Pronounce
                </button>
              </div>
              
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>
                {randomWord.word}
              </div>
              
              <div style={{ fontSize: '16px', color: '#FF9800', marginBottom: '15px' }}>
                /{randomWord.pronunciation}/
              </div>
              
              <div style={{ fontSize: '16px', color: '#ccc', lineHeight: '1.5' }}>
                {randomWord.definition}
              </div>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={() => fetchRandomWord(selectedType)}
              disabled={isLoading}
              style={{
                padding: '15px 25px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
            >
              🎲 New Word
            </button>
            
            <button
              onClick={fetchDailyChallenge}
              style={{
                padding: '15px 25px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
              }}
            >
              🔄 Refresh Challenge
            </button>
          </div>

          {/* Learning Tips */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #2196F3',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#2196F3', marginBottom: '15px' }}>💡 Learning Tips</h4>
            <ul style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Practice pronunciation by clicking the 🔊 button</li>
              <li>Try using new words in your own sentences</li>
              <li>Review the daily challenge every morning</li>
              <li>Focus on one word type at a time for better retention</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyChallenge;