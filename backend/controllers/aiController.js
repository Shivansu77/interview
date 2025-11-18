const aiService = require('../services/aiService');

// Generate Interview Questions
const generateQuestion = async (req, res) => {
  try {
    const { type = 'technical', company = 'general', difficulty = 'medium', context = 'interview', sessionId, interviewConfig } = req.body;
    
    const result = await aiService.generateQuestion(type, company, difficulty, context, sessionId, interviewConfig);
    
    res.json(result);
  } catch (error) {
    console.error('Generate question error:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
};

// Analyze Interview Answers
const analyzeAnswer = async (req, res) => {
  try {
    const { question, answer, originalText } = req.body;
    
    const analysis = await aiService.analyzeAnswer(question, answer);
    
    // Add speech analysis if original text is provided
    if (originalText && originalText !== answer) {
      const speechAnalysis = aiService.analyzeSpeechErrors(originalText, answer);
      analysis.speechAnalysis = speechAnalysis;
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Analyze answer error:', error);
    res.status(500).json({ error: 'Failed to analyze answer' });
  }
};

// Analyze Speech Pronunciation
const analyzeSpeech = async (req, res) => {
  try {
    const { originalText, spokenText } = req.body;
    
    if (!originalText || !spokenText) {
      return res.status(400).json({ error: 'Both originalText and spokenText are required' });
    }
    
    const analysis = aiService.analyzeSpeechErrors(originalText, spokenText);
    
    res.json({
      success: true,
      analysis,
      suggestions: analysis.errors.length > 0 
        ? 'Focus on pronouncing each word clearly. Practice the highlighted words.' 
        : 'Excellent pronunciation! Keep up the good work.'
    });
  } catch (error) {
    console.error('Speech analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze speech' });
  }
};

// Character Chat
const characterChat = async (req, res) => {
  try {
    const { userId, character, userMessage } = req.body;
    
    // Get chat history for context
    const key = `${userId}_${character}`;
    const history = chatHistory[key] || [];
    
    const response = await aiService.generateCharacterResponse(userId, character, userMessage, history);
    
    res.json(response);
  } catch (error) {
    console.error('Character chat error:', error);
    res.status(500).json({ error: 'Failed to generate character response' });
  }
};

// Speech-to-Text Conversion (Browser fallback)
const speechToText = async (req, res) => {
  try {
  const { audioData } = req.body;
  
  if (!audioData) {
    return res.json({
      success: false,
      error: 'No audio data received',
      transcript: '',
      confidence: 0,
      useBrowserSpeech: true
    });
  }

    // Google Cloud Speech API is disabled, return fallback response
    res.json({
      success: false,
      error: 'Please use browser speech recognition',
      transcript: '',
      confidence: 0,
      useBrowserSpeech: true
    });
  } catch (error) {
    console.error('Speech to text error:', error);
    res.status(500).json({ error: 'Failed to process speech' });
  }
};

// Text-to-Speech
const textToSpeech = async (req, res) => {
  try {
  const { text, voice } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    throw new Error('Google Cloud API key not configured');
  }
  
  const axios = require('axios');
  const { API_CONFIG } = require('../config/constants');
  
  const response = await axios.post(API_CONFIG.GOOGLE_TTS_URL, {
    input: { text: text },
    voice: {
      languageCode: voice?.name?.includes('GB') ? 'en-GB' : 'en-US',
      name: voice?.name || 'en-US-Standard-D',
      ssmlGender: voice?.gender || 'MALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      pitch: voice?.pitch || 0,
      speakingRate: voice?.speakingRate || 1.0
    }
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  });
  
  const audioContent = response.data.audioContent;
  const audioBuffer = Buffer.from(audioContent, 'base64');
  
  res.set({
    'Content-Type': 'audio/mpeg',
    'Content-Length': audioBuffer.length
  });
  
    res.send(audioBuffer);
  } catch (error) {
    console.error('Text to speech error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
};

// Chat History Management
let chatHistory = {};

const getChatHistory = async (req, res) => {
  try {
  const { userId, character } = req.query;
  
  if (!userId || !character) {
    return res.status(400).json({ error: 'Missing userId or character' });
  }

    const key = `${userId}_${character}`;
    res.json({ messages: chatHistory[key] || [] });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

const saveChatMessage = async (req, res) => {
  try {
  const { userId, character, userMessage, characterReply } = req.body;
  
  const key = `${userId}_${character}`;
  if (!chatHistory[key]) {
    chatHistory[key] = [];
  }
  
  chatHistory[key].push(
    { sender: 'user', text: userMessage, timestamp: new Date() },
    { sender: 'character', text: characterReply, timestamp: new Date() }
  );
  
    res.json({ success: true });
  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({ error: 'Failed to save chat message' });
  }
};

module.exports = {
  generateQuestion,
  analyzeAnswer,
  analyzeSpeech,
  characterChat,
  speechToText,
  textToSpeech,
  getChatHistory,
  saveChatMessage
};