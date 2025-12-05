import React from 'react';
import { useAuth } from '../context/AuthContext';
import LearnSection from '../components/LearnSection';
import Navbar from '../components/Navbar';

const LearnPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="page-transition" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <LearnSection userId={user?.id || ''} />
    </div>
  );
};

export default LearnPage;