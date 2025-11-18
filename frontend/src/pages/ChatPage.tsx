import React from 'react';
import CharacterChat from '../components/CharacterChat';
import Navbar from '../components/Navbar';

const ChatPage: React.FC = () => {

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <Navbar />
      <CharacterChat />
    </div>
  );
};

export default ChatPage;