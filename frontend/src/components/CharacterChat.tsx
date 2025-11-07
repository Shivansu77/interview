import React, { useState, useEffect, useRef } from 'react';
import './CharacterChat.css';

interface Message {
  sender: 'user' | 'character';
  text: string;
  timestamp: Date;
}

const CharacterChat: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState('Tom Holland');
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          
          if (recordingTime >= 1) {
            await processAudioMessage(audioBlob);
          } else {
            alert('Recording too short. Please speak for at least 1 second.');
          }
        } else {
          alert('No audio recorded. Please try again.');
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 120) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 120000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const processAudioMessage = async (audioBlob: Blob) => {
    setLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const speechResponse = await fetch('http://localhost:5003/api/ai/speech-to-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData: base64Audio })
        });
        
        const speechData = await speechResponse.json();
        
        if (speechData.success && speechData.transcript && speechData.transcript.trim().length > 0) {
          await sendTextMessage(speechData.transcript);
        } else if (speechData.transcript && speechData.transcript.trim().length > 0) {
          await sendTextMessage(speechData.transcript);
        } else {
          const errorMsg = speechData.error || 'Could not understand the audio';
          alert(`${errorMsg}. Try speaking more clearly or check your microphone.`);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCharacterVoice = (characterName: string) => {
    const voices = speechSynthesis.getVoices();
    const character = characters.find(c => c.name === characterName);
    
    if (!character) return voices[0];
    
    // Enhanced male voice detection patterns
    const malePatterns = [
      'male', 'man', 'masculine', 'deep', 'low',
      'david', 'daniel', 'alex', 'tom', 'fred', 'arthur', 'james', 'john', 'michael',
      'google male', 'microsoft david', 'apple alex', 'samantha', 'karen'
    ];
    
    // Priority 1: High-quality male voices (Google, Microsoft, Apple)
    let preferredVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      const isHighQuality = name.includes('google') || name.includes('microsoft') || name.includes('apple') || name.includes('enhanced');
      const isMale = malePatterns.some(pattern => name.includes(pattern));
      
      if (isHighQuality && isMale && voice.lang.startsWith('en')) return true;
      return false;
    });
    
    // Priority 2: Male voices with accent match
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        const isMale = malePatterns.some(pattern => name.includes(pattern));
        
        if (character.accent === 'british' && (lang.includes('gb') || lang.includes('uk')) && isMale) return true;
        if (character.accent === 'american' && (lang.includes('us') || lang.includes('en-us')) && isMale) return true;
        if (character.accent === 'irish' && lang.includes('ie') && isMale) return true;
        
        return false;
      });
    }
    
    // Priority 3: Any male English voice
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const isMale = malePatterns.some(pattern => name.includes(pattern));
        return voice.lang.startsWith('en') && isMale;
      });
    }
    
    // Priority 4: Best quality English voice (any gender)
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => {
        const name = voice.name.toLowerCase();
        const isHighQuality = name.includes('google') || name.includes('microsoft') || name.includes('enhanced') || name.includes('premium');
        return voice.lang.startsWith('en') && isHighQuality;
      });
    }
    
    // Priority 5: Any English voice
    if (!preferredVoice) {
      preferredVoice = voices.find(voice => voice.lang.startsWith('en'));
    }
    
    return preferredVoice || voices[0];
  };

  const cleanTextForSpeech = (text: string) => {
    return text
      // Remove markdown-style links and keep only the word
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Replace common abbreviations with full words
      .replace(/\bpplx\b/gi, '')
      .replace(/\bAPI\b/g, 'A P I')
      .replace(/\bURL\b/g, 'U R L')
      .replace(/\bHTML\b/g, 'H T M L')
      .replace(/\bCSS\b/g, 'C S S')
      .replace(/\bJS\b/g, 'JavaScript')
      // Add natural pauses
      .replace(/\./g, '. ')
      .replace(/\!/g, '! ')
      .replace(/\?/g, '? ')
      .replace(/\,/g, ', ')
      .replace(/\;/g, '; ')
      .replace(/\:/g, ': ')
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speakMessage = (text: string, characterName: string) => {
    console.log('Speaking:', text, 'Character:', characterName, 'Voice Mode:', voiceMode);
    
    if (!voiceMode) {
      console.log('Voice mode is off');
      return;
    }
    
    // Stop any ongoing speech
    speechSynthesis.cancel();
    setIsSpeaking(true);
    
    // Clean the text for natural speech
    const cleanText = cleanTextForSpeech(text);
    console.log('Cleaned text:', cleanText);
    
    // Use browser TTS directly for reliability
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voice = getCharacterVoice(characterName);
    
    console.log('Selected voice:', voice?.name, voice?.lang);
    
    utterance.voice = voice;
    
    // Slower, more natural character-specific settings
    const settings = {
      'Jesse Pinkman': { rate: 0.85, pitch: 1.0, volume: 1 },
      'Walter White': { rate: 0.75, pitch: 0.9, volume: 1 },
      'Tom Holland': { rate: 0.8, pitch: 1.0, volume: 1 },
      'Cillian Murphy': { rate: 0.8, pitch: 0.95, volume: 1 },
      'Deadpool': { rate: 0.9, pitch: 1.0, volume: 1 }
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
    <div className="character-chat">
      <div className="chat-header">
        <div className="header-left">
          <h2>🎭 Voice Character Chat</h2>
          <div className="character-info">
            <span className="character-avatar">
              {characters.find(c => c.name === selectedCharacter)?.avatar || '🎭'}
            </span>
            <select 
              value={selectedCharacter} 
              onChange={(e) => setSelectedCharacter(e.target.value)}
              className="character-select"
            >
              {characters.map(char => (
                <option key={char.name} value={char.name}>{char.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="header-controls">
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            className={`voice-toggle ${voiceMode ? 'active' : ''}`}
            title={voiceMode ? 'Voice Mode ON' : 'Voice Mode OFF'}
          >
            {voiceMode ? '🔊' : '🔇'} Voice {voiceMode ? 'ON' : 'OFF'}
          </button>
          
          {isSpeaking && (
            <button onClick={stopSpeaking} className="stop-speaking">
              ⏹️ Stop
            </button>
          )}
          
          <button
            onClick={() => speakMessage('Hello, this is a test message', selectedCharacter)}
            className="test-voice"
            disabled={isSpeaking}
            title="Test voice"
          >
            🎵 Test
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-bubble">
              {msg.sender === 'character' && (
                <div className="character-header">
                  <span className="character-avatar">
                    {characters.find(c => c.name === selectedCharacter)?.avatar || '🎭'}
                  </span>
                  <span className="character-name">{selectedCharacter}</span>
                  <button
                    onClick={() => speakMessage(msg.text, selectedCharacter)}
                    className="speak-button"
                    disabled={isSpeaking}
                    title="Listen to message"
                  >
                    {isSpeaking ? '🔊' : '🎵'}
                  </button>
                </div>
              )}
              <div 
                className="message-text"
                dangerouslySetInnerHTML={{ __html: renderMessageText(msg.text) }}
              />
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message character">
            <div className="message-bubble">
              <div className="character-header">
                <span className="character-avatar">
                  {characters.find(c => c.name === selectedCharacter)?.avatar || '🎭'}
                </span>
                <span className="character-name">{selectedCharacter}</span>
              </div>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        
        {isSpeaking && (
          <div className="speaking-indicator">
            <div className="sound-waves">
              <span></span><span></span><span></span><span></span>
            </div>
            <span>🎵 {selectedCharacter} is speaking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Chat with ${selectedCharacter}...`}
          rows={2}
          disabled={isRecording}
        />
        <div className="input-buttons">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? 'Click to stop recording' : 'Hold and speak clearly'}
          >
            {isRecording ? `🔴 ${formatTime(recordingTime)}` : '🎤 Record (2min max)'}
          </button>
          <button onClick={sendMessage} disabled={loading || !inputMessage.trim() || isRecording}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterChat;