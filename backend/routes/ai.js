const express = require('express');
const router = express.Router();
const {
  generateQuestion,
  analyzeAnswer,
  analyzeSpeech,
  characterChat,
  speechToText,
  textToSpeech,
  getChatHistory,
  saveChatMessage
} = require('../controllers/aiController');

// Generate Interview Questions
router.post('/generate-question', generateQuestion);

// Analyze Interview Answers
router.post('/analyze-answer', analyzeAnswer);

// Analyze Speech Pronunciation
router.post('/analyze-speech', analyzeSpeech);

// Character Chat
router.post('/character-chat', characterChat);

// Speech-to-Text Conversion
router.post('/speech-to-text', speechToText);

// Text-to-Speech
router.post('/text-to-speech', textToSpeech);

// Chat History Management
router.get('/character-chat/history', getChatHistory);
router.post('/character-chat/save', saveChatMessage);

// Test endpoints
router.post('/speech-to-text-fallback', (req, res) => {
  res.json({
    success: true,
    transcript: 'Hello, this is a test message from the fallback service.',
    confidence: 85,
    wordCount: 10
  });
});

router.post('/speech-to-text-test', (req, res) => {
  const { audioData } = req.body;
  
  if (!audioData || audioData.length < 1000) {
    return res.json({
      success: false,
      error: 'Audio data too short or missing',
      transcript: '',
      confidence: 0
    });
  }
  
  res.json({
    success: true,
    transcript: 'Test audio processed successfully',
    confidence: 90,
    wordCount: 4,
    audioSize: audioData.length
  });
});

module.exports = router;