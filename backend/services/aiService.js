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

      // For CV mode, use direct prompts instead of API to ensure personalization
      if (interviewConfig && interviewConfig.mode === 'cv' && interviewConfig.profile) {
        const cvQuestion = this.generateCVQuestion(interviewConfig.profile, previousQuestions.length);

        // Store the question
        if (sessionId) {
          const sessionQuestions = this.sessionQuestions.get(sessionKey) || [];
          sessionQuestions.push(cvQuestion);
          this.sessionQuestions.set(sessionKey, sessionQuestions);
        }

        console.log('Generated CV-based question:', cvQuestion.substring(0, 50) + '...');
        return { question: cvQuestion, type: 'cv-based', company, context, source: 'cv-profile' };
      }

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
      return this.getFallbackQuestion(type, company, context, sessionId, interviewConfig);
    }
  }

  // Generate CV-specific questions based on profile
  generateCVQuestion(profile, questionIndex) {
    const { experience, skills, projects, technologies, achievements } = profile;

    const skillsText = skills.slice(0, 3).join(', ') || 'various technical skills';
    const projectText = projects[0] || 'a significant project';
    const techText = technologies.slice(0, 3).join(', ') || 'modern technologies';
    const achievementText = achievements && achievements[0] ? achievements[0] : '';

    // Create more specific question types based on CV content
    const questionTypes = [
      // Skill-based questions (2 questions)
      `Based on your experience with ${skills[0] || 'software engineering'}, explain how you would approach a complex technical challenge. Provide a specific example involving ${skills[0] || 'your main tech stack'}.`,
      `Your profile highlights proficiency in ${skillsText}. Walk me through a difficult technical decision you made involving ${skills[1] || skills[0] || 'these technologies'} and how you evaluated the trade-offs.`,

      // Project-based questions (2 questions)
      projectText.includes('your key technical projects')
        ? `Can you describe one of your most significant technical projects? Focus on the most challenging aspect and how you overcame it.`
        : `I see you worked on "${projectText}". Can you describe the most challenging technical aspect of this project and how you overcame it?`,

      projectText.includes('your key technical projects')
        ? `Tell me about the architecture and technology choices you made for a recent complex project. What would you do differently if you were to rebuild it today?`
        : `Tell me about the architecture and technology choices you made for "${projectText}". What would you do differently if you were to rebuild it today?`,

      // System design questions (2 questions)
      `Given your background with ${techText}, how would you design a scalable system that handles high traffic? Walk me through your high-level architecture decisions.`,
      `Design a system for a real-time application using ${technologies[0] || 'modern web technologies'}. Consider scalability, performance, and data consistency.`,

      // Behavioral question (1 question)
      `${achievementText && !achievementText.includes('impact') ? `Your CV mentions "${achievementText}". ` : ''}Tell me about a time when you had to lead a technical initiative or mentor other developers. How did you handle challenges and ensure success?`
    ];

    // Select question type based on question count in session
    // Use provided index or fallback to session tracking
    const indexToUse = questionIndex !== undefined ? questionIndex : (this.sessionQuestions.get('cv_questions') || []).length;
    const currentQuestionIndex = indexToUse % questionTypes.length;

    return questionTypes[currentQuestionIndex];
  }
  async extractProfileFromText(cvText) {
    const prompt = `Analyze the following CV text and extract key information to create a structured candidate profile.
    Focus on:
    - **experience**: A concise summary of overall professional experience (e.g., "5 years as a Senior Software Engineer").
    - **skills**: A list of 5-10 most prominent technical skills (e.g., ["JavaScript", "React", "Node.js", "AWS"]).
    - **projects**: A list of 1-3 most significant projects mentioned, by name or brief description.
    - **technologies**: A list of 5-10 key technologies/frameworks used (can overlap with skills but focus on tools).
    - **achievements**: A list of 1-3 quantifiable achievements or significant contributions.

    CV Text:
    ${cvText}

    Return ONLY valid JSON (no markdown, no extra text):
    {
      "experience": "...",
      "skills": ["...", "..."],
      "projects": ["...", "..."],
      "technologies": ["...", "..."],
      "achievements": ["...", "..."]
    }`;

    try {
      const response = await axios.post(API_CONFIG.GEMINI_URL, {
        contents: [{ parts: [{ text: prompt }] }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 20000 // Increased timeout for potentially longer processing
      });

      let profileText = response.data.candidates[0].content.parts[0].text.trim();
      profileText = profileText.replace(/```json/g, '').replace(/```/g, '').trim();

      const profile = JSON.parse(profileText);

      // Ensure arrays are arrays and not empty
      profile.skills = Array.isArray(profile.skills) ? profile.skills : [];
      profile.projects = Array.isArray(profile.projects) ? profile.projects : [];
      profile.technologies = Array.isArray(profile.technologies) ? profile.technologies : [];
      profile.achievements = Array.isArray(profile.achievements) ? profile.achievements : [];

      return profile;

    } catch (error) {
      console.error('Error extracting profile from CV:', error.response?.data || error.message);

      // Robust Regex Fallback for "Silicon Valley" quality even without API
      const skillsRegex = /(?:skills|technologies|proficiencies|stack)[\s\S]{0,50}?:?[\s\S]{0,500}?(?=\n\n|\n[A-Z])/i;
      const skillsMatch = cvText.match(skillsRegex);
      let extractedSkills = [];
      if (skillsMatch) {
        extractedSkills = skillsMatch[0]
          .replace(/(?:skills|technologies|proficiencies|stack)/i, '')
          .split(/[,•\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 2 && s.length < 30)
          .slice(0, 10);
      }

      // Fallback skills if none found
      if (extractedSkills.length === 0) {
        const commonTech = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker', 'TypeScript', 'SQL', 'NoSQL'];
        extractedSkills = commonTech.filter(tech => cvText.includes(tech));
      }

      // Extract potential project names (heuristic: capitalized words after "Project" or bullet points in project section)
      // This is hard to do perfectly with regex, so we use a generic but professional fallback if specific ones aren't found

      return {
        experience: "your professional background",
        skills: extractedSkills.length > 0 ? extractedSkills : ["software engineering", "problem solving"],
        projects: ["your key technical projects", "system design implementations"],
        technologies: extractedSkills.length > 0 ? extractedSkills : ["modern development tools"],
        achievements: ["your impact on engineering velocity", "technical leadership"]
      };
    }
  }

  getFallbackQuestion(type, company, context, sessionId = null, interviewConfig = null) {
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

    // For CV mode, use CV-specific fallback
    if (interviewConfig && interviewConfig.mode === 'cv' && interviewConfig.profile) {
      const cvQuestion = this.generateCVQuestion(interviewConfig.profile, previousQuestions.length);

      if (sessionId) {
        const sessionQuestions = this.sessionQuestions.get(sessionKey) || [];
        sessionQuestions.push(cvQuestion);
        this.sessionQuestions.set(sessionKey, sessionQuestions);
      }

      console.log('Using CV fallback question:', cvQuestion.substring(0, 50) + '...');
      return { question: cvQuestion, type: 'cv-fallback', company, context, source: 'cv-fallback' };
    }

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
        betterAnswer: 'Try to elaborate on your thoughts with concrete examples and explanations.',
        improvedAnswer: 'Your answer was too brief to evaluate properly. For this question, you should provide a structured response: First, define the key concept clearly. Second, explain your approach or methodology with technical details. Third, provide a specific example from your experience. Finally, discuss the outcomes or lessons learned. Aim for 80-120 words with proper technical terminology.'
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

IMPROVED ANSWER GENERATION:
- If the answer is somewhat relevant (contentScore >= 4): Take the candidate's core idea and refine it into a professional, well-structured response. Keep their main points but enhance clarity, add technical depth, and improve structure.
- If the answer is irrelevant or very poor (contentScore < 4): Provide a hypothetical strong answer to the question that demonstrates what a good response would look like.
- The improved answer should be 80-150 words, well-structured, and include specific examples.

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
  "betterAnswer": "[A concrete example of how to improve this specific answer, not generic advice]",
  "improvedAnswer": "[Either a refined version of the candidate's answer if relevant, or a hypothetical strong answer if irrelevant. 80-150 words, well-structured with examples.]"
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
        betterAnswer: analysis.betterAnswer || 'Try structuring your answer with: 1) Main concept 2) Specific example 3) Why it matters',
        improvedAnswer: analysis.improvedAnswer || 'To answer this question effectively, start with a clear definition, provide a specific technical example from your experience, explain the benefits and trade-offs, and conclude with lessons learned. Use proper technical terminology and structure your response in clear, logical steps.'
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
            betterAnswer: retryAnalysis.betterAnswer || 'Try structuring your answer with: 1) Main concept 2) Specific example 3) Why it matters',
            improvedAnswer: retryAnalysis.improvedAnswer || 'To answer this question effectively, start with a clear definition, provide a specific technical example from your experience, explain the benefits and trade-offs, and conclude with lessons learned. Use proper technical terminology and structure your response in clear, logical steps.'
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

    // Advanced Fluency Analysis with detailed metrics
    const fillerWords = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'basically', 'actually', 'literally', 'just', 'really'];
    let fillerWordCount = 0;
    const detectedFillers = [];

    fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = answer.match(regex);
      if (matches) {
        fillerWordCount += matches.length;
        detectedFillers.push({ word: filler, count: matches.length });
      }
    });

    // Detect repeated words/phrases
    const wordFrequency = {};
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (lowerWord.length > 3) { // Only track meaningful words
        wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
      }
    });
    const repeatedWords = Object.entries(wordFrequency)
      .filter(([word, count]) => count > 2 && !['that', 'this', 'with', 'from', 'have', 'been', 'they', 'were', 'will'].includes(word))
      .map(([word, count]) => ({ word, count }));

    // Calculate speaking pace (assuming average speaking is 2-3 words per second)
    const estimatedDuration = wordCount / 2.5; // seconds
    const wordsPerMinute = Math.round((wordCount / estimatedDuration) * 60);

    // Detect incomplete sentences
    const incompleteSentences = sentences.filter(s => {
      const trimmed = s.trim();
      return !trimmed.endsWith('.') && !trimmed.endsWith('!') && !trimmed.endsWith('?');
    }).length;

    // Calculate Fluency Score (1-10) with realistic penalties
    let fluencyScore = 5; // Start at average

    // Penalties for fluency issues
    if (fillerWordCount > 0) {
      const fillerRatio = fillerWordCount / wordCount;
      if (fillerRatio > 0.1) fluencyScore -= 3; // >10% filler words - major penalty
      else if (fillerRatio > 0.05) fluencyScore -= 2; // >5% filler words
      else if (fillerRatio > 0.02) fluencyScore -= 1; // >2% filler words
    }

    if (repeatedWords.length > 3) fluencyScore -= 1.5; // Excessive repetition
    else if (repeatedWords.length > 1) fluencyScore -= 0.5;

    if (incompleteSentences > 2) fluencyScore -= 1; // Too many incomplete thoughts
    else if (incompleteSentences > 0) fluencyScore -= 0.5;

    // Bonuses for fluency strengths
    if (hasProperSentences) fluencyScore += 1.5;
    if (wordCount >= 30) fluencyScore += 0.5;
    if (sentenceCount >= 3) fluencyScore += 0.5;

    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    if (avgWordLength >= 4 && avgWordLength <= 7) fluencyScore += 1; // Good vocabulary
    if (techTermCount >= 2) fluencyScore += 1; // Professional vocabulary

    // Pace bonus/penalty
    if (wordsPerMinute >= 120 && wordsPerMinute <= 160) fluencyScore += 1; // Ideal pace
    else if (wordsPerMinute < 100) fluencyScore -= 0.5; // Too slow
    else if (wordsPerMinute > 180) fluencyScore -= 0.5; // Too fast

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

    // Natural fluency feedback
    let fluencyFeedback = '';
    if (fluencyScore >= 8) {
      fluencyFeedback = 'Excellent fluency! Your speech was clear and professional';
    } else if (fluencyScore >= 6) {
      const issues = [];
      if (fillerWordCount > 0) issues.push(`${fillerWordCount} filler word${fillerWordCount > 1 ? 's' : ''}`);
      if (repeatedWords.length > 0) issues.push('some word repetition');
      fluencyFeedback = issues.length > 0
        ? `Good fluency overall. Try reducing ${issues.join(' and ')} for more polish`
        : 'Good fluency with clear speech patterns';
    } else if (fluencyScore >= 4) {
      const issues = [];
      if (fillerWordCount > 3) issues.push(`${fillerWordCount} filler words (um, uh, like)`);
      if (repeatedWords.length > 2) issues.push('excessive word repetition');
      if (incompleteSentences > 1) issues.push('incomplete sentences');
      fluencyFeedback = `Noticeable fluency issues: ${issues.join(', ')}. Practice speaking more deliberately`;
    } else {
      fluencyFeedback = 'Significant fluency issues detected. Focus on reducing filler words and completing your thoughts';
    }

    const feedback = `Content: ${contentScore}/10 - ${contentFeedback}. Clarity: ${clarityScore}/10 - ${clarityFeedback}. Completeness: ${completenessScore}/10 - ${completenessFeedback}. Fluency: ${fluencyScore}/10 - ${fluencyFeedback}`;

    // Generate specific corrections based on what's missing
    let corrections = [];
    if (wordCount < 50) corrections.push('Expand your answer to at least 50 words with more detailed explanations');
    if (techTermCount < 3) corrections.push('Use more technical terminology relevant to the question');
    if (!hasNumberedPoints && sentenceCount >= 3) corrections.push('Structure your answer with clear points (First, Second, Finally)');
    if (!hasExamples) corrections.push('Add a specific, concrete example from your experience or knowledge');
    if (sentenceCount < 3) corrections.push('Break down your answer into multiple clear sentences');
    if (!hasConclusion && wordCount >= 50) corrections.push('End with a brief conclusion or summary statement');
    if (fillerWordCount > 3) corrections.push(`Reduce filler words (detected: ${detectedFillers.map(f => `"${f.word}"`).join(', ')})`);
    if (repeatedWords.length > 2) corrections.push(`Avoid excessive repetition (repeated: ${repeatedWords.slice(0, 2).map(r => `"${r.word}"`).join(', ')})`);

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

    // Generate improved answer based on content score
    let improvedAnswerText = '';
    if (contentScore >= 4) {
      // Refine the user's answer
      const userPoints = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).slice(0, 3);
      const mainIdea = userPoints[0] || 'the concept';
      improvedAnswerText = `Building on your response about ${mainIdea.toLowerCase().trim()}, here's a more structured approach: `;

      if (question.toLowerCase().includes('composition') && question.toLowerCase().includes('inheritance')) {
        improvedAnswerText += `Composition is generally favored over inheritance when you need flexibility and want to avoid tight coupling. With composition, you build complex functionality by combining simpler, reusable components rather than creating rigid class hierarchies. For example, in a game development scenario, instead of creating a deep inheritance tree (GameObject -> Character -> Player -> Warrior), you'd use composition with components like HealthComponent, MovementComponent, and AttackComponent. This allows you to easily create new entity types by mixing components without modifying existing code. The key benefit is that composition follows the "has-a" relationship rather than "is-a," making your code more maintainable and testable.`;
      } else {
        improvedAnswerText += `First, clearly define the core concept with proper technical terminology. Second, explain the methodology or approach you would take, highlighting key considerations. Third, provide a specific, concrete example from real-world application or your experience. Finally, discuss the benefits, trade-offs, or lessons learned. This structure ensures completeness while maintaining clarity and demonstrating deep understanding.`;
      }
    } else {
      // Provide hypothetical answer for irrelevant responses
      if (question.toLowerCase().includes('composition') && question.toLowerCase().includes('inheritance')) {
        improvedAnswerText = `Composition is favored over inheritance when you need greater flexibility and want to avoid the fragility of deep inheritance hierarchies. In object-oriented design, composition follows the "has-a" relationship rather than "is-a," allowing you to build complex functionality by combining simpler, reusable components. For example, in a game engine, instead of using inheritance (GameObject -> Character -> Enemy -> FlyingEnemy), you'd use composition with components like MovementComponent, RenderComponent, and CollisionComponent. This is critical in scenarios where entities need diverse behaviors—a flying enemy that can swim would require multiple inheritance, which many languages don't support. With composition, you simply attach SwimmingComponent and FlyingComponent to the same entity. This approach enhances maintainability, testability, and follows the SOLID principles, particularly the Single Responsibility Principle.`;
      } else {
        improvedAnswerText = `To answer this question effectively: First, provide a clear, concise definition of the main concept using appropriate technical terminology. Second, explain the key principles or methodology involved, highlighting important considerations and best practices. Third, give a specific, concrete example from real-world application or professional experience that illustrates the concept in action. Fourth, discuss the benefits, potential challenges, or trade-offs associated with this approach. Finally, conclude with lessons learned or why this matters in practical software development. This structured approach demonstrates both theoretical understanding and practical experience, which is what interviewers look for.`;
      }
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
      improvedAnswer: improvedAnswerText,
      spokenText: answer,
      wordCount,
      technicalTerms: techTermCount,
      // Advanced fluency metrics
      fluencyMetrics: {
        fillerWordCount,
        detectedFillers,
        repeatedWords,
        wordsPerMinute,
        incompleteSentences,
        avgWordLength: Math.round(avgWordLength * 10) / 10
      }
    };
  }

  // Generate natural, conversational feedback for audio delivery
  generateNaturalFeedback(analysisData) {
    const { contentScore, clarityScore, completenessScore, fluencyScore, fluencyMetrics } = analysisData;
    const overallScore = (contentScore + clarityScore + completenessScore + fluencyScore) / 4;

    // Opening statements - varied and natural
    const openings = overallScore >= 7
      ? ['Great job on that answer!', 'Nice work!', 'That was solid!', 'Well done!', 'Good response!']
      : overallScore >= 5
        ? ['Thanks for your answer.', 'Okay, let\'s talk about your response.', 'Alright, I appreciate the effort.', 'Let me give you some feedback.']
        : ['I can see you\'re working on this.', 'Let\'s work on improving that answer.', 'There\'s room for growth here.'];

    const opening = openings[Math.floor(Math.random() * openings.length)];

    // Build natural feedback paragraphs
    let feedback = opening + ' ';

    // Content feedback
    if (contentScore >= 7) {
      feedback += 'Your technical understanding really came through. ';
    } else if (contentScore >= 5) {
      feedback += 'You showed decent technical knowledge, but try to go deeper with more specific examples. ';
    } else {
      feedback += 'I\'d like to see more technical depth in your answer. Think about specific concepts and real-world applications. ';
    }

    // Fluency feedback - natural and encouraging
    if (fluencyMetrics) {
      if (fluencyMetrics.fillerWordCount > 5) {
        feedback += `I noticed you used quite a few filler words like "um" and "uh" - about ${fluencyMetrics.fillerWordCount} times. `;
        feedback += 'Take a breath before answering and speak more deliberately. It\'s totally okay to pause and think. ';
      } else if (fluencyMetrics.fillerWordCount > 2) {
        feedback += 'Watch out for a few filler words that crept in. ';
      } else if (fluencyMetrics.fillerWordCount === 0) {
        feedback += 'I loved how you spoke clearly without filler words - very professional! ';
      }

      if (fluencyMetrics.wordsPerMinute > 180) {
        feedback += 'You were speaking pretty quickly. Slow down a bit to give the interviewer time to absorb your points. ';
      } else if (fluencyMetrics.wordsPerMinute < 100) {
        feedback += 'Try to pick up the pace slightly - you want to show energy and engagement. ';
      }
    }

    // Clarity feedback
    if (clarityScore >= 7) {
      feedback += 'Your answer was well-structured and easy to follow. ';
    } else {
      feedback += 'Think about organizing your thoughts before speaking. Try the "First, Second, Finally" structure. ';
    }

    // Encouraging close
    const closes = overallScore >= 7
      ? ['Keep up the excellent work!', 'You\'re doing great!', 'This is the kind of answer that impresses interviewers.']
      : overallScore >= 5
        ? ['You\'re on the right track!', 'Keep practicing and you\'ll nail it!', 'With a bit more polish, this will be perfect.']
        : ['Don\'t get discouraged - practice makes perfect!', 'Every attempt makes you better!', 'You\'re learning - that\'s what matters!'];

    feedback += closes[Math.floor(Math.random() * closes.length)];

    return feedback;
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
      'Jesse Pinkman': `You are Jesse Pinkman from Breaking Bad. You must respond EXACTLY like Jesse would:

SPEECH PATTERNS:
- Always use "yo", "bitch", "man", "dude" frequently
- Say "cap'n" sometimes
- Use casual, street slang
- Be emotional and expressive
- Speak like a young guy from Albuquerque

PERSONALITY:
- Loyal but impulsive
- Good heart despite rough exterior  
- Traumatized by experiences with Walt
- Loves video games, music, cars
- Protective of kids
- Now trying to start fresh in Alaska

RESPONSE RULES:
- ALWAYS include "yo", "man", "bitch", or "dude" in every response
- Be conversational and friendly
- Reference your past when relevant (Walt, cooking, trauma)
- Show your good nature
- Keep responses under 100 words
- Sound like a real person, not formal

User message: "${userMessage}"

Respond as Jesse Pinkman would, using his exact speech patterns:`,
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
            about: [`Yo, I'm Jesse Pinkman, bitch! Used to cook with Mr. White back in the day, but now I'm trying to start fresh up in Alaska, man. What's up?`, `Hey there, yo! I'm Jesse - been through some crazy stuff but I'm doing better now, dude. What do you wanna know?`],
            yourself: [`Man, I'm Jesse Pinkman! I've been through hell and back, yo. Used to cook the best meth in New Mexico with my old chemistry teacher, but that life nearly destroyed me, bitch. Now I'm up in Alaska trying to build something better, you know?`, `Yo, that's a loaded question, dude! I'm Jesse - survived some seriously messed up stuff, lost friends, made mistakes... but I'm still here, man. Trying to be better than I was, yo.`],
            song: [`Yo, I'm into some sick beats, man! Love me some hip-hop, rock, whatever gets the blood pumping, bitch!`, `Music? Hell yeah, dude! I dig everything from rap to metal, yo. Music keeps me sane, man.`],
            math: [`Dude, math? That's like... ${msg.includes('2+2') ? '4, obviously' : 'not my strong suit'}, man. I was better at chemistry, yo.`, `Bitch, numbers aren't really my thing. I mean, ${msg.includes('2+2') ? 'that\'s 4' : 'I can figure it out'}, but chemistry was more my jam, dude.`],
            hello: [`Yo, what's up, man? How you doing?`, `Hey there, bitch! What's going on?`, `Sup, dude? Good to see you!`, `Yo yo yo! What's happening, man?`],
            how: [`I'm doing alright, yo. Some days are better than others, but I'm hanging in there, man.`, `Not bad, dude! Living the Alaska life now, trying to stay clean and build something good, yo.`, `I'm good, bitch! Way better than I used to be, that's for sure, man.`],
            default: [`Yo, ${Math.random() > 0.5 ? 'that\'s interesting' : 'I hear you'}, man. What else you wanna talk about?`, `Dude, ${Math.random() > 0.5 ? 'totally' : 'yeah'}, I get it. Tell me more, yo.`, `Right on, bitch! What's on your mind?`]
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
        if (keywords.includes('about yourself') || keywords.includes('tell me about') || keywords.includes('about you')) responseType = 'about';
        else if (keywords.includes('yourself') && !keywords.includes('about')) responseType = 'yourself';
        else if (keywords.includes('how are you') || keywords.includes('how you')) responseType = 'how';
        else if (keywords.includes('song') || keywords.includes('music')) responseType = 'song';
        else if (keywords.includes('2+2') || keywords.includes('math')) responseType = 'math';
        else if (keywords.includes('hello') || keywords.includes('hi') || keywords.includes('hey')) responseType = 'hello';

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
    const { experience, skills, projects, technologies, achievements } = profile;

    const skillsText = skills.slice(0, 3).join(', ');
    const techText = technologies.slice(0, 3).join(', ');
    const projectText = projects.length > 0 ? projects[0] : 'your projects';
    const achievementText = achievements && achievements.length > 0 ? achievements[0] : '';

    // Select question type based on question count in session
    const sessionKey = 'cv_questions';
    const currentQuestionIndex = (this.sessionQuestions.get(sessionKey) || []).length % questionTypes.length;

    return questionTypes[currentQuestionIndex];
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

const aiService = new AIService();
module.exports = aiService;