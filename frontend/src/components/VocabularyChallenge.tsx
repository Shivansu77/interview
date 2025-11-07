import React, { useState, useEffect } from 'react';

interface VocabularyProps {
  onBack: () => void;
}

const VocabularyChallenge: React.FC<VocabularyProps> = ({ onBack }) => {
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [randomWord, setRandomWord] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('vocabulary');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchWord, setSearchWord] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const wordTypes = [
    { value: 'vocabulary', label: '📚 Vocabulary', icon: '📚' },
    { value: 'noun', label: '🏷️ Nouns', icon: '🏷️' },
    { value: 'verb', label: '⚡ Verbs', icon: '⚡' },
    { value: 'adjective', label: '🎨 Adjectives', icon: '🎨' },
    { value: 'idiom', label: '💭 Idioms', icon: '💭' },
    { value: 'sentence', label: '📝 Sentences', icon: '📝' }
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await Promise.all([
        fetchDailyChallenge(),
        fetchRandomWord()
      ]);
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/english/vocabulary/daily-challenge');
      const data = await response.json();
      setDailyChallenge(data.dailyChallenge);
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      // Fallback data
      setDailyChallenge({
        vocabulary: { word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing', pronunciation: 'El-uh-kwuhnt' },
        idiom: { phrase: 'Break the ice', definition: 'To initiate conversation in a social setting' },
        sentence: { text: 'Effective communication requires practice and confidence.', definition: 'Good speaking skills need regular training' }
      });
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
      // Fallback data based on type with randomization
      const fallbackSets: { [key: string]: any[] } = {
        vocabulary: [
          { word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically', pronunciation: 'Prag-mat-ik', type: 'vocabulary' },
          { word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing', pronunciation: 'El-uh-kwuhnt', type: 'vocabulary' },
          { word: 'Versatile', definition: 'Able to adapt to many different functions', pronunciation: 'Vur-suh-tl', type: 'vocabulary' },
          { word: 'Tenacious', definition: 'Tending to keep a firm hold; persistent', pronunciation: 'Ti-nay-shuhs', type: 'vocabulary' }
        ],
        noun: [
          { word: 'Excellence', definition: 'The quality of being outstanding or extremely good', pronunciation: 'Ek-suh-luhns', type: 'noun' },
          { word: 'Innovation', definition: 'The action or process of innovating new methods', pronunciation: 'In-uh-vay-shuhn', type: 'noun' },
          { word: 'Opportunity', definition: 'A set of circumstances that makes something possible', pronunciation: 'Op-er-too-ni-tee', type: 'noun' },
          { word: 'Resilience', definition: 'The capacity to recover quickly from difficulties', pronunciation: 'Ri-zil-yuhns', type: 'noun' }
        ],
        verb: [
          { word: 'Accomplish', definition: 'Achieve or complete successfully', pronunciation: 'Uh-kom-plish', type: 'verb' },
          { word: 'Demonstrate', definition: 'Clearly show the existence or truth of something', pronunciation: 'Dem-uhn-strayt', type: 'verb' },
          { word: 'Collaborate', definition: 'Work jointly on an activity or project', pronunciation: 'Kuh-lab-uh-rayt', type: 'verb' },
          { word: 'Facilitate', definition: 'Make an action or process easier', pronunciation: 'Fuh-sil-i-tayt', type: 'verb' }
        ],
        adjective: [
          { word: 'Exceptional', definition: 'Unusually good; outstanding', pronunciation: 'Ik-sep-shuh-nl', type: 'adjective' },
          { word: 'Innovative', definition: 'Featuring new methods; advanced and original', pronunciation: 'In-uh-vay-tiv', type: 'adjective' },
          { word: 'Comprehensive', definition: 'Complete and including everything necessary', pronunciation: 'Kom-pri-hen-siv', type: 'adjective' },
          { word: 'Analytical', definition: 'Using analysis or logical reasoning', pronunciation: 'An-uh-lit-i-kuhl', type: 'adjective' }
        ],
        idiom: [
          { word: 'Think outside the box', definition: 'To think creatively and unconventionally', pronunciation: 'Thingk owt-sahyd thee boks', type: 'idiom' },
          { word: 'Hit the ground running', definition: 'To start something energetically', pronunciation: 'Hit thee grownd ruhn-ing', type: 'idiom' },
          { word: 'Break new ground', definition: 'To do something innovative or pioneering', pronunciation: 'Brayk noo grownd', type: 'idiom' },
          { word: 'Bridge the gap', definition: 'Connect two different things or groups', pronunciation: 'Brij thee gap', type: 'idiom' }
        ],
        sentence: [
          { word: 'Success requires dedication and continuous learning.', definition: 'Achievement demands commitment and ongoing education', pronunciation: 'Suhk-ses ri-kwahyerz ded-i-kay-shuhn', type: 'sentence' },
          { word: 'Innovation drives progress in every industry.', definition: 'New ideas fuel advancement across all sectors', pronunciation: 'In-uh-vay-shuhn drahyvz prog-res', type: 'sentence' },
          { word: 'Collaboration enhances creativity and problem-solving.', definition: 'Working together improves innovative thinking', pronunciation: 'Kuh-lab-uh-ray-shuhn en-han-siz', type: 'sentence' },
          { word: 'Technology transforms how we work and communicate.', definition: 'Digital tools change our work methods', pronunciation: 'Tek-nol-uh-jee trans-fawrmz how wee wurk', type: 'sentence' }
        ]
      };
      const wordSet = fallbackSets[type] || fallbackSets.vocabulary;
      const randomWord = wordSet[Math.floor(Math.random() * wordSet.length)];
      setRandomWord(randomWord);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    fetchRandomWord(type);
  };

  const searchWordDefinition = async () => {
    if (!searchWord.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:5003/api/english/vocabulary/search/${searchWord.trim()}`);
      const data = await response.json();
      setSearchResult(data);
    } catch (error) {
      console.error('Error searching word:', error);
      setSearchResult({ success: false, error: 'Search failed' });
    } finally {
      setIsSearching(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Use a more natural voice if available
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser');
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
          ) : isInitialLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
              <p>Loading today's challenge...</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#f44336' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>❌</div>
              <p>Failed to load challenge. Using fallback data.</p>
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

          {/* Word Search */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #9C27B0',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#9C27B0', marginBottom: '15px' }}>🔍 Dictionary Search</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchWordDefinition()}
                placeholder="Enter any word to get definition..."
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #555',
                  backgroundColor: '#1a1a1a',
                  color: 'white'
                }}
              />
              <button
                onClick={searchWordDefinition}
                disabled={isSearching || !searchWord.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  opacity: isSearching ? 0.7 : 1
                }}
              >
                {isSearching ? '🔄' : '🔍'} Search
              </button>
            </div>
            
            {searchResult && (
              <div style={{
                backgroundColor: '#1a1a1a',
                padding: '15px',
                borderRadius: '8px',
                border: searchResult.success ? '1px solid #4CAF50' : '1px solid #f44336'
              }}>
                {searchResult.success ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h5 style={{ color: '#4CAF50', margin: 0, fontSize: '18px' }}>{searchResult.word}</h5>
                      {searchResult.phonetic && (
                        <span style={{ color: '#FF9800', fontSize: '14px' }}>/{searchResult.phonetic}/</span>
                      )}
                      {searchResult.audio && (
                        <button
                          onClick={() => playAudio(searchResult.audio)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🔊 Audio
                        </button>
                      )}
                    </div>
                    {searchResult.meanings?.map((meaning: any, index: number) => (
                      <div key={index} style={{ marginBottom: '10px' }}>
                        <div style={{ color: '#2196F3', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                          {meaning.partOfSpeech}
                        </div>
                        {meaning.definitions?.map((def: any, defIndex: number) => (
                          <div key={defIndex} style={{ marginBottom: '8px', paddingLeft: '10px' }}>
                            <div style={{ color: '#ccc', fontSize: '14px' }}>{def.definition}</div>
                            {def.example && (
                              <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic', marginTop: '3px' }}>
                                Example: "{def.example}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#f44336', fontSize: '14px' }}>
                    ❌ {searchResult.error || 'Word not found'}
                  </div>
                )}
              </div>
            )}
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
              <li>Use the dictionary search to explore new words</li>
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