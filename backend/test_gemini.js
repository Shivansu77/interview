const axios = require('axios');
const { API_CONFIG } = require('./config/constants');

async function testGemini() {
    console.log('Testing Gemini API URL:', API_CONFIG.GEMINI_URL);

    try {
        const response = await axios.post(API_CONFIG.GEMINI_URL, {
            contents: [{ parts: [{ text: "Hello, are you working?" }] }]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Success! Response:', response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error('Error testing Gemini API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testGemini();
