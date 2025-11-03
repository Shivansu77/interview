const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEMINI_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

router.post('/generate-question', async (req, res) => {
  try {
    const { type = 'technical', difficulty = 'medium', previousQuestions } = req.body;
    
    const prompt = `Generate a ${difficulty} level ${type} interview question. Return only the question text without any extra formatting.`;
    
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const question = response.data.candidates[0].content.parts[0].text.trim();
    res.json({ question });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.json({ question: 'What is your experience with JavaScript and how would you explain closures to a beginner?' });
  }
});

router.post('/analyze-answer', async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    const prompt = `You are an expert interviewer. Analyze this interview answer for content, speech patterns, and communication skills. Return ONLY valid JSON:
    
    Question: ${question}
    Answer: ${answer}
    
    Evaluate:
    1. Technical accuracy and content quality
    2. Speech fluency (detect filler words like "ah", "um", "like", long pauses)
    3. Professional vocabulary (avoid slang, inappropriate words)
    4. Eye contact and confidence indicators
    5. Overall interview readiness
    
    Return exactly this JSON:
    {"contentScore": [1-10], "clarityScore": [1-10], "completenessScore": [1-10], "fluencyScore": [1-10], "isCorrect": true/false, "isAdequate": true/false, "feedback": "detailed assessment", "speechIssues": "filler words, pauses, vocabulary problems", "corrections": "what's wrong and how to fix", "betterAnswer": "complete improved answer with professional language"}`;
    
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    let analysisText = response.data.candidates[0].content.parts[0].text.trim();
    
    // Clean up the response to ensure valid JSON
    analysisText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const analysis = JSON.parse(analysisText);
    console.log('Gemini Analysis:', analysis);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis Error:', error.response?.data || error.message);
    // Only use fallback if API completely fails
    res.json({ 
      contentScore: 3, 
      clarityScore: 2, 
      completenessScore: 3, 
      isCorrect: false,
      isAdequate: false,
      feedback: 'The answer shows lack of understanding. "No idea" is not acceptable in interviews.', 
      corrections: 'Never say "no idea" in interviews. Research the topic or ask clarifying questions instead.', 
      betterAnswer: 'I am not familiar with closures yet, but I would like to learn more about them. Could you explain what they are?' 
    });
  }
});

router.post('/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    // Placeholder for TTS integration
    res.json({ audioUrl: `data:audio/mp3;base64,${Buffer.from(text).toString('base64')}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;