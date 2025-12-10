import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InterviewRoom from '../components/InterviewRoom';
import { InterviewConfig } from '../components/InterviewModeSelector';

interface SessionData {
    userId: string;
    type: string;
    company: string;
    difficulty: string;
    interviewConfig: InterviewConfig;
    startedAt: string;
}

const InterviewRoomPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) return;

            try {
                const response = await fetch(`http://localhost:5003/api/interview/session/${sessionId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Session not found or expired');
                }

                const data = await response.json();
                setSessionData(data);
            } catch (err) {
                console.error('Error fetching session:', err);
                setError('Unable to load interview session. It may have expired.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    const handleEndInterview = () => {
        // Optional: Call API to end session
        navigate('/interview');
    };

    if (isLoading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="avatar-circle" style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 20px',
                        animation: 'pulse 2s infinite'
                    }}>
                        <div className="ai-core"></div>
                    </div>
                    <h3>Connecting to Mission Control...</h3>
                </div>
                <style>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          .ai-core {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #667eea, #764ba2);
            box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
          }
        `}</style>
            </div>
        );
    }

    if (error || !sessionData) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
                    <h2 style={{ marginBottom: '10px', color: '#dc2626' }}>Mission Error</h2>
                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>{error || 'Session data unavailable'}</p>
                    <button
                        onClick={() => navigate('/interview')}
                        className="minimal-button-primary"
                    >
                        Return to Base
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '20px', background: 'var(--bg-primary)' }}>
            <InterviewRoom
                sessionId={sessionId!}
                userId={user?.id || ''}
                interviewType={sessionData.type}
                company={sessionData.company}
                config={sessionData.interviewConfig}
            />

            <button
                onClick={handleEndInterview}
                className="space-button"
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    zIndex: 50,
                    cursor: 'pointer',
                    fontSize: '14px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--text-primary)'
                }}
            >
                ✕ End Mission
            </button>
        </div>
    );
};

export default InterviewRoomPage;
