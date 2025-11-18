import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnglishPractice from '../components/EnglishPractice';
import Navbar from '../components/Navbar';

const EnglishPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="space-card" style={{ margin: '20px', padding: '20px' }}>
        <EnglishPractice onBack={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

export default EnglishPage;