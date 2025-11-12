const axios = require('axios');
const { API_CONFIG } = require('../config/constants');
const cache = require('../utils/cache');

class LearningService {
  constructor() {
    this.userProgress = {};
    this.initializeLearningData();
  }

  initializeLearningData() {
    this.learningRoadmap = {
      webdev: {
        beginner: ['HTML/CSS Basics', 'JavaScript Fundamentals', 'DOM Manipulation', 'Responsive Design'],
        intermediate: ['React/Vue', 'Node.js/Express', 'REST APIs', 'Database Integration'],
        advanced: ['System Architecture', 'Performance Optimization', 'Security', 'DevOps']
      },
      datascience: {
        beginner: ['Python Basics', 'Data Analysis', 'Statistics', 'Data Visualization'],
        intermediate: ['Machine Learning', 'Pandas/NumPy', 'SQL Databases', 'Feature Engineering'],
        advanced: ['Deep Learning', 'Big Data', 'MLOps', 'Model Deployment']
      },
      ml: {
        beginner: ['ML Fundamentals', 'Supervised Learning', 'Data Preprocessing', 'Model Evaluation'],
        intermediate: ['Neural Networks', 'Unsupervised Learning', 'Feature Selection', 'Cross Validation'],
        advanced: ['Deep Learning', 'NLP', 'Computer Vision', 'Model Optimization']
      },
      behavioral: {
        beginner: ['Self Introduction', 'Strengths/Weaknesses', 'Career Goals'],
        intermediate: ['Leadership', 'Conflict Resolution', 'Team Collaboration'],
        advanced: ['Strategic Thinking', 'Change Management', 'Innovation']
      }
    };

    this.generalQuestions = {
      'HTML/CSS Basics': [
        'What is the difference between HTML and CSS?',
        'Explain the CSS box model.',
        'What are semantic HTML elements?',
        'How do you make a website responsive?',
        'What is the difference between class and ID in CSS?'
      ],
      'JavaScript Fundamentals': [
        'What is the difference between let, const, and var?',
        'Explain closures in JavaScript.',
        'What is event bubbling and capturing?',
        'How does hoisting work in JavaScript?',
        'What are promises and how do they work?'
      ],
      'Self Introduction': [
        'Tell me about yourself.',
        'What are your key strengths?',
        'Why are you interested in this field?',
        'What motivates you in your work?',
        'Describe your ideal work environment.'
      ]
    };
  }

  getRoadmap(field, level = 'beginner') {
    const topics = this.learningRoadmap[field]?.[level] || [];
    
    return {
      success: true,
      field,
      level,
      topics,
      totalTopics: topics.length
    };
  }

