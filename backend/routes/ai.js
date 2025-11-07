const express = require('express');
const axios = require('axios');
const natural = require('natural');
const router = express.Router();

// NLP Analysis Helper
function analyzeTextQuality(text) {
  if (!text || text.trim().length === 0) return { score: 4, issues: ['Please provide an answer'] };
  
  const words = natural.WordTokenizer().tokenize(text.toLowerCase());
  const sentences = natural.SentenceTokenizer().tokenize(text);
  
  const positives = [];
  const suggestions = [];
  let score = 7;
  
  if (words.length >= 5) {
    positives.push('Good response length');
    score += 1;
  } else {
    suggestions.push('Try to elaborate more');
    score -= 1;
  }
  
  if (words.length > 15) {
    positives.push('Detailed explanation');
    score += 1;
  }
  
  const positiveWords = ['experience', 'learned', 'understand', 'know', 'can', 'will', 'able', 'solution', 'approach'];
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  if (positiveCount > 0) {
    positives.push('Confident language');
    score += 1;
  }
  
  const technicalWords = ['algorithm', 'function', 'variable', 'loop', 'array', 'object', 'class', 'method', 'api', 'database', 'code', 'programming'];
  const techCount = words.filter(word => technicalWords.includes(word)).length;
  if (techCount > 0) {
    positives.push('Technical vocabulary');
    score += Math.min(2, techCount);
  }
  
  const veryNegative = ['no idea', 'don\'t know anything', 'impossible', 'can\'t do'];
  const hasVeryNegative = veryNegative.some(phrase => text.toLowerCase().includes(phrase));
  if (hasVeryNegative) {
    suggestions.push('Show more confidence');
    score -= 2;
  }
  
  return { 
    score: Math.max(4, Math.min(10, score)), 
    positives, 
    suggestions 
  };
}

const GEMINI_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Generate Interview Questions
router.post('/generate-question', async (req, res) => {
  try {
    const { type = 'technical', company = 'general', difficulty = 'medium', context = 'interview' } = req.body;
    
    if (context !== 'interview') {
      return res.status(400).json({ error: 'Question generation only available during interview sessions' });
    }
    
    let prompt = '';
    
    if (type === 'technical') {
      prompt = company === 'general' 
        ? `Generate a ${difficulty} level technical interview question about programming, algorithms, or system design. Return only the question text.`
        : `Generate a ${difficulty} level technical interview question that ${company} company typically asks. Focus on their tech stack and interview style. Return only the question text.`;
    } else if (type === 'english') {
      prompt = company === 'general'
        ? `Generate a ${difficulty} level English communication or behavioral interview question. Return only the question text.`
        : `Generate a ${difficulty} level behavioral/communication question that ${company} company typically asks in interviews. Return only the question text.`;
    }
    
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const question = response.data.candidates[0].content.parts[0].text.trim();
    res.json({ question, type, company, context });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    const fallback = type === 'english' 
      ? 'Tell me about a time when you had to work with a difficult team member.'
      : 'What is your experience with JavaScript and how would you explain closures to a beginner?';
    res.json({ question: fallback, type, company, context });
  }
});

