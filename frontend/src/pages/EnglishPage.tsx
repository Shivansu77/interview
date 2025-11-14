import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnglishPractice from '../components/EnglishPractice';
import Navbar from '../components/Navbar';

const EnglishPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <Navbar />
      <EnglishPractice onBack={() => navigate('/dashboard')} />
    </div>
  );
};

export default EnglishPage;