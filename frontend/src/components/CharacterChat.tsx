import React, { useState, useEffect, useRef } from 'react';
import './CharacterChat.css';



// Professional character data with enhanced styling
const CHARACTERS = [
  { 
    name: 'Jesse Pinkman', 
    voice: 'male', 
    accent: 'american', 
    avatar: '🧪',
    color: '#ff6b6b',
    description: 'Chemistry Expert'
  },
  { 
    name: 'Walter White', 
    voice: 'male', 
    accent: 'american', 
    avatar: '👨🏫',
    color: '#4ecdc4',
    description: 'Science Teacher'
  },
  { 
    name: 'Cillian Murphy', 
    voice: 'male', 
    accent: 'irish', 
    avatar: '🎭',
    color: '#45b7d1',
    description: 'Actor & Artist'
  },
  { 
    name: 'Tom Holland', 
    voice: 'male', 
    accent: 'british', 
    avatar: '🕷️',
    color: '#f39c12',
    description: 'British Actor'
  },
  { 
    name: 'Deadpool', 
    voice: 'male', 
    accent: 'american', 
    avatar: '🦸♂️',
    color: '#e74c3c',
    description: 'Anti-Hero'
  }
];

interface Message {
  sender: 'user' | 'character';
  text: string;
  timestamp: Date;
}

