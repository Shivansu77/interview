const axios = require('axios');

const BASE_URL = 'http://localhost:5003/api';

async function verifyCVIntegration() {
    console.log('🧪 Verifying CV Integration...\n');

    try {
        // 1. Mock a CV Profile
        const mockProfile = {
            name: 'Test Candidate',
            experience: '5 years in React',
            skills: ['React', 'Node.js', 'TypeScript'],
            projects: ['Dashboard App'],
            technologies: ['React', 'Redux'],
            achievements: ['Best Developer Award']
        };

        const interviewConfig = {
            mode: 'cv',
            profile: mockProfile,
            questionCount: 7
        };

        // 2. Start Session with Config
        console.log('1. Starting session with interviewConfig...');
        const startResponse = await axios.post(`${BASE_URL}/interview/start-session`, {
            userId: 'test-user',
            type: 'technical',
            company: 'general',
            difficulty: 'medium',
            interviewConfig
        });

        if (startResponse.data.success) {
            console.log('✅ Session started successfully. Session ID:', startResponse.data.sessionId);
        } else {
            throw new Error('Failed to start session');
        }

        const sessionId = startResponse.data.sessionId;

        // 3. Generate Question (should use CV context)
        console.log('\n2. Generating question (expecting CV context)...');
        const questionResponse = await axios.post(`${BASE_URL}/ai/generate-question`, {
            type: 'technical',
            company: 'general',
            difficulty: 'medium',
            context: 'interview',
            sessionId,
            interviewConfig
        });

        console.log('✅ Question generated:', questionResponse.data.question);
        console.log('   Source:', questionResponse.data.source);

        if (questionResponse.data.source === 'cv-profile' || questionResponse.data.question.includes('React')) {
            console.log('✅ Verification Successful: Question is relevant to CV profile.');
        } else {
            console.warn('⚠️ Verification Warning: Question might not be CV-specific. Check logs.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
}

verifyCVIntegration();
