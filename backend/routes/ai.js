const express = require('express');
const axios = require('axios');
const natural = require('natural');
const router = express.Router();

// Friendly NLP Analysis Helper
function analyzeTextQuality(text) {
  if (!text || text.trim().length === 0) return { score: 4, issues: ['Please provide an answer'] };
  
  const words = natural.WordTokenizer().tokenize(text.toLowerCase());
  const sentences = natural.SentenceTokenizer().tokenize(text);
  
  const positives = [];
  const suggestions = [];
  let score = 7; // Start with good base score
  
  // Length analysis - more generous
  if (words.length >= 5) {
    positives.push('Good response length');
    score += 1;
  } else {
    suggestions.push('Try to elaborate more');
    score -= 1;
  }
  
  // Effort recognition
  if (words.length > 15) {
    positives.push('Detailed explanation');
    score += 1;
  }
  
  // Positive language detection
  const positiveWords = ['experience', 'learned', 'understand', 'know', 'can', 'will', 'able', 'solution', 'approach'];
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  if (positiveCount > 0) {
    positives.push('Confident language');
    score += 1;
  }
  
  // Technical terms (bonus points)
  const technicalWords = ['algorithm', 'function', 'variable', 'loop', 'array', 'object', 'class', 'method', 'api', 'database', 'code', 'programming'];
  const techCount = words.filter(word => technicalWords.includes(word)).length;
  if (techCount > 0) {
    positives.push('Technical vocabulary');
    score += Math.min(2, techCount);
  }
  
  // Only penalize severely negative responses
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

router.post('/generate-question', async (req, res) => {
  try {
    const { type = 'technical', company = 'general', difficulty = 'medium', previousQuestions, context = 'interview' } = req.body;
    
    // Only allow question generation for actual interview sessions
    if (context !== 'interview') {
      return res.status(400).json({ error: 'Question generation only available during interview sessions' });
    }
    
    let prompt = '';
    
    if (type === 'technical') {
      if (company === 'general') {
        prompt = `Generate a ${difficulty} level technical interview question about programming, algorithms, or system design. Return only the question text.`;
      } else {
        prompt = `Generate a ${difficulty} level technical interview question that ${company} company typically asks. Focus on their tech stack and interview style. Return only the question text.`;
      }
    } else if (type === 'english') {
      if (company === 'general') {
        prompt = `Generate a ${difficulty} level English communication or behavioral interview question. Return only the question text.`;
      } else {
        prompt = `Generate a ${difficulty} level behavioral/communication question that ${company} company typically asks in interviews. Return only the question text.`;
      }
    }
    
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
    res.json({ question, type, company, context });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    const fallback = type === 'english' ? 
      'Tell me about a time when you had to work with a difficult team member.' :
      'What is your experience with JavaScript and how would you explain closures to a beginner?';
    res.json({ question: fallback, type, company, context });
  }
});

router.post('/analyze-answer', async (req, res) => {
  try {
    const { question, answer, type = 'technical' } = req.body;
    
    // Basic validation with structured feedback
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
    
    const analysisPrompt = `You are an expert AI evaluator designed to analyze interview answers and provide detailed, quantitative feedback along three categories: Content, Clarity, and Completeness. Each category is scored from 1 to 10.

Your role is to carefully read the user's answer and produce objective scores with explanations. Use natural language understanding and evaluation criteria to assess how relevant, clear, and complete the answer is.

Scoring Guidelines:
- Content (1-10): Score how relevant, accurate, and insightful the answer is relative to the question asked.
- Clarity (1-10): Score how clearly and fluently the answer is expressed, considering grammar, coherence, and absence of fillers.
- Completeness (1-10): Score how well the answer covers all important aspects or subquestions it should address.

Question: ${question}
Answer: ${answer}

Analyze the answer and return ONLY this JSON format:
{"contentScore": number, "clarityScore": number, "completenessScore": number, "fluencyScore": number, "isCorrect": boolean, "isAdequate": boolean, "feedback": "Content: X/10 - [brief explanation], Clarity: X/10 - [brief explanation], Completeness: X/10 - [brief explanation]", "corrections": "helpful suggestions for improvement", "betterAnswer": "example of improved response"}`;
    
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: analysisPrompt }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    let analysisText = response.data.candidates[0].content.parts[0].text.trim();
    analysisText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const analysis = JSON.parse(analysisText);
    
    // Validate and normalize scores - balanced approach
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
    
    console.log('AI Analysis Result:', normalizedAnalysis);
    res.json(normalizedAnalysis);
  } catch (error) {
    console.error('Analysis Error:', error.response?.data || error.message);
    
    // NLP-based fallback analysis with structured feedback
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
      corrections: textAnalysis.suggestions.length > 0 ?
        `Suggestions: ${textAnalysis.suggestions.join(', ')}` :
        'Consider adding specific examples and more technical depth.',
      betterAnswer: 'Structure your response: 1) Direct answer 2) Supporting example 3) Technical explanation 4) Real-world application'
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