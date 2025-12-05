import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnglishPractice from '../components/EnglishPractice';
import Navbar from '../components/Navbar';

const EnglishPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-transition" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <EnglishPractice onBack={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

export default EnglishPage;