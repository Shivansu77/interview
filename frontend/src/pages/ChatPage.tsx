import React from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterChat from '../components/CharacterChat';
import Navbar from '../components/Navbar';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <Navbar />
      <CharacterChat />
    </div>
  );
};

export default ChatPage;