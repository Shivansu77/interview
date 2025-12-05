import React, { useState, useEffect, useRef, useCallback } from 'react';
import AIAssistant from './AIAssistant';

// Professional character data with enhanced styling
const CHARACTERS = [
  {
    name: 'Jesse Pinkman',
    voice: 'male',
    accent: 'american',
    avatar: '/jessepinkman.jpeg',
    color: '#ff6b6b',
    description: 'Chemistry Expert'
  },
  {
    name: 'Walter White',
    voice: 'male',
    accent: 'american',
    avatar: '/WalterWhite.webp',
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
    avatar: '🦸‍♂️',
    color: '#e74c3c',
    description: 'Anti-Hero'
  }
];

interface Message {
  sender: 'user' | 'character';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
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
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const userId = 'user123';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech synthesis voices
    const initVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Test voice functionality
        const testVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      }
    };

    // Load voices immediately
    initVoices();

    // Also listen for voice changes
    speechSynthesis.onvoiceschanged = () => {
      initVoices();
    };

    // Force voice loading
    if (speechSynthesis.getVoices().length === 0) {
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

  const loadChatHistory = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/ai/character-chat/history?userId=${userId}&character=${selectedCharacter}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setMessages([]);
    }
  }, [selectedCharacter, userId]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

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

  const speakMessage = (text: string, characterName: string, forceSpeak = false) => {
    if (!text) return;

    // Check if we should speak based on voice mode or force flag
    if (!voiceMode && !forceSpeak) return;

    setIsSpeaking(true);

    // Clean the text for natural speech
    const cleanText = cleanTextForSpeech(text);

    if (!cleanText) {
      setIsSpeaking(false);
      return;
    }

    // Use browser TTS directly for reliability
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = getCharacterVoice(characterName);

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

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current = utterance;

    // Small delay to ensure voices are loaded
    setTimeout(() => {
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
      const replyText = data.reply;

      // Simulate typing delay then start character typing animation
      setTimeout(() => {
        setLoading(false);

        // Add typing message
        const typingMessage: Message = {
          sender: 'character' as const,
          text: '',
          timestamp: new Date(),
          isTyping: true
        };

        setMessages(prev => [...prev, typingMessage]);

        // Start speaking immediately if voice mode is on
        if (voiceMode) {
          speakMessage(replyText, selectedCharacter);
        }

        // Type out message character by character
        let currentText = '';
        let charIndex = 0;

        const typeInterval = setInterval(() => {
          if (charIndex < replyText.length) {
            currentText += replyText[charIndex];
            charIndex++;

            setMessages(prev =>
              prev.map(msg =>
                msg.isTyping && msg.sender === 'character'
                  ? { ...msg, text: currentText }
                  : msg
              )
            );
          } else {
            // Typing complete
            clearInterval(typeInterval);
            setMessages(prev =>
              prev.map(msg =>
                msg.isTyping && msg.sender === 'character'
                  ? { ...msg, isTyping: false }
                  : msg
              )
            );
          }
        }, 30); // Typing speed
      }, 1000);

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
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    await sendTextMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container fade-in">
      <AIAssistant
        position="bottom-right"
        size={80}
        isListening={isRecording}
        isThinking={loading}
      />

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="minimal-title" style={{ fontSize: '2.5rem', margin: 0 }}>
          AI Persona Chat
        </h1>
        <p className="minimal-subtitle" style={{ marginTop: '8px' }}>
          Connect with AI personalities for immersive conversations
        </p>
      </div>

      <div className="minimal-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-secondary)',
            fontSize: '24px'
          }}>
            {selectedCharacter === 'Jesse Pinkman' ? (
              <img src="/jessepinkman.jpeg" alt="Jesse" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : selectedCharacter === 'Walter White' ? (
              <img src="/WalterWhite.webp" alt="Walter" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              CHARACTERS.find(c => c.name === selectedCharacter)?.avatar || '🎭'
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedCharacter}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {CHARACTERS.find(c => c.name === selectedCharacter)?.description || 'AI Personality'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="select-wrapper">
            <select
              value={selectedCharacter}
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="minimal-input"
              style={{ minWidth: '200px' }}
            >
              {CHARACTERS.map(char => (
                <option key={char.name} value={char.name}>
                  {char.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const newVoiceMode = !voiceMode;
              setVoiceMode(newVoiceMode);
              if (!newVoiceMode) stopSpeaking();
            }}
            className={`minimal-button-${voiceMode ? 'primary' : 'secondary'}`}
            style={{ minWidth: '100px' }}
          >
            {voiceMode ? '🔊 Voice ON' : '🔇 Voice OFF'}
          </button>
        </div>
      </div>

      <div className="minimal-card" style={{
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '75%',
                padding: '16px 20px',
                borderRadius: '16px',
                backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                color: msg.sender === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.sender === 'character' ? '4px' : '16px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.sender === 'character' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedCharacter}</span>
                    <button
                      onClick={() => speakMessage(msg.text, selectedCharacter, true)}
                      disabled={isSpeaking}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0 4px',
                        opacity: 0.7
                      }}
                    >
                      {isSpeaking ? '🔊' : '▶️'}
                    </button>
                  </div>
                )}
                <div style={{ lineHeight: '1.6' }}>
                  {msg.text}
                  {msg.isTyping && (
                    <span className="typing-cursor">|</span>
                  )}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  marginTop: '8px',
                  opacity: 0.7,
                  textAlign: 'right'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{
          padding: '24px',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="minimal-input"
              style={{ flex: 1 }}
              disabled={loading}
            />
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`minimal-button-${isRecording ? 'primary' : 'secondary'}`}
              style={{
                backgroundColor: isRecording ? '#ef4444' : undefined,
                borderColor: isRecording ? '#ef4444' : undefined,
                color: isRecording ? 'white' : undefined
              }}
            >
              {isRecording ? '🛑' : '🎤'}
            </button>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading}
              className="minimal-button-primary"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterChat;