const cvController = require('./controllers/cvController');
const fs = require('fs');
const path = require('path');

// Mock Express Request/Response
const mockReq = (fileBuffer, originalName, mimetype) => ({
    file: {
        buffer: fileBuffer,
        originalname: originalName,
        mimetype: mimetype,
        size: fileBuffer.length
    }
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function testDirectParsing() {
    console.log('🧪 Testing CV Parsing Logic Directly...\n');

    try {
        // Create a dummy text file to test the .txt path (simplest verification of new code)
        const txtContent = `
    Jane Doe
    Senior React Engineer
    
    Skills: React, Redux, TypeScript, GraphQL
    Experience: 5 years at Tech Corp
    `;
        const txtBuffer = Buffer.from(txtContent);

        const req = mockReq(txtBuffer, 'resume.txt', 'text/plain');
        const res = mockRes();

        console.log('1. Calling parseCV with TXT file...');
        await cvController.parseCV(req, res);

        if (res.data && res.data.success) {
            console.log('✅ Success!');
            console.log('Profile:', JSON.stringify(res.data.profile, null, 2));

            if (res.data.profile.skills.includes('React')) {
                console.log('✅ AI Extraction Verified (React found in skills)');

                // Test Question Generation
                const aiService = require('./services/aiService');
                const question = aiService.generateCVQuestion(res.data.profile, 0);
                console.log('\n📝 Generated Question 1:', question);
                const question2 = aiService.generateCVQuestion(res.data.profile, 2);
                console.log('📝 Generated Question 2:', question2);

            } else {
                console.log('⚠️ AI Extraction ran but might have missed skills.');
            }
        } else {
            console.error('❌ Failed:', res.data || 'No response data');
        }

    } catch (error) {
        console.error('❌ Test Error:', error);
    }
}

testDirectParsing();
