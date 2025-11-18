import React from 'react';
import { useAuth } from '../context/AuthContext';
import LearnSection from '../components/LearnSection';
import Navbar from '../components/Navbar';

const LearnPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      <Navbar />
      <LearnSection userId={user?.id || ''} />
    </div>
  );
};

export default LearnPage;