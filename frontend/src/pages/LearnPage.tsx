import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LearnSection from '../components/LearnSection';
import Navbar from '../components/Navbar';

const LearnPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <Navbar />
      <LearnSection userId={user?.id || ''} />
    </div>
  );
};

export default LearnPage;