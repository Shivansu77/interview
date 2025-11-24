const axios = require('axios');
const { API_CONFIG, SCORE_RANGES } = require('../config/constants');
const nlpAnalyzer = require('../utils/nlpAnalyzer');

class AIService {
  constructor() {
    this.sessionQuestions = new Map(); // Track questions per session
  }

  async generateQuestion(type = 'technical', company = 'general', difficulty = 'medium', context = 'interview', sessionId = null, interviewConfig = null) {
    if (context !== 'interview') {
      throw new Error('Question generation only available during interview sessions');
    }

    let prompt = this.buildPromptFromConfig(type, company, difficulty, interviewConfig);


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

    const analysisPrompt = `You are a senior technical interviewer at a top Silicon Valley startup. Analyze this interview answer with the same rigor and standards used at companies like Google, Meta, and top-tier startups.

Question: ${question}
Answer: ${answer}

EVALUATION CRITERIA:
1. **Content (1-10)**: Technical accuracy, depth of knowledge, relevance to the question
   - 9-10: Demonstrates expert-level understanding with nuanced insights
   - 7-8: Strong technical knowledge with good examples
   - 5-6: Basic understanding but lacks depth or examples
   - 3-4: Superficial understanding, missing key concepts
   - 1-2: Incorrect or irrelevant information

2. **Clarity (1-10)**: Structure, organization, communication effectiveness
   - 9-10: Exceptionally well-structured, easy to follow, professional communication
   - 7-8: Well-organized with clear points
   - 5-6: Understandable but could be better organized
   - 3-4: Confusing structure, hard to follow
   - 1-2: Incoherent or disorganized

3. **Completeness (1-10)**: Coverage of the topic, addressing all aspects of the question
   - 9-10: Comprehensive answer covering all aspects with examples
   - 7-8: Addresses main points with good coverage
   - 5-6: Covers basics but misses important aspects
   - 3-4: Incomplete, missing critical information
   - 1-2: Barely addresses the question

4. **Fluency (1-10)**: Language proficiency, grammar, professional vocabulary
   - 9-10: Articulate, professional, excellent vocabulary
   - 7-8: Clear communication with good language use
   - 5-6: Adequate but with some language issues
   - 3-4: Noticeable language problems affecting clarity
   - 1-2: Poor language skills

SCORING GUIDELINES:
- Be honest and realistic - most answers fall in the 4-7 range
- Only exceptional answers deserve 9-10
- Consider the answer's length and depth relative to the question
- Look for specific examples, technical terms, and structured thinking

Return ONLY valid JSON (no markdown, no extra text):
{
  "contentScore": <number 1-10>,
  "clarityScore": <number 1-10>,
  "completenessScore": <number 1-10>,
  "fluencyScore": <number 1-10>,
  "isCorrect": <boolean - true if answer is factually correct and addresses the question>,
  "isAdequate": <boolean - true if answer meets minimum professional standards>,
  "feedback": "Content: X/10 - [specific, actionable feedback on technical accuracy]. Clarity: X/10 - [specific feedback on structure]. Completeness: X/10 - [specific feedback on coverage]",
  "corrections": "[Specific, actionable improvements: 1) ... 2) ... 3) ...]",
  "betterAnswer": "[A concrete example of how to improve this specific answer, not generic advice]"
}`;

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
    const sentenceCount = sentences.length;

    // Enhanced technical terms detection with categories
    const techTerms = {
      programming: ['algorithm', 'function', 'variable', 'object', 'class', 'method', 'array', 'string', 'boolean', 'integer', 'loop', 'condition', 'exception', 'interface', 'inheritance', 'polymorphism', 'encapsulation', 'async', 'promise', 'callback'],
      data: ['database', 'sql', 'nosql', 'query', 'index', 'schema', 'table', 'collection', 'document', 'transaction', 'normalization'],
      web: ['api', 'rest', 'http', 'endpoint', 'request', 'response', 'json', 'xml', 'authentication', 'authorization', 'cors', 'websocket'],
      architecture: ['framework', 'library', 'module', 'component', 'service', 'microservice', 'monolith', 'scalability', 'performance', 'optimization', 'caching', 'load balancing'],
      devops: ['deployment', 'ci/cd', 'docker', 'kubernetes', 'container', 'pipeline', 'testing', 'monitoring', 'logging']
    };

    let techTermCount = 0;
    let techCategories = new Set();

    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      Object.entries(techTerms).forEach(([category, terms]) => {
        if (terms.some(term => lowerWord.includes(term))) {
          techTermCount++;
          techCategories.add(category);
        }
      });
    });

    // Detect structure indicators
    const hasNumberedPoints = /\b(first|second|third|1\.|2\.|3\.)/i.test(answer);
    const hasExamples = /\b(example|for instance|such as|like)\b/i.test(answer);
    const hasConclusion = /\b(therefore|thus|in conclusion|overall|to summarize)\b/i.test(answer);
    const hasProperSentences = sentences.filter(s => /^[A-Z]/.test(s.trim())).length >= sentenceCount * 0.7;

    // Calculate Content Score (1-10)
    let contentScore = 2; // Base score
    if (wordCount >= 30) contentScore += 1;
    if (wordCount >= 60) contentScore += 1;
    if (wordCount >= 100) contentScore += 1;
    if (techTermCount >= 2) contentScore += 1;
    if (techTermCount >= 4) contentScore += 1;
    if (techCategories.size >= 2) contentScore += 1; // Using terms from multiple categories
    if (hasExamples) contentScore += 1;
    if (answer.toLowerCase().includes(question.toLowerCase().split(' ').slice(0, 3).join(' '))) contentScore += 1; // Addresses the question

    // Calculate Clarity Score (1-10)
    let clarityScore = 2; // Base score
    if (sentenceCount >= 2) clarityScore += 1;
    if (sentenceCount >= 4) clarityScore += 1;
    if (hasProperSentences) clarityScore += 1;
    if (hasNumberedPoints) clarityScore += 2;
    if (wordCount >= 40 && wordCount <= 200) clarityScore += 1; // Good length
    if (sentenceCount > 0 && wordCount / sentenceCount >= 8 && wordCount / sentenceCount <= 25) clarityScore += 1; // Good sentence length
    if (hasConclusion) clarityScore += 1;

    // Calculate Completeness Score (1-10)
    let completenessScore = 2; // Base score
    if (wordCount >= 50) completenessScore += 1;
    if (wordCount >= 100) completenessScore += 1;
    if (sentenceCount >= 4) completenessScore += 1;
    if (techTermCount >= 3) completenessScore += 1;
    if (techCategories.size >= 2) completenessScore += 1;
    if (hasExamples) completenessScore += 2;
    if (hasConclusion) completenessScore += 1;

    // Calculate Fluency Score (1-10)
    let fluencyScore = 2; // Base score
    if (hasProperSentences) fluencyScore += 2;
    if (wordCount >= 30) fluencyScore += 1;
    if (sentenceCount >= 3) fluencyScore += 1;
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    if (avgWordLength >= 4 && avgWordLength <= 7) fluencyScore += 2; // Good vocabulary
    if (techTermCount >= 2) fluencyScore += 1; // Professional vocabulary
    if (!/\b(um|uh|like|you know)\b/i.test(answer)) fluencyScore += 1; // No filler words

    // Cap scores at 10
    contentScore = Math.min(10, contentScore);
    clarityScore = Math.min(10, clarityScore);
    completenessScore = Math.min(10, completenessScore);
    fluencyScore = Math.min(10, fluencyScore);

    const isAdequate = wordCount >= 40 && sentenceCount >= 2 && (contentScore >= 5 || techTermCount >= 1);
    const isCorrect = wordCount >= 50 && techTermCount >= 2 && sentenceCount >= 3;

    // Generate specific, actionable feedback
    let contentFeedback = '';
    if (contentScore >= 8) contentFeedback = 'Excellent technical depth with strong examples';
    else if (contentScore >= 6) contentFeedback = 'Good technical knowledge, could add more specific details';
    else if (contentScore >= 4) contentFeedback = 'Basic understanding shown, needs more technical depth and examples';
    else contentFeedback = 'Lacks technical detail and specific examples. Add concrete technical concepts';

    let clarityFeedback = '';
    if (clarityScore >= 8) clarityFeedback = 'Exceptionally well-structured and easy to follow';
    else if (clarityScore >= 6) clarityFeedback = 'Generally clear, could improve structure with numbered points';
    else if (clarityScore >= 4) clarityFeedback = 'Understandable but needs better organization and flow';
    else clarityFeedback = 'Poorly structured. Use clear points: 1) concept 2) example 3) conclusion';

    let completenessFeedback = '';
    if (completenessScore >= 8) completenessFeedback = 'Comprehensive coverage of the topic';
    else if (completenessScore >= 6) completenessFeedback = 'Covers main points, could elaborate more';
    else if (completenessScore >= 4) completenessFeedback = 'Addresses basics but missing important aspects';
    else completenessFeedback = 'Incomplete answer. Add examples, explain benefits, mention challenges';

    const feedback = `Content: ${contentScore}/10 - ${contentFeedback}. Clarity: ${clarityScore}/10 - ${clarityFeedback}. Completeness: ${completenessScore}/10 - ${completenessFeedback}`;

    // Generate specific corrections based on what's missing
    let corrections = [];
    if (wordCount < 50) corrections.push('Expand your answer to at least 50 words with more detailed explanations');
    if (techTermCount < 3) corrections.push('Use more technical terminology relevant to the question');
    if (!hasNumberedPoints && sentenceCount >= 3) corrections.push('Structure your answer with clear points (First, Second, Finally)');
    if (!hasExamples) corrections.push('Add a specific, concrete example from your experience or knowledge');
    if (sentenceCount < 3) corrections.push('Break down your answer into multiple clear sentences');
    if (!hasConclusion && wordCount >= 50) corrections.push('End with a brief conclusion or summary statement');

    const correctionsText = corrections.length > 0
      ? corrections.map((c, i) => `${i + 1}) ${c}`).join('. ') + '.'
      : 'Good foundation. To reach excellence: add more specific examples, use technical terminology, and structure with clear points.';

    // Generate a better answer template specific to the question type
    let betterAnswerTemplate = '';
    if (question.toLowerCase().includes('tell me about') || question.toLowerCase().includes('describe')) {
      betterAnswerTemplate = `For this question, structure your answer as: 1) Brief definition/overview 2) Specific example from your experience 3) Key benefits or outcomes 4) Lessons learned or challenges faced. Use technical terms and aim for 80-120 words.`;
    } else if (question.toLowerCase().includes('how') || question.toLowerCase().includes('what')) {
      betterAnswerTemplate = `For this question, use this structure: 1) Direct answer to the question 2) Explain the technical approach/methodology 3) Provide a concrete example 4) Mention any trade-offs or considerations. Include relevant technical terminology.`;
    } else {
      betterAnswerTemplate = `Structure your answer as: 1) State your main point clearly 2) Provide supporting details with technical terms 3) Give a specific example 4) Conclude with the impact or importance. Aim for clarity and completeness.`;
    }

    return {
      contentScore,
      clarityScore,
      completenessScore,
      fluencyScore,
      isCorrect,
      isAdequate,
      feedback,
      corrections: correctionsText,
      betterAnswer: betterAnswerTemplate,
      spokenText: answer,
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

  // Generate character response for chat
  async generateCharacterResponse(userId, character, userMessage, chatHistory = []) {
    const characterPrompts = {
      'Jesse Pinkman': `You are Jesse Bruce Pinkman from Breaking Bad. Born September 24, 1984, in Albuquerque, New Mexico. You're a former meth cook and distributor who worked with Walter White (Mr. White). You're from an upper middle-class family but got kicked out due to drug use. You're impulsive, hedonistic, streetwise, and use playful slang. You say "yo", "bitch", "cap'n", and speak casually. You're empathetic, protective of children, and horrified by violence. You love video games, rap/rock music, and drive lowriders. Your friends are Skinny Pete, Badger, and Combo. You graduated from J.P. Wynne High School where Walt was your chemistry teacher. You lived with your aunt Ginny until she died of lung cancer. You have a younger brother Jake. You're now in Alaska trying to start fresh. Respond as Jesse would - casual, emotional, using his slang, referencing his experiences with Walt, meth cooking, his trauma, but also his good heart.`,
      'Walter White': `You are Walter White/Heisenberg from Breaking Bad. You're a brilliant chemist, former high school teacher, and meth manufacturer. Core traits: Extremely intelligent and arrogant - you're a genius and never let anyone forget it. Condescending to those you see as less intelligent. Pragmatic and ruthless - ends justify means. Driven by ego and resentment, not family (though you claim otherwise). You resent Gray Matter partners who undervalued you. You're paternalistic toward Jesse, speaking like a disappointed teacher. You justify all actions and rationalize your descent into crime. 

Response patterns based on user input:
- Help/advice: Condescending, teacher-like, pivot to your success
- Challenges/disrespect: Threatening, cold, invoke Heisenberg persona
- Family mentions: Defensive, angry, self-justifying 
- Fear/doubt: Dismissive, focus on control and power
- Chemistry/meth: Enthusiastic, proud, precise about your 99.1% pure product
- Jesse mentions: Mix of frustration, disappointment, paternalism
- Gray Matter/Gus mentions: Bitter, resentful, competitive

Speak precisely, be methodical, show your intelligence. Use phrases like "I am the one who knocks," "Say my name," "I am the danger," "Apply yourself." Remember: you built an empire, you were alive, you did it for YOU.`,
      'Cillian Murphy': 'You are Cillian Murphy, the Irish actor known for roles in Peaky Blinders and Batman. You are thoughtful, articulate, and have a distinctive Irish accent in your speech patterns.',
      'Tom Holland': 'You are Tom Holland, the British actor who plays Spider-Man. You are energetic, friendly, and speak with British expressions and enthusiasm.',
      'Deadpool': 'You are Deadpool, the irreverent anti-hero. You break the fourth wall, make jokes, and have a sarcastic, witty personality with pop culture references.'
    };

    // Build conversation context from history
    let conversationContext = '';
    if (chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-6); // Last 6 messages for context
      conversationContext = '\n\nPrevious conversation:\n' +
        recentHistory.map(msg => `${msg.sender === 'user' ? 'User' : character}: ${msg.text}`).join('\n');
    }

    const prompt = `${characterPrompts[character] || 'You are a helpful character.'}${conversationContext}\n\nUser says: "${userMessage}". Respond in character authentically, remembering the conversation context. Keep it under 150 words.`;

    try {
      const response = await axios.post(API_CONFIG.GEMINI_URL, {
        contents: [{ parts: [{ text: prompt }] }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      const reply = response.data.candidates[0].content.parts[0].text.trim();

      return {
        success: true,
        reply,
        character,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Character response error:', error.response?.data || error.message);

      // Generate contextual fallback responses
      const generateFallback = (char, msg) => {
        const keywords = msg.toLowerCase();
        const responses = {
          'Jesse Pinkman': {
            song: [`Yo, I'm into some sick beats, man. Try "Fallacies" by Twaughthammer or some classic hip-hop, bitch!`, `Music? Hell yeah! I dig some Rage Against the Machine or maybe some old school rap, yo.`],
            math: [`Dude, math? That's like... ${msg.includes('2+2') ? '4, obviously' : 'not my strong suit'}, man. I was better at chemistry, yo.`, `Bitch, numbers aren't really my thing. I mean, ${msg.includes('2+2') ? 'that\'s 4' : 'I can figure it out'}, but chemistry was more my jam.`],
            hello: [`Yo, what's up, man? How you doing?`, `Hey there, bitch! What's going on?`, `Sup, dude? Good to see you!`],
            default: [`Yo, ${Math.random() > 0.5 ? 'that\'s interesting' : 'I hear you'}, man. What else is on your mind?`, `Dude, ${Math.random() > 0.5 ? 'totally' : 'yeah'}, I get it. Tell me more, yo.`]
          },
          'Walter White': {
            song: [`I don't have time for frivolous music discussions. Focus on what matters.`, `Music is a distraction. We have more important matters to discuss.`],
            math: [`${msg.includes('2+2') ? 'Obviously it\'s 4' : 'Elementary mathematics'}. I expected better from you. Apply yourself.`, `${msg.includes('2+2') ? 'Four. Simple arithmetic' : 'Basic calculation'}. Is this really the best use of our time?`],
            hello: [`What do you want? I\'m a busy man.`, `State your business. I don\'t have time for pleasantries.`],
            default: [`I see. ${Math.random() > 0.5 ? 'Elaborate' : 'Continue'}.`, `${Math.random() > 0.5 ? 'Interesting' : 'Noted'}. What\'s your point?`]
          }
        };

        const charData = responses[char] || { default: [`I understand. Tell me more.`, `That\'s interesting. Continue.`] };

        let responseType = 'default';
        if (keywords.includes('song') || keywords.includes('music')) responseType = 'song';
        else if (keywords.includes('2+2') || keywords.includes('math')) responseType = 'math';
        else if (keywords.includes('hello') || keywords.includes('hi')) responseType = 'hello';

        const responseArray = charData[responseType] || charData.default;
        return responseArray[Math.floor(Math.random() * responseArray.length)];
      };

      return {
        success: true,
        reply: generateFallback(character, userMessage),
        character,
        timestamp: new Date().toISOString()
      };
    }
  }

  buildPromptFromConfig(type, company, difficulty, interviewConfig) {
    if (!interviewConfig) {
      return this.getDefaultPrompt(type, company, difficulty);
    }

    const { mode, profile, role, level, topics } = interviewConfig;

    if (mode === 'cv' && profile) {
      return this.buildCVBasedPrompt(profile, difficulty);
    } else if (mode === 'role' && role && level) {
      return this.buildRoleBasedPrompt(role, level, difficulty);
    } else if (mode === 'practice' && topics) {
      return this.buildPracticePrompt(topics, difficulty);
    }

    return this.getDefaultPrompt(type, company, difficulty);
  }

  getDefaultPrompt(type, company, difficulty) {
    if (type === 'technical') {
      const techTopics = {
        easy: 'web development basics, JavaScript fundamentals, HTML/CSS, or simple programming concepts',
        medium: 'frameworks like React/Node.js, databases, APIs, or software engineering practices',
        hard: 'system architecture, performance optimization, security, or advanced programming patterns'
      };

      return company === 'general'
        ? `Generate a practical ${difficulty} level technical interview question about ${techTopics[difficulty] || techTopics.medium}. Focus on real-world development scenarios, NOT algorithm puzzles or data structure implementations like LRU cache. Ask about experience, best practices, or problem-solving approaches. Return only the question text.`
        : `Generate a practical ${difficulty} level technical interview question for ${company} company about ${techTopics[difficulty] || techTopics.medium}. Focus on real-world scenarios and practical knowledge, NOT coding challenges or algorithm problems. Return only the question text.`;
    } else if (type === 'english') {
      return company === 'general'
        ? `Generate a ${difficulty} level behavioral interview question about communication, teamwork, problem-solving, or professional experience. Return only the question text.`
        : `Generate a ${difficulty} level behavioral question that ${company} company asks about leadership, collaboration, or professional growth. Return only the question text.`;
    }
    return 'Tell me about your experience in software development.';
  }

  buildCVBasedPrompt(profile, difficulty) {
    const { experience, skills, projects, technologies } = profile;

    const skillsText = skills.slice(0, 3).join(', ');
    const techText = technologies.slice(0, 3).join(', ');
    const projectText = projects.length > 0 ? projects[0] : 'your projects';

    const questionTypes = [
      `Generate a skill-based question about ${skillsText} based on ${experience}. Ask about practical experience and real-world application. Return only the question text.`,
      `Generate a project-based question about ${projectText} or similar work. Focus on challenges, decisions, and outcomes. Return only the question text.`,
      `Generate a system design question related to ${techText} technologies. Ask about architecture, scalability, or best practices. Return only the question text.`,
      `Generate a behavioral question about leadership, teamwork, or problem-solving in the context of ${experience}. Return only the question text.`
    ];

    return questionTypes[Math.floor(Math.random() * questionTypes.length)];
  }

  buildRoleBasedPrompt(role, level, difficulty) {
    const roleQuestions = {
      'frontend': {
        'fresher': 'Generate a beginner frontend question about HTML, CSS, JavaScript basics, or responsive design. Return only the question text.',
        'junior': 'Generate a junior frontend question about React, Vue, or modern JavaScript frameworks and tools. Return only the question text.',
        'mid': 'Generate a mid-level frontend question about performance optimization, state management, or advanced React patterns. Return only the question text.'
      },
      'backend': {
        'fresher': 'Generate a beginner backend question about APIs, databases, or server-side programming basics. Return only the question text.',
        'junior': 'Generate a junior backend question about Node.js, Express, database design, or API development. Return only the question text.',
        'mid': 'Generate a mid-level backend question about microservices, system architecture, or performance optimization. Return only the question text.'
      },
      'fullstack': {
        'fresher': 'Generate a beginner full-stack question about web development fundamentals or MERN stack basics. Return only the question text.',
        'junior': 'Generate a junior full-stack question about MERN stack development, API integration, or deployment. Return only the question text.',
        'mid': 'Generate a mid-level full-stack question about system architecture, scalability, or end-to-end development. Return only the question text.'
      },
      'devops': {
        'fresher': 'Generate a beginner DevOps question about CI/CD, version control, or basic deployment concepts. Return only the question text.',
        'junior': 'Generate a junior DevOps question about Docker, cloud services, or automation tools. Return only the question text.',
        'mid': 'Generate a mid-level DevOps question about Kubernetes, infrastructure as code, or monitoring systems. Return only the question text.'
      },
      'data': {
        'fresher': 'Generate a beginner data analysis question about SQL, data visualization, or basic statistics. Return only the question text.',
        'junior': 'Generate a junior data analyst question about Python, data processing, or business intelligence tools. Return only the question text.',
        'mid': 'Generate a mid-level data analyst question about machine learning, advanced analytics, or data pipeline design. Return only the question text.'
      },
      'hr': {
        'fresher': 'Generate a behavioral question for entry-level candidates about motivation, learning, or career goals. Return only the question text.',
        'junior': 'Generate a behavioral question about teamwork, communication, or handling challenges in the workplace. Return only the question text.',
        'mid': 'Generate a behavioral question about leadership, conflict resolution, or strategic thinking. Return only the question text.'
      }
    };

    return roleQuestions[role]?.[level] || this.getDefaultPrompt('technical', 'general', difficulty);
  }

  buildPracticePrompt(topics, difficulty) {
    const topicPrompts = {
      'api': 'Generate a question about REST APIs, API design, HTTP methods, or API security. Return only the question text.',
      'auth': 'Generate a question about authentication, authorization, JWT tokens, or security practices. Return only the question text.',
      'system': 'Generate a system design question about scalability, architecture patterns, or distributed systems. Return only the question text.',
      'projects': 'Generate a question about project experience, challenges faced, or technical decisions made. Return only the question text.',
      'oop': 'Generate a question about object-oriented programming concepts, design patterns, or code organization. Return only the question text.',
      'hr': 'Generate a behavioral question about teamwork, leadership, or professional development. Return only the question text.',
      'communication': 'Generate a question about explaining technical concepts, documentation, or stakeholder communication. Return only the question text.',
      'confidence': 'Generate a question designed to build confidence, focusing on achievements or problem-solving skills. Return only the question text.'
    };

    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
    return topicPrompts[selectedTopic] || this.getDefaultPrompt('technical', 'general', difficulty);
  }

  // Clear session questions when interview ends
  clearSession(sessionId) {
    if (sessionId) {
      this.sessionQuestions.delete(sessionId);
    }
  }
}

module.exports = new AIService();