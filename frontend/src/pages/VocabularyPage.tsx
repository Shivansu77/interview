import React from 'react';
import { useNavigate } from 'react-router-dom';
import VocabularyChallenge from '../components/VocabularyChallenge';
import Navbar from '../components/Navbar';

const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-transition" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <VocabularyChallenge onBack={() => navigate('/dashboard')} />
    </div>
  );
};

export default VocabularyPage;