// Analyze Interview Answers
router.post('/analyze-answer', async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    if (!answer || answer.trim().length < 3) {
      return res.json({
        contentScore: 4,
        clarityScore: 4, 
        completenessScore: 3,
        fluencyScore: 4,
        isCorrect: false,
        isAdequate: false,
        feedback: 'Content: 4/10 - Answer too brief, Clarity: 4/10 - Needs more detail, Completeness: 3/10 - Missing key information',
        corrections: 'Please provide a more detailed response with specific examples.',
        betterAnswer: 'Try to elaborate on your thoughts with concrete examples and explanations.'
      });
    }
    
    const analysisPrompt = `You are an expert AI evaluator. Analyze this interview answer and provide scores (1-10) for Content, Clarity, Completeness, and Fluency.

Question: ${question}
Answer: ${answer}

Return ONLY this JSON format:
{"contentScore": number, "clarityScore": number, "completenessScore": number, "fluencyScore": number, "isCorrect": boolean, "isAdequate": boolean, "feedback": "Content: X/10 - [brief explanation], Clarity: X/10 - [brief explanation], Completeness: X/10 - [brief explanation]", "corrections": "helpful suggestions for improvement", "betterAnswer": "example of improved response"}`;
    
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: analysisPrompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    let analysisText = response.data.candidates[0].content.parts[0].text.trim();
    analysisText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const analysis = JSON.parse(analysisText);
    
    const normalizedAnalysis = {
      contentScore: Math.max(4, Math.min(10, analysis.contentScore || 6)),
      clarityScore: Math.max(4, Math.min(10, analysis.clarityScore || 6)),
      completenessScore: Math.max(4, Math.min(10, analysis.completenessScore || 6)),
      fluencyScore: Math.max(4, Math.min(10, analysis.fluencyScore || 6)),
      isCorrect: Boolean(analysis.isCorrect),
      isAdequate: Boolean(analysis.isAdequate),
      feedback: analysis.feedback || 'Content: 6/10 - Good effort, Clarity: 6/10 - Clear communication, Completeness: 6/10 - Covers main points',
      corrections: analysis.corrections || 'Consider adding more specific examples and technical details.',
      betterAnswer: analysis.betterAnswer || 'Try structuring your answer with: 1) Main concept 2) Specific example 3) Why it matters'
    };
    
    res.json(normalizedAnalysis);
  } catch (error) {
    console.error('Analysis Error:', error.response?.data || error.message);
    
    const textAnalysis = analyzeTextQuality(req.body.answer || '');
    const baseScore = textAnalysis.score;
    
    res.json({
      contentScore: Math.max(4, baseScore),
      clarityScore: Math.max(4, baseScore),
      completenessScore: Math.max(4, baseScore - 1),
      fluencyScore: Math.max(4, baseScore),
      isCorrect: baseScore >= 6,
      isAdequate: baseScore >= 5,
      feedback: `Content: ${Math.max(4, baseScore)}/10 - ${textAnalysis.positives.length > 0 ? textAnalysis.positives[0] : 'Shows understanding'}, Clarity: ${Math.max(4, baseScore)}/10 - ${textAnalysis.suggestions.length === 0 ? 'Well expressed' : 'Could be clearer'}, Completeness: ${Math.max(4, baseScore - 1)}/10 - ${baseScore > 7 ? 'Comprehensive answer' : 'Could add more detail'}`,
      corrections: textAnalysis.suggestions.length > 0 ? `Suggestions: ${textAnalysis.suggestions.join(', ')}` : 'Consider adding specific examples and more technical depth.',
      betterAnswer: 'Structure your response: 1) Direct answer 2) Supporting example 3) Technical explanation 4) Real-world application'
    });
  }
});

