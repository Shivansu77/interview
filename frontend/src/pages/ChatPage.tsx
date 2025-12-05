import React from 'react';
import CharacterChat from '../components/CharacterChat';
import Navbar from '../components/Navbar';

const ChatPage: React.FC = () => {

  return (
    <div className="page-transition">
      <Navbar />
      <CharacterChat />
    </div>
  );
};

export default ChatPage;