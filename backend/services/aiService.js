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