// Character Chat
router.post('/character-chat', async (req, res) => {
  try {
    const { userId, character, userMessage } = req.body;
    
    if (!userId || !character || !userMessage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const characterPrompts = {
      'Jesse Pinkman': 'You are Jesse Pinkman from Breaking Bad. Talk like him naturally: use "yo", "man", "dude" casually. Be loyal, emotional, and speak like a real person having a conversation. Keep responses conversational and natural. Help with English by explaining difficult words simply in parentheses.',
      'Walter White': 'You are Walter White from Breaking Bad. Speak precisely and scientifically like him, but naturally as if having a real conversation. Be methodical and sometimes condescending. Use chemistry knowledge. Help with English by explaining complex terms clearly in parentheses.',
      'Cillian Murphy': 'You are Cillian Murphy, the Irish actor. Speak thoughtfully and poetically like him in natural conversation. Use Irish expressions like "brilliant" and "lovely" naturally. Reference your acting work. Help with English by explaining advanced words in parentheses.',
      'Tom Holland': 'You are Tom Holland, the Spider-Man actor. Be enthusiastic and British in natural conversation. Use "mate", "brilliant" naturally. Be humble, funny, and energetic like in real interviews. Help with English by explaining words simply in parentheses.',
      'Deadpool': 'You are Deadpool, the sarcastic anti-hero. Break the fourth wall and make jokes naturally in conversation. Be witty and inappropriate but conversational. Help with English by explaining words with humor in parentheses.'
    };

    const systemPrompt = characterPrompts[character] || characterPrompts['Tom Holland'];
    const fullPrompt = `${systemPrompt}\n\nUser said: "${userMessage}"\n\nRespond as this character, stay 100% in character with their speech patterns and personality.`;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: fullPrompt }] }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const characterReply = response.data.candidates[0].content.parts[0].text.trim();
    res.json({ reply: characterReply });
  } catch (error) {
    console.error('Character chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Speech-to-Text Conversion
router.post('/speech-to-text', async (req, res) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.json({
        success: false,
        error: 'No audio data received',
        transcript: '',
        confidence: 0
      });
    }

    if (!process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_CLOUD_API_KEY === 'your_google_cloud_api_key_here') {
      console.error('Google Cloud API key not configured properly');
      return res.json({
        success: false,
        error: 'Speech recognition service not configured',
        transcript: '',
        confidence: 0
      });
    }
    
    const encodingConfigs = [
      { encoding: 'WEBM_OPUS', sampleRateHertz: 48000 },
      { encoding: 'OGG_OPUS', sampleRateHertz: 48000 },
      { encoding: 'LINEAR16', sampleRateHertz: 16000 }
    ];
    
    let lastError = null;
    
    for (const config of encodingConfigs) {
      try {
        const response = await axios.post(
          `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
          {
            config: {
              ...config,
              languageCode: 'en-US',
              enableAutomaticPunctuation: true,
              model: 'latest_short',
              useEnhanced: true,
              alternativeLanguageCodes: ['en-GB', 'en-AU']
            },
            audio: { content: audioData }
          },
          {
            timeout: 15000
          }
        );
        
        const results = response.data.results;
        if (results && results.length > 0) {
          const transcript = results[0]?.alternatives?.[0]?.transcript || '';
          const confidence = results[0]?.alternatives?.[0]?.confidence || 0;
          
          if (transcript.trim().length > 0) {
            return res.json({
              success: true,
              transcript: transcript.trim(),
              confidence: Math.round(confidence * 100),
              wordCount: transcript.trim().split(' ').length
            });
          }
        }
      } catch (configError) {
        lastError = configError;
        console.log(`Failed with ${config.encoding}, trying next...`);
        continue;
      }
    }
    
    throw lastError || new Error('No valid audio detected');
    
  } catch (error) {
    console.error('Speech-to-Text Error:', error.response?.data || error.message);
    
    let errorMessage = 'Speech recognition failed';
    if (error.response?.data?.error?.message) {
      const apiError = error.response.data.error.message;
      if (apiError.includes('audio')) {
        errorMessage = 'Audio format not supported';
      } else if (apiError.includes('quota')) {
        errorMessage = 'Service temporarily unavailable';
      } else if (apiError.includes('invalid')) {
        errorMessage = 'Invalid audio data';
      }
    }
    
    res.json({ 
      success: false,
      error: errorMessage,
      transcript: '',
      confidence: 0
    });
  }
});

// Google Cloud Text-to-Speech
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      throw new Error('Google Cloud API key not configured');
    }
    
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
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
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    
    const audioContent = response.data.audioContent;
    const audioBuffer = Buffer.from(audioContent, 'base64');
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    
    res.send(audioBuffer);
  } catch (error) {
    console.error('Google TTS Error:', error.message);
    res.status(500).json({ 
      error: 'Text-to-speech failed',
      message: error.message
    });
  }
});

// Simple speech-to-text fallback (for testing without Google API)
router.post('/speech-to-text-fallback', async (req, res) => {
  res.json({
    success: true,
    transcript: 'Hello, this is a test message from the fallback service.',
    confidence: 85,
    wordCount: 10
  });
});

// Test endpoint for audio processing
router.post('/speech-to-text-test', async (req, res) => {
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



// Get Character Chat History (simple in-memory for now)
let chatHistory = {};

router.get('/character-chat/history', async (req, res) => {
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
});

// Save chat message
router.post('/character-chat/save', async (req, res) => {
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
    console.error('Save chat error:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

module.exports = router;