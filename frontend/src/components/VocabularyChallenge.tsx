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
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="minimal-title" style={{ fontSize: '2.5rem', margin: 0 }}>Vocabulary Challenge</h1>
        <button onClick={onBack} className="minimal-button-secondary">
          ← Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Daily Challenge */}
        <div className="minimal-card" style={{ padding: '32px' }}>
          <h2 className="minimal-subtitle" style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 600 }}>
            🌟 Daily Challenge
          </h2>
          {isInitialLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📚</div>
              <div>Loading vocabulary...</div>
            </div>
          ) : dailyChallenge ? (
            <div className="fade-in">
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--accent-highlight)' }}>📚 Word of the Day</h3>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {dailyChallenge.vocabulary?.word}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'monospace' }}>
                    {dailyChallenge.vocabulary?.pronunciation}
                  </div>
                  <div style={{ marginTop: '12px', lineHeight: '1.6' }}>
                    {dailyChallenge.vocabulary?.definition}
                  </div>
                  <button
                    onClick={() => speakWord(dailyChallenge.vocabulary?.word || '')}
                    className="minimal-button-secondary"
                    style={{ marginTop: '16px', padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--accent-highlight)' }}>💭 Idiom of the Day</h3>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dailyChallenge.idiom?.phrase}
                  </div>
                  <div style={{ marginTop: '12px', lineHeight: '1.6' }}>
                    {dailyChallenge.idiom?.definition}
                  </div>
                  <button
                    onClick={() => speakWord(dailyChallenge.idiom?.phrase || '')}
                    className="minimal-button-secondary"
                    style={{ marginTop: '16px', padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--accent-highlight)' }}>📝 Sentence Practice</h3>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '16px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                    "{dailyChallenge.sentence?.text}"
                  </div>
                  <div style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                    {dailyChallenge.sentence?.definition}
                  </div>
                  <button
                    onClick={() => speakWord(dailyChallenge.sentence?.text || '')}
                    className="minimal-button-secondary"
                    style={{ marginTop: '16px', padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
              Failed to load daily challenge
            </div>
          )}
        </div>

        {/* Random Word Generator */}
        <div className="minimal-card" style={{ padding: '32px' }}>
          <h2 className="minimal-subtitle" style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 600 }}>
            🎲 Random Generator
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {wordTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={selectedType === type.value ? 'minimal-button-primary' : 'minimal-button-secondary'}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    justifyContent: 'center'
                  }}
                >
                  {type.icon} {type.label.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <div className="pulse-indicator" style={{ fontSize: '24px', marginBottom: '10px' }}>🎲</div>
              <div>Generating word...</div>
            </div>
          ) : randomWord ? (
            <div className="fade-in" style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {randomWord.word}
              </div>
              {randomWord.pronunciation && (
                <div style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontFamily: 'monospace' }}>
                  Pronunciation: {randomWord.pronunciation}
                </div>
              )}
              <div style={{ marginBottom: '24px', lineHeight: '1.6', fontSize: '1.1rem' }}>
                {randomWord.definition}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => speakWord(randomWord.word)}
                  className="minimal-button-secondary"
                >
                  🔊 Pronounce
                </button>
                <button
                  onClick={() => fetchRandomWord(selectedType)}
                  className="minimal-button-primary"
                >
                  🎲 New Word
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>
              Failed to load word
            </div>
          )}
        </div>
      </div>

      {/* Dictionary Search */}
      <div className="minimal-card" style={{ marginTop: '32px', padding: '32px' }}>
        <h2 className="minimal-subtitle" style={{ marginBottom: '24px', color: 'var(--text-primary)', fontWeight: 600 }}>
          🔍 Dictionary Search
        </h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchWordDefinition()}
            placeholder="Enter a word to search..."
            className="minimal-input"
            style={{ flex: 1 }}
          />
          <button
            onClick={searchWordDefinition}
            disabled={isSearching || !searchWord.trim()}
            className="minimal-button-primary"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResult && (
          <div className="fade-in" style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px' }}>
            {searchResult.success ? (
              <div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {searchResult.word}
                </div>
                {searchResult.phonetic && (
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontFamily: 'monospace' }}>
                    Pronunciation: {searchResult.phonetic}
                  </div>
                )}
                {searchResult.meanings && searchResult.meanings.map((meaning: any, index: number) => (
                  <div key={index} style={{ marginBottom: '24px' }}>
                    <div style={{
                      color: 'var(--accent-highlight)',
                      fontWeight: 600,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem',
                      letterSpacing: '0.05em'
                    }}>
                      {meaning.partOfSpeech}
                    </div>
                    {meaning.definitions && meaning.definitions.slice(0, 2).map((def: any, defIndex: number) => (
                      <div key={defIndex} style={{ marginLeft: '16px', marginTop: '8px', lineHeight: '1.6' }}>
                        • {def.definition}
                        {def.example && (
                          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Example: "{def.example}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  onClick={() => speakWord(searchResult.word)}
                  className="minimal-button-secondary"
                  style={{ marginTop: '8px' }}
                >
                  🔊 Pronounce
                </button>
              </div>
            ) : (
              <div className="state-error" style={{ padding: '16px', borderRadius: '8px' }}>
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