  getTopicQuestions(topic, level = 'beginner', field = 'webdev', company = 'general') {
    const cacheKey = `questions_${company}_${field}_${topic}_${level}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Get general questions or generate generic ones
    const topicQuestions = this.generalQuestions[topic] || [
      `What is your experience with ${topic}?`,
      `How would you explain ${topic} to a beginner?`,
      `What are the best practices for ${topic}?`,
      `What challenges have you faced with ${topic}?`,
      `How do you stay updated with ${topic}?`
    ];
    
    const result = {
      success: true,
      topic,
      level,
      field,
      company,
      questions: topicQuestions.map((q, index) => ({
        id: `${company}_${topic}_${index}`,
        question: q,
        completed: false
      }))
    };

    cache.set(cacheKey, result);
    return result;
  }

  async generateAnswer(question, level = 'beginner', field = 'webdev', topic, company = 'general') {
    const fieldContext = {
      webdev: 'web development, focusing on frontend/backend technologies, frameworks, and best practices',
      datascience: 'data science, focusing on data analysis, statistics, machine learning, and data visualization',
      ml: 'machine learning, focusing on algorithms, model training, neural networks, and AI concepts',
      behavioral: 'professional behavior and soft skills'
    };
    
    const companyContext = {
      google: 'Google\'s scale (billions of users), innovation culture, technical excellence, and focus on solving complex problems with elegant solutions',
      microsoft: 'Microsoft\'s enterprise focus, productivity tools, cloud services (Azure), and commitment to empowering every person and organization',
      amazon: 'Amazon\'s customer obsession, operational excellence, high standards, and experience with massive scale e-commerce and cloud infrastructure',
      meta: 'Meta\'s mission to connect people, social media platforms, real-time communication, and building technology that brings the world closer together',
      apple: 'Apple\'s focus on user experience, privacy, design excellence, and creating products that enrich people\'s lives',
      netflix: 'Netflix\'s data-driven culture, personalization, global streaming platform, and focus on entertaining the world'
    };
    
    const companyPrompt = company !== 'general' ? 
      `\n\nCompany Context: Frame your answer considering ${companyContext[company] || 'general industry standards'}. Include specific examples or considerations relevant to ${company.charAt(0).toUpperCase() + company.slice(1)}'s environment, scale, and values.` : '';
    
    const prompt = `Generate a comprehensive ${level}-level answer for this ${field} interview question: "${question}"
    
    Context: This is for ${fieldContext[field] || 'general technical knowledge'}.
    Topic: ${topic || 'General'}${companyPrompt}
    
    Requirements:
    - ${level === 'beginner' ? '3-4 clear sentences, simple explanation with basic concepts' : 
        level === 'intermediate' ? '5-6 sentences with practical examples and implementation details' : 
        '7-8 sentences with advanced concepts, best practices, and real-world scenarios'}
    - Each sentence should be a complete thought that can stand alone
    - Use field-specific terminology and examples
    - Clear, professional language suitable for speaking practice
    - Include relevant ${field} technologies, tools, or methodologies
    ${company !== 'general' ? `- Reference ${company.charAt(0).toUpperCase() + company.slice(1)}-specific technologies, scale, or approaches where relevant` : ''}
    - Structure as separate sentences that flow logically
    
    Return ONLY the answer text with each sentence on a new line.`;
    
    try {
      const response = await axios.post(API_CONFIG.GEMINI_URL, {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      const answer = response.data.candidates[0].content.parts[0].text.trim();
      
      // Split into lines for line-by-line practice
      const lines = answer.split(/[.!?]+/).filter(line => line.trim().length > 0).map(line => line.trim() + '.');
      const formattedLines = lines.map((line, index) => ({
        id: index,
        text: line,
        spoken: false
      }));
      
      return {
        success: true,
        question,
        answer,
        lines: formattedLines,
        totalLines: formattedLines.length,
        field,
        level
      };
    } catch (error) {
      console.error('Error generating answer:', error);
      return this.getFallbackAnswer(question, field, level);
    }
  }

  getFallbackAnswer(question, field, level) {
    const fallbackAnswers = {
      webdev: 'In web development, this involves using modern frameworks like React or Vue.js, implementing responsive design principles, and following best practices for performance and accessibility.',
      datascience: 'In data science, this requires analyzing datasets using Python libraries like Pandas and NumPy, applying statistical methods, and creating visualizations to derive meaningful insights.',
      ml: 'In machine learning, this involves selecting appropriate algorithms, preprocessing data effectively, training models with proper validation techniques, and evaluating performance using relevant metrics.',
      behavioral: 'This requires strong communication skills, collaborative teamwork, and the ability to adapt to changing requirements while maintaining professional relationships and delivering quality results.'
    };
    
    const fallbackAnswer = fallbackAnswers[field] || 'This requires understanding the fundamental concepts. You should apply best practices consistently. Continuous learning helps you stay updated with industry standards.';
    
    const fallbackLines = fallbackAnswer.split(/[.!?]+/).filter(line => line.trim().length > 0).map(line => line.trim() + '.');
    
    return {
      success: true,
      question: question,
      answer: fallbackAnswer,
      lines: fallbackLines.map((line, index) => ({
        id: index,
        text: line,
        spoken: false
      })),
      totalLines: fallbackLines.length,
      field,
      level
    };
  }

  updateProgress(userId, questionId, completed, accuracy) {
    if (!this.userProgress[userId]) {
      this.userProgress[userId] = {};
    }
    
    this.userProgress[userId][questionId] = {
      completed,
      accuracy,
      completedAt: new Date().toISOString(),
      attempts: (this.userProgress[userId][questionId]?.attempts || 0) + 1
    };
    
    return {
      success: true,
      message: 'Progress updated successfully'
    };
  }

  getProgress(userId) {
    const progress = this.userProgress[userId] || {};
    
    return {
      success: true,
      progress,
      totalCompleted: Object.values(progress).filter(p => p.completed).length
    };
  }
}

module.exports = new LearningService();