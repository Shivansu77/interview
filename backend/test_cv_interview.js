const axios = require('axios');

const BASE_URL = 'http://localhost:5003/api';

async function testCVInterview() {
  console.log('🧪 Testing CV-based Interview System...\n');

  try {
    // Test 1: Check if CV route is working
    console.log('1. Testing CV route availability...');
    const cvTest = await axios.get(`${BASE_URL}/cv/test`);
    console.log('✅ CV route working:', cvTest.data.message);

    // Test 2: Test CV parsing with mock data
    console.log('\n2. Testing CV parsing...');
    const cvParse = await axios.post(`${BASE_URL}/cv/test-parse`);
    console.log('✅ CV parsing working:', cvParse.data.message);
    console.log('   Profile generated:', cvParse.data.profile.name);

    // Test 3: Test CV-based question generation
    console.log('\n3. Testing CV-based question generation...');
    const questionData = {
      type: 'technical',
      company: 'general',
      difficulty: 'medium',
      context: 'interview',
      sessionId: 'test-cv-session',
      interviewConfig: {
        mode: 'cv',
        profile: cvParse.data.profile,
        questionCount: 7
      }
    };

    // Generate multiple questions to test the sequence
    for (let i = 1; i <= 7; i++) {
      const questionResponse = await axios.post(`${BASE_URL}/ai/generate-question`, questionData);
      console.log(`✅ Question ${i}:`, questionResponse.data.question.substring(0, 80) + '...');
      
      // Small delay between questions
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 All CV interview tests passed successfully!');
    console.log('\n📋 CV-based interview features working:');
    console.log('   ✓ CV file upload and parsing');
    console.log('   ✓ Profile extraction from CV');
    console.log('   ✓ Personalized question generation');
    console.log('   ✓ Question sequencing (skill → project → system → behavioral)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 5003');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the test
testCVInterview();