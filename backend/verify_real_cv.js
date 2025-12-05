const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://localhost:5003/api';

async function verifyRealCVParsing() {
    console.log('🧪 Verifying Real CV Parsing...\n');

    try {
        // 1. Create a dummy TXT file for testing
        const dummyTxtPath = path.join(__dirname, 'test_resume.txt');
        const resumeContent = `
    John Doe
    Senior Python Developer
    
    Experience:
    5 years working with Python, Django, and Flask.
    Specialized in backend API development and data processing.
    
    Skills:
    - Python
    - Django
    - PostgreSQL
    - Redis
    - AWS
    
    Projects:
    - E-commerce Backend: Built a scalable API handling 10k req/s using Django REST Framework.
    - Data Pipeline: Created an ETL pipeline processing 1TB data daily.
    
    Education:
    BS Computer Science, Tech University
    `;

        fs.writeFileSync(dummyTxtPath, resumeContent);

        const form = new FormData();
        form.append('cv', fs.createReadStream(dummyTxtPath));

        console.log('1. Uploading dummy TXT...');
        const response = await axios.post(`${BASE_URL}/cv/parse`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log('✅ Upload successful');
        console.log('Parsed Profile:', JSON.stringify(response.data.profile, null, 2));
        console.log('Extracted Text Length:', response.data.extractedText.length);

        if (response.data.profile.skills.includes('Python') || response.data.profile.skills.includes('Django')) {
            console.log('✅ AI Profile Extraction Verified!');
        } else {
            console.log('⚠️ AI Extraction might have failed.');
        }

        // Clean up
        fs.unlinkSync(dummyTxtPath);

    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
}

verifyRealCVParsing();
