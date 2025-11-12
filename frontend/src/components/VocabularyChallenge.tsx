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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/english/vocabulary/daily-challenge');
      const data = await response.json();
      setDailyChallenge(data.dailyChallenge);
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
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
      const fallbackSets: { [key: string]: any[] } = {
        vocabulary: [
          { word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically', pronunciation: 'Prag-mat-ik', type: 'vocabulary' },
          { word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing', pronunciation: 'El-uh-kwuhnt', type: 'vocabulary' }
        ],
        noun: [
          { word: 'Excellence', definition: 'The quality of being outstanding or extremely good', pronunciation: 'Ek-suh-luhns', type: 'noun' },
          { word: 'Innovation', definition: 'The action or process of innovating new methods', pronunciation: 'In-uh-vay-shuhn', type: 'noun' }
        ],
        verb: [
          { word: 'Accomplish', definition: 'Achieve or complete successfully', pronunciation: 'Uh-kom-plish', type: 'verb' },
          { word: 'Demonstrate', definition: 'Clearly show the existence or truth of something', pronunciation: 'Dem-uhn-strayt', type: 'verb' }
        ],
        adjective: [
          { word: 'Exceptional', definition: 'Unusually good; outstanding', pronunciation: 'Ik-sep-shuh-nl', type: 'adjective' },
          { word: 'Innovative', definition: 'Featuring new methods; advanced and original', pronunciation: 'In-uh-vay-tiv', type: 'adjective' }
        ],
        idiom: [
          { word: 'Think outside the box', definition: 'To think creatively and unconventionally', pronunciation: 'Thingk owt-sahyd thee boks', type: 'idiom' },
          { word: 'Hit the ground running', definition: 'To start something energetically', pronunciation: 'Hit thee grownd ruhn-ing', type: 'idiom' }
        ],
        sentence: [
          { word: 'Success requires dedication and continuous learning.', definition: 'Achievement demands commitment and ongoing education', pronunciation: 'Suhk-ses ri-kwahyerz ded-i-kay-shuhn', type: 'sentence' },
          { word: 'Innovation drives progress in every industry.', definition: 'New ideas fuel advancement across all sectors', pronunciation: 'In-uh-vay-shuhn drahyvz prog-res', type: 'sentence' }
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

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
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
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      color: 'white',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px 0' }}>
        <h1 style={{ color: '#10b981', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>📚 Vocabulary Challenge</h1>
        <button onClick={onBack} style={{
          padding: '12px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          ← Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Daily Challenge */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #444'
        }}>
          <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>🌟 Daily Challenge</h2>
          {isInitialLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📚</div>
              <div>Loading vocabulary...</div>
            </div>
          ) : dailyChallenge ? (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#FF9800' }}>📚 Word of the Day</h3>
                <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {dailyChallenge.vocabulary?.word}
                  </div>
                  <div style={{ color: '#ccc', marginTop: '5px' }}>
                    {dailyChallenge.vocabulary?.pronunciation}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    {dailyChallenge.vocabulary?.definition}
                  </div>
                  <button
                    onClick={() => speakWord(dailyChallenge.vocabulary?.word || '')}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#FF9800' }}>💭 Idiom of the Day</h3>
                <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {dailyChallenge.idiom?.phrase}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    {dailyChallenge.idiom?.definition}
                  </div>
                  <button
                    onClick={() => speakWord(dailyChallenge.idiom?.phrase || '')}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>
              
              <div>
                <h3 style={{ color: '#FF9800' }}>📝 Sentence Practice</h3>
                <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                  <div style={{ fontSize: '16px', fontStyle: 'italic', color: '#4CAF50' }}>
                    "{dailyChallenge.sentence?.text}"
                  </div>
                  <div style={{ marginTop: '10px', color: '#ccc' }}>
                    {dailyChallenge.sentence?.definition}
                  </div>
                  <button
                    onClick={() => speakWord(dailyChallenge.sentence?.text || '')}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Failed to load daily challenge
            </div>
          )}
        </div>

        {/* Random Word Generator */}
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #444'
        }}>
          <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>🎲 Random Generator</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {wordTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  style={{
                    padding: '12px',
                    backgroundColor: selectedType === type.value ? '#4CAF50' : '#333',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                >
                  {type.icon} {type.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🎲</div>
              <div>Generating word...</div>
            </div>
          ) : randomWord ? (
            <div style={{ backgroundColor: '#333', padding: '20px', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>
                {randomWord.word}
              </div>
              {randomWord.pronunciation && (
                <div style={{ color: '#ccc', marginBottom: '10px' }}>
                  Pronunciation: {randomWord.pronunciation}
                </div>
              )}
              <div style={{ marginBottom: '15px' }}>
                {randomWord.definition}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => speakWord(randomWord.word)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🔊 Pronounce
                </button>
                <button
                  onClick={() => fetchRandomWord(selectedType)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🎲 New Word
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Failed to load word
            </div>
          )}
        </div>
      </div>

      {/* Dictionary Search */}
      <div style={{
        marginTop: '30px',
        backgroundColor: '#2a2a2a',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #444'
      }}>
        <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>🔍 Dictionary Search</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchWordDefinition()}
            placeholder="Enter a word to search..."
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#333',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
          <button
            onClick={searchWordDefinition}
            disabled={isSearching || !searchWord.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: isSearching ? '#666' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSearching ? 'not-allowed' : 'pointer'
            }}
          >
            {isSearching ? '🔍' : '🔍'} {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {searchResult && (
          <div style={{ backgroundColor: '#333', padding: '20px', borderRadius: '8px' }}>
            {searchResult.success ? (
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '10px' }}>
                  {searchResult.word}
                </div>
                {searchResult.phonetic && (
                  <div style={{ color: '#ccc', marginBottom: '10px' }}>
                    Pronunciation: {searchResult.phonetic}
                  </div>
                )}
                {searchResult.meanings && searchResult.meanings.map((meaning: any, index: number) => (
                  <div key={index} style={{ marginBottom: '15px' }}>
                    <div style={{ color: '#FF9800', fontWeight: 'bold' }}>
                      {meaning.partOfSpeech}
                    </div>
                    {meaning.definitions && meaning.definitions.slice(0, 2).map((def: any, defIndex: number) => (
                      <div key={defIndex} style={{ marginLeft: '20px', marginTop: '5px' }}>
                        • {def.definition}
                        {def.example && (
                          <div style={{ fontStyle: 'italic', color: '#ccc', marginTop: '3px' }}>
                            Example: "{def.example}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  onClick={() => speakWord(searchResult.word)}
                  style={{
                    marginTop: '10px',
                    padding: '10px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🔊 Pronounce
                </button>
              </div>
            ) : (
              <div style={{ color: '#f44336' }}>
                {searchResult.error || 'Word not found'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyChallenge;