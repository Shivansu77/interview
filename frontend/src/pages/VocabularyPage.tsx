import React from 'react';
import { useNavigate } from 'react-router-dom';
import VocabularyChallenge from '../components/VocabularyChallenge';
import Navbar from '../components/Navbar';

const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <Navbar />
      <VocabularyChallenge onBack={() => navigate('/dashboard')} />
    </div>
  );
};

export default VocabularyPage;