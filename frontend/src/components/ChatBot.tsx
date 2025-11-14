import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'character';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBotProps {
  character: 'interviewer' | 'mentor' | 'teacher' | 'friend';
  userId: string;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ character, userId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const characterInfo = {
    interviewer: { name: 'Alex', emoji: '👔', color: '#2196F3', bg: 'linear-gradient(135deg, #2196F3, #1976D2)' },
    mentor: { name: 'Sarah', emoji: '🎯', color: '#4CAF50', bg: 'linear-gradient(135deg, #4CAF50, #388E3C)' },
    teacher: { name: 'Emma', emoji: '📚', color: '#FF9800', bg: 'linear-gradient(135deg, #FF9800, #F57C00)' },
    friend: { name: 'Jesse', emoji: '/jessepinkman.jpeg', color: '#9C27B0', bg: 'linear-gradient(135deg, #9C27B0, #7B1FA2)' }
  };

  const currentChar = characterInfo[character];

  useEffect(() => {
    // Initial greeting
    const greeting = {
      id: Date.now().toString(),
      sender: 'character' as const,
      text: `Hi! I'm ${currentChar.name}, your ${character}. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([greeting]);
  }, [character, currentChar.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5003/api/ai/character-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          character,
          userMessage: userMessage.text
        })
      });

      const data = await response.json();
      const replyText = data.reply || 'I understand. That\'s a great point!';

      // Simulate realistic typing with character-by-character animation
      setTimeout(() => {
        setIsTyping(false);
        
        // Add empty message that will be typed out
        const typingMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'character',
          text: '',
          timestamp: new Date(),
          isTyping: true
        };
        
        setMessages(prev => [...prev, typingMessage]);
        
        // Type out the message character by character
        let currentText = '';
        let charIndex = 0;
        
        const typeInterval = setInterval(() => {
          if (charIndex < replyText.length) {
            currentText += replyText[charIndex];
            charIndex++;
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === typingMessage.id 
                  ? { ...msg, text: currentText }
                  : msg
              )
            );
          } else {
            // Typing complete
            clearInterval(typeInterval);
            setMessages(prev => 
              prev.map(msg => 
                msg.id === typingMessage.id 
                  ? { ...msg, isTyping: false }
                  : msg
              )
            );
            setIsSending(false);
          }
        }, 50); // Typing speed: 50ms per character
      }, 800);

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '600px',
      backgroundColor: '#000',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
      border: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#fff',
        color: '#000',
        padding: '20px',
        borderRadius: '18px 18px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: character === 'friend' ? 'transparent' : '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            overflow: 'hidden',
            border: character === 'friend' ? '2px solid #000' : 'none'
          }}>
            {character === 'friend' ? (
              <img 
                src="/jessepinkman.jpeg" 
                alt="Jesse Pinkman"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              currentChar.emoji
            )}
          </div>
          <div>
            <div style={{ color: '#000', fontWeight: 'bold', fontSize: '18px' }}>
              {currentChar.name}
            </div>
            <div style={{ color: '#666', fontSize: '14px', textTransform: 'capitalize' }}>
              {character} • Online
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#000',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: message.sender === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : (character === 'friend' ? 'transparent' : currentChar.bg),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0,
              border: '2px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              {message.sender === 'user' ? '👤' : (
                character === 'friend' ? (
                  <img 
                    src="/jessepinkman.jpeg" 
                    alt="Jesse Pinkman"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  currentChar.emoji
                )
              )}
            </div>

            {/* Message Bubble */}
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: message.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
              background: message.sender === 'user'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.4',
              border: message.sender === 'character' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              animation: 'messageSlideIn 0.3s ease-out',
              minHeight: message.isTyping ? '20px' : 'auto'
            }}>
              <span>{message.text}</span>
              {message.isTyping && (
                <span style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '16px',
                  backgroundColor: currentChar.color,
                  marginLeft: '2px',
                  animation: 'blink 1s infinite'
                }} />
              )}
              <div style={{
                fontSize: '11px',
                opacity: 0.7,
                marginTop: '5px',
                textAlign: message.sender === 'user' ? 'right' : 'left'
              }}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: character === 'friend' ? 'transparent' : currentChar.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden'
            }}>
              {character === 'friend' ? (
                <img 
                  src="/jessepinkman.jpeg" 
                  alt="Jesse Pinkman"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                currentChar.emoji
              )}
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '20px 20px 20px 5px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentChar.color,
                animation: 'typing 1.4s infinite ease-in-out'
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentChar.color,
                animation: 'typing 1.4s infinite ease-in-out 0.2s'
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: currentChar.color,
                animation: 'typing 1.4s infinite ease-in-out 0.4s'
              }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #333',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${currentChar.name}...`}
            disabled={isSending}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '25px',
              border: '2px solid #333',
              background: '#1a1a1a',
              color: 'white',
              fontSize: '14px',
              resize: 'none',
              minHeight: '20px',
              maxHeight: '80px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = currentChar.color}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isSending}
            style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              border: 'none',
              background: inputMessage.trim() && !isSending ? currentChar.bg : '#333',
              color: 'white',
              cursor: inputMessage.trim() && !isSending ? 'pointer' : 'not-allowed',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: inputMessage.trim() && !isSending ? '0 4px 15px rgba(0, 0, 0, 0.3)' : 'none'
            }}
          >
            {isSending ? '⏳' : '➤'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        
        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;