const CharacterChat: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState('Jesse Pinkman');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const characters = [
    { name: 'Jesse Pinkman', voice: 'male', accent: 'american', avatar: '🧑‍🔬' },
    { name: 'Walter White', voice: 'male', accent: 'american', avatar: '👨‍🏫' },
    { name: 'Cillian Murphy', voice: 'male', accent: 'irish', avatar: '🎭' },
    { name: 'Tom Holland', voice: 'male', accent: 'british', avatar: '🕷️' },
    { name: 'Deadpool', voice: 'male', accent: 'american', avatar: '🦸‍♂️' }
  ];

  const userId = 'user123';

  useEffect(() => {
    loadChatHistory();
  }, [selectedCharacter]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech synthesis voices
    const initVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Total voices available:', voices.length);
      
      if (voices.length > 0) {
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Test voice functionality
        const testVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        console.log('Test voice selected:', testVoice?.name);
      } else {
        console.log('No voices loaded yet, waiting...');
      }
    };
    
    // Load voices immediately
    initVoices();
    
    // Also listen for voice changes
    speechSynthesis.onvoiceschanged = () => {
      console.log('Voices changed, reloading...');
      initVoices();
    };
    
    // Force voice loading
    if (speechSynthesis.getVoices().length === 0) {
      console.log('Forcing voice load...');
      const utterance = new SpeechSynthesisUtterance('');
      speechSynthesis.speak(utterance);
      speechSynthesis.cancel();
    }
    
    return () => {
      speechSynthesis.cancel();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/ai/character-chat/history?userId=${userId}&character=${selectedCharacter}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            recognition.stop();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        sendTextMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      alert('Speech recognition failed. Please try again.');
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };

    recognition.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };



  const getCharacterVoice = (characterName: string) => {
    const voices = speechSynthesis.getVoices();
    
    // Prioritize male voices for all characters
    const maleVoices = [
      'Daniel', 'Aaron', 'Fred', 'Arthur', 'Gordon', 'Albert',
      'Eddy', 'Grandpa', 'Junior', 'Alex'
    ];
    
    // Find best male voice
    let preferredVoice = voices.find(voice => 
      maleVoices.some(male => voice.name.includes(male)) && voice.lang.startsWith('en')
    );
    
    // Character-specific voice preferences
    if (characterName === 'Tom Holland') {
      preferredVoice = voices.find(voice => 
        (voice.name.includes('Daniel') || voice.name.includes('Arthur')) && voice.lang.includes('GB')
      ) || preferredVoice;
    } else if (characterName === 'Cillian Murphy') {
      preferredVoice = voices.find(voice => 
        voice.name.includes('Daniel') && voice.lang.includes('GB')
      ) || preferredVoice;
    }
    
    // Fallback to any English male voice
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && !voice.name.toLowerCase().includes('female')
      );
    }
    
    return preferredVoice || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
  };

  const cleanTextForSpeech = (text: string) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/\{(.*?)\}/g, '$1')     // Remove {curly braces}
      .replace(/\[(.*?)\]/g, '$1')     // Remove [square brackets]
      .replace(/`(.*?)`/g, '$1')       // Remove `code`
      .replace(/#{1,6}\s/g, '')        // Remove # headers
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bURL\b/g, 'U R L')
      .replace(/\bHTML\b/g, 'H T M L')
      .replace(/\bCSS\b/g, 'C S S')
      .replace(/\bJS\b/g, 'JavaScript')
      .replace(/\n+/g, '. ')           // Replace newlines with periods
      .replace(/\s+/g, ' ')            // Clean multiple spaces
      .trim();
  };

  const speakMessage = (text: string, characterName: string) => {
    console.log('Speaking:', text, 'Character:', characterName, 'Voice Mode:', voiceMode);
    
    if (!voiceMode || !text) {
      console.log('Voice mode is off or no text');
      return;
    }
    
    setIsSpeaking(true);
    
    // Clean the text for natural speech
    const cleanText = cleanTextForSpeech(text);
    console.log('Cleaned text:', cleanText);
    
    if (!cleanText) {
      setIsSpeaking(false);
      return;
    }
    
    // Use browser TTS directly for reliability
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = getCharacterVoice(characterName);
    
    console.log('Selected voice:', voice?.name, voice?.lang);
    
    utterance.voice = voice;
    
    // Character-specific voice settings for male voices
    const settings = {
      'Jesse Pinkman': { rate: 0.9, pitch: 1.1, volume: 1 },
      'Walter White': { rate: 0.75, pitch: 0.8, volume: 1 },
      'Tom Holland': { rate: 0.85, pitch: 1.0, volume: 1 },
      'Cillian Murphy': { rate: 0.8, pitch: 0.9, volume: 1 },
      'Deadpool': { rate: 0.95, pitch: 1.1, volume: 1 }
    };
    
    const config = settings[characterName as keyof typeof settings] || { rate: 0.8, pitch: 1.0, volume: 1 };
    
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;
    
    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsSpeaking(false);
    };
    
    speechSynthRef.current = utterance;
    
    // Small delay to ensure voices are loaded
    setTimeout(() => {
      console.log('Starting speech synthesis');
      speechSynthesis.speak(utterance);
    }, 100);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const sendTextMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText.trim();
    setLoading(true);

    const userMsg: Message = { sender: 'user' as const, text: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('http://localhost:5003/api/ai/character-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          character: selectedCharacter,
          userMessage
        })
      });

      const data = await response.json();
      
      const characterMessage: Message = { 
        sender: 'character' as const, 
        text: data.reply, 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, characterMessage]);
      
      // Auto-speak character response if voice mode is on
      if (voiceMode) {
        console.log('Auto-speaking character response');
        setTimeout(() => {
          speakMessage(data.reply, selectedCharacter);
        }, 1000);
      }
      
      await fetch('http://localhost:5003/api/ai/character-chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          character: selectedCharacter,
          userMessage,
          characterReply: data.reply
        })
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Make sure backend is running on port 5003.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    await sendTextMessage(inputMessage);
    setInputMessage('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessageText = (text: string) => {
    return text.replace(/\[([^\]]+)\]\(pplx:\/\/action\/translate\)/g, 
      '<span class="highlighted-word" title="Click for translation">$1</span>'
    );
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      color: 'white',
      minHeight: '80vh'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        border: '1px solid #444'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px' }}>
            {CHARACTERS.find(c => c.name === selectedCharacter)?.avatar || '🧪'}
          </span>
          <div>
            <h2 style={{ margin: '0', color: '#4CAF50' }}>Character Chat</h2>
            <p style={{ margin: '5px 0 0 0', color: '#ccc', fontSize: '14px' }}>
              Chatting with {selectedCharacter}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <select 
            value={selectedCharacter} 
            onChange={(e) => setSelectedCharacter(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #444',
              backgroundColor: '#333',
              color: 'white',
              fontSize: '14px',
              minWidth: '180px'
            }}
          >
            {CHARACTERS.map(char => (
              <option key={char.name} value={char.name}>
                {char.avatar} {char.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: voiceMode ? '#4CAF50' : '#666',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {voiceMode ? '🔊 Voice ON' : '🔇 Voice OFF'}
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        minHeight: '400px',
        maxHeight: '500px',
        overflowY: 'auto',
        border: '1px solid #444'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '15px'
          }}>
            <div style={{
              maxWidth: '70%',
              padding: '15px',
              borderRadius: '12px',
              backgroundColor: msg.sender === 'user' ? '#4CAF50' : '#333',
              color: 'white'
            }}>
              {msg.sender === 'character' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #555'
                }}>
                  <span style={{ fontSize: '20px' }}>
                    {CHARACTERS.find(c => c.name === selectedCharacter)?.avatar || '🎭'}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedCharacter}</span>
                  <button
                    onClick={() => speakMessage(msg.text, selectedCharacter)}
                    disabled={isSpeaking}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {isSpeaking ? '🔊' : '▶️'}
                  </button>
                </div>
              )}
              <div style={{ lineHeight: '1.5' }}>
                {msg.text}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#ccc',
                marginTop: '8px',
                textAlign: 'right'
              }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '15px'
          }}>
            <div style={{
              padding: '15px',
              borderRadius: '12px',
              backgroundColor: '#333',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '20px' }}>
                  {CHARACTERS.find(c => c.name === selectedCharacter)?.avatar || '🎭'}
                </span>
                <span>Typing...</span>
              </div>
            </div>
          </div>
        )}
        
        {isSpeaking && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            backgroundColor: '#444',
            borderRadius: '8px',
            color: '#4CAF50',
            fontSize: '14px'
          }}>
            🔊 {selectedCharacter} is speaking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #444'
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Chat with ${selectedCharacter}...`}
          rows={3}
          disabled={isRecording}
          style={{
            width: 'calc(100% - 30px)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #444',
            backgroundColor: '#333',
            color: 'white',
            fontSize: '14px',
            resize: 'none',
            marginBottom: '15px',
            boxSizing: 'border-box'
          }}
        />
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between'
        }}>
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isRecording ? '#f44336' : '#FF9800',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              flex: '1'
            }}
          >
            {isRecording ? (
              <>⏹️ Stop ({formatTime(recordingTime)})</>
            ) : (
              <>🎤 Record Voice</>
            )}
          </button>
          <button 
            onClick={sendMessage} 
            disabled={loading || !inputMessage.trim() || isRecording}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              flex: '1'
            }}
          >
            📤 Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterChat;