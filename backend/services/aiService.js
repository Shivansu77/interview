const axios = require('axios');
const { API_CONFIG, SCORE_RANGES } = require('../config/constants');
const nlpAnalyzer = require('../utils/nlpAnalyzer');

class AIService {
  constructor() {
    this.sessionQuestions = new Map(); // Track questions per session
  }

  async generateQuestion(type = 'technical', company = 'general', difficulty = 'medium', context = 'interview', sessionId = null) {
    if (context !== 'interview') {
      throw new Error('Question generation only available during interview sessions');
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

    try {
      // Add session context to prevent duplicate questions
      const sessionKey = sessionId || 'default';
      const previousQuestions = this.sessionQuestions.get(sessionKey) || [];
      
      let enhancedPrompt = prompt;
      if (previousQuestions.length > 0) {
        enhancedPrompt += `\n\nIMPORTANT: Do NOT ask any of these previously asked questions: ${previousQuestions.join(', ')}. Generate a completely different question.`;
      }

      const response = await axios.post(API_CONFIG.GEMINI_URL, {
        contents: [{ parts: [{ text: enhancedPrompt }] }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      
      const question = response.data.candidates[0].content.parts[0].text.trim();
      
      // Store the question to prevent duplicates
      if (sessionId) {
        const sessionQuestions = this.sessionQuestions.get(sessionKey) || [];
        sessionQuestions.push(question);
        this.sessionQuestions.set(sessionKey, sessionQuestions);
      }
      
      console.log('Generated question from API:', question.substring(0, 50) + '...');
      return { question, type, company, context, source: 'api' };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      return this.getFallbackQuestion(type, company, context, sessionId);
    }
  }

  getFallbackQuestion(type, company, context, sessionId = null) {
    const fallbackQuestions = {
      technical: [
        'What is your experience with JavaScript and how would you explain closures to a beginner?',
        'How would you optimize the performance of a web application?',
        'Explain the difference between SQL and NoSQL databases.',
        'What are the key principles of object-oriented programming?',
        'How do you handle error handling in your applications?',
        'Describe how you would implement a REST API from scratch.',
        'What are the differences between synchronous and asynchronous programming?',
        'How would you approach debugging a performance issue in a web application?',
        'Explain the concept of database indexing and when you would use it.',
        'What security considerations do you keep in mind when developing web applications?'
      ],
      english: [
        'Tell me about a time when you had to work with a difficult team member.',
        'Describe a challenging project you worked on and how you overcame obstacles.',
        'How do you handle stress and pressure in the workplace?',
        'What are your career goals for the next five years?',
        'Tell me about a time when you had to learn something new quickly.',
        'Describe a situation where you had to give constructive feedback to a colleague.',
        'How do you prioritize tasks when you have multiple deadlines?',
        'Tell me about a time when you made a mistake and how you handled it.',
        'Describe your ideal work environment and team dynamics.',
        'How do you stay motivated when working on long-term projects?'
      ]
    };
    
    const sessionKey = sessionId || 'default';
    const previousQuestions = this.sessionQuestions.get(sessionKey) || [];
    const questions = fallbackQuestions[type] || fallbackQuestions.technical;
    
    // Filter out previously asked questions
    const availableQuestions = questions.filter(q => !previousQuestions.includes(q));
    
    // If all questions have been used, reset the session
    if (availableQuestions.length === 0) {
      this.sessionQuestions.set(sessionKey, []);
      const resetQuestion = questions[0];
      console.log('Using fallback question (reset):', resetQuestion.substring(0, 50) + '...');
      return { question: resetQuestion, type, company, context, source: 'fallback' };
    }
    
    // Select a question that hasn't been asked
    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    // Track the question
    if (sessionId) {
      const sessionQuestions = this.sessionQuestions.get(sessionKey) || [];
      sessionQuestions.push(selectedQuestion);
      this.sessionQuestions.set(sessionKey, sessionQuestions);
    }
    
    console.log('Using fallback question:', selectedQuestion.substring(0, 50) + '...');
    return { question: selectedQuestion, type, company, context, source: 'fallback' };
  }

  async analyzeAnswer(question, answer) {
    if (!answer || answer.trim().length < 3) {
      return {
        contentScore: SCORE_RANGES.MIN_SCORE,
        clarityScore: SCORE_RANGES.MIN_SCORE,
        completenessScore: 3,
        fluencyScore: SCORE_RANGES.MIN_SCORE,
        isCorrect: false,
        isAdequate: false,
        feedback: 'Content: 4/10 - Answer too brief, Clarity: 4/10 - Needs more detail, Completeness: 3/10 - Missing key information',
        corrections: 'Please provide a more detailed response with specific examples.',
        betterAnswer: 'Try to elaborate on your thoughts with concrete examples and explanations.'
      };
    }
    
    const analysisPrompt = `You are an expert AI evaluator. Analyze this interview answer and provide scores (1-10) for Content, Clarity, Completeness, and Fluency.

Question: ${question}
Answer: ${answer}

Return ONLY this JSON format:
{"contentScore": number, "clarityScore": number, "completenessScore": number, "fluencyScore": number, "isCorrect": boolean, "isAdequate": boolean, "feedback": "Content: X/10 - [brief explanation], Clarity: X/10 - [brief explanation], Completeness: X/10 - [brief explanation]", "corrections": "helpful suggestions for improvement", "betterAnswer": "example of improved response"}`;
    
    try {
      const response = await axios.post(API_CONFIG.GEMINI_URL, {
        contents: [{ parts: [{ text: analysisPrompt }] }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      
      let analysisText = response.data.candidates[0].content.parts[0].text.trim();
      analysisText = analysisText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const analysis = JSON.parse(analysisText);
      
      return {
        contentScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, analysis.contentScore || 6)),
        clarityScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, analysis.clarityScore || 6)),
        completenessScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, analysis.completenessScore || 6)),
        fluencyScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, analysis.fluencyScore || 6)),
        isCorrect: Boolean(analysis.isCorrect),
        isAdequate: Boolean(analysis.isAdequate),
        feedback: analysis.feedback || 'Content: 6/10 - Good effort, Clarity: 6/10 - Clear communication, Completeness: 6/10 - Covers main points',
        corrections: analysis.corrections || 'Consider adding more specific examples and technical details.',
        betterAnswer: analysis.betterAnswer || 'Try structuring your answer with: 1) Main concept 2) Specific example 3) Why it matters'
      };
    } catch (error) {
      console.error('Analysis Error:', error.response?.data || error.message);
      
      // If API is overloaded on first attempt, retry once
      if (error.response?.status === 503) {
        console.log('API overloaded, waiting 3 seconds and retrying once...');
        try {
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const retryResponse = await axios.post(API_CONFIG.GEMINI_URL, {
            contents: [{ parts: [{ text: analysisPrompt }] }]
          }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
          });
          
          let retryAnalysisText = retryResponse.data.candidates[0].content.parts[0].text.trim();
          retryAnalysisText = retryAnalysisText.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const retryAnalysis = JSON.parse(retryAnalysisText);
          
          return {
            contentScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, retryAnalysis.contentScore || 6)),
            clarityScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, retryAnalysis.clarityScore || 6)),
            completenessScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, retryAnalysis.completenessScore || 6)),
            fluencyScore: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, retryAnalysis.fluencyScore || 6)),
            isCorrect: Boolean(retryAnalysis.isCorrect),
            isAdequate: Boolean(retryAnalysis.isAdequate),
            feedback: retryAnalysis.feedback || 'Content: 6/10 - Good effort, Clarity: 6/10 - Clear communication, Completeness: 6/10 - Covers main points',
            corrections: retryAnalysis.corrections || 'Consider adding more specific examples and technical details.',
            betterAnswer: retryAnalysis.betterAnswer || 'Try structuring your answer with: 1) Main concept 2) Specific example 3) Why it matters'
          };
        } catch (retryError) {
          console.error('Retry failed:', retryError.message);
        }
      }
      
      // Enhanced fallback analysis
      return this.getEnhancedLocalAnalysis(question, answer);
    }
  }

  getEnhancedLocalAnalysis(question, answer) {
    const words = answer.trim().split(/\s+/);
    const wordCount = words.length;
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Technical terms detection
    const techTerms = ['algorithm', 'database', 'api', 'framework', 'function', 'variable', 'object', 'class', 'method', 'array', 'string', 'boolean', 'integer', 'loop', 'condition', 'exception', 'interface', 'inheritance', 'polymorphism', 'encapsulation'];
    const techTermCount = words.filter(word => 
      techTerms.some(term => word.toLowerCase().includes(term.toLowerCase()))
    ).length;
    
    // Calculate scores based on actual content
    let contentScore = 4; // Base score
    if (wordCount >= 50) contentScore += 2;
    if (wordCount >= 100) contentScore += 1;
    if (techTermCount >= 2) contentScore += 2;
    if (answer.includes('example') || answer.includes('for instance')) contentScore += 1;
    
    let clarityScore = 4; // Base score
    if (sentences.length >= 3) clarityScore += 2;
    if (answer.includes('first') || answer.includes('second') || answer.includes('finally')) clarityScore += 2;
    if (wordCount >= 30) clarityScore += 1;
    if (answer.match(/[A-Z][a-z].*\./)) clarityScore += 1; // Proper sentences
    
    let completenessScore = 4; // Base score
    if (wordCount >= 75) completenessScore += 2;
    if (sentences.length >= 4) completenessScore += 1;
    if (techTermCount >= 3) completenessScore += 2;
    if (answer.toLowerCase().includes(question.toLowerCase().split(' ')[0])) completenessScore += 1;
    
    // Cap scores at 10
    contentScore = Math.min(10, contentScore);
    clarityScore = Math.min(10, clarityScore);
    completenessScore = Math.min(10, completenessScore);
    
    const isAdequate = wordCount >= 30 && sentences.length >= 2;
    const isCorrect = wordCount >= 50 && techTermCount >= 1;
    
    // Generate specific feedback
    let feedback = `Content: ${contentScore}/10 - `;
    if (contentScore >= 8) feedback += 'Excellent technical depth';
    else if (contentScore >= 6) feedback += 'Good technical knowledge shown';
    else feedback += 'Needs more technical detail';
    
    feedback += `, Clarity: ${clarityScore}/10 - `;
    if (clarityScore >= 8) feedback += 'Very clear structure';
    else if (clarityScore >= 6) feedback += 'Generally well structured';
    else feedback += 'Needs better organization';
    
    feedback += `, Completeness: ${completenessScore}/10 - `;
    if (completenessScore >= 8) feedback += 'Comprehensive coverage';
    else if (completenessScore >= 6) feedback += 'Covers main points';
    else feedback += 'Missing key information';
    
    // Generate corrections
    let corrections = [];
    if (wordCount < 50) corrections.push('Provide more detailed explanations');
    if (techTermCount < 2) corrections.push('Include more technical terminology');
    if (sentences.length < 3) corrections.push('Break down your answer into clear points');
    if (!answer.includes('example')) corrections.push('Add specific examples to illustrate your points');
    
    const correctionsText = corrections.length > 0 ? corrections.join('. ') + '.' : 'Good structure, consider adding more specific examples.';
    
    return {
      contentScore,
      clarityScore,
      completenessScore,
      fluencyScore: Math.min(10, Math.max(4, Math.floor(wordCount / 10) + 4)),
      isCorrect,
      isAdequate,
      feedback,
      corrections: correctionsText,
      betterAnswer: 'Structure your answer as: 1) Define the concept 2) Provide a specific example 3) Explain the benefits/importance 4) Mention any challenges or considerations',
      spokenText: answer, // Include the actual spoken text
      wordCount,
      technicalTerms: techTermCount
    };
  }

  // Add method to analyze speech errors
  analyzeSpeechErrors(originalText, spokenText) {
    const originalWords = originalText.toLowerCase().split(/\s+/);
    const spokenWords = spokenText.toLowerCase().split(/\s+/);
    
    const errors = [];
    const maxLength = Math.max(originalWords.length, spokenWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      const original = originalWords[i] || '';
      const spoken = spokenWords[i] || '';
      
      if (original !== spoken) {
        errors.push({
          position: i,
          expected: original,
          actual: spoken,
          type: !spoken ? 'missing' : !original ? 'extra' : 'mispronounced'
        });
      }
    }
    
    return {
      errors,
      accuracy: ((maxLength - errors.length) / maxLength * 100).toFixed(1),
      totalWords: maxLength,
      correctWords: maxLength - errors.length
    };
  }

  // Clear session questions when interview ends
  clearSession(sessionId) {
    if (sessionId) {
      this.sessionQuestions.delete(sessionId);
    }
  }
}

module.exports = new AIService();