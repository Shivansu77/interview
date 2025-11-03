const express = require('express');
const axios = require('axios');
const router = express.Router();

const GEMINI_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Learning roadmap with field-specific topics
const learningRoadmap = {
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

// Predefined questions for each topic
const predefinedQuestions = {
  // Web Development
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
  'React/Vue': [
    'What is the virtual DOM and why is it useful?',
    'Explain the component lifecycle in React.',
    'What are React hooks and why use them?',
    'How do you manage state in a React application?',
    'What is the difference between props and state?'
  ],
  
  // Data Science
  'Python Basics': [
    'What are the key features of Python?',
    'Explain list comprehensions in Python.',
    'What is the difference between lists and tuples?',
    'How do you handle exceptions in Python?',
    'What are decorators in Python?'
  ],
  'Machine Learning': [
    'What is the difference between supervised and unsupervised learning?',
    'Explain overfitting and how to prevent it.',
    'What is cross-validation and why is it important?',
    'How do you choose the right algorithm for a problem?',
    'What is feature engineering and why is it crucial?'
  ],
  'Data Analysis': [
    'How do you handle missing data in a dataset?',
    'What is exploratory data analysis (EDA)?',
    'Explain the difference between correlation and causation.',
    'How do you detect and handle outliers?',
    'What are the steps in a typical data analysis workflow?'
  ],
  
  // ML Specific
  'ML Fundamentals': [
    'What is machine learning and how does it work?',
    'Explain bias-variance tradeoff.',
    'What is the difference between classification and regression?',
    'How do you evaluate a machine learning model?',
    'What is gradient descent and how does it work?'
  ],
  'Neural Networks': [
    'How does a neural network learn?',
    'What is backpropagation?',
    'Explain different activation functions.',
    'What is the vanishing gradient problem?',
    'How do you prevent overfitting in neural networks?'
  ],
  
  // Behavioral
  'Self Introduction': [
    'Tell me about yourself.',
    'What are your key strengths?',
    'Why are you interested in this field?',
    'What motivates you in your work?',
    'Describe your ideal work environment.'
  ],
  'Leadership': [
    'Describe a time when you led a team.',
    'How do you handle conflicts in a team?',
    'What makes a good leader?',
    'How do you motivate team members?',
    'Describe a challenging project you managed.'
  ]
};

// User progress storage (in-memory, replace with database)
let userProgress = {};

router.get('/roadmap/:field', async (req, res) => {
  try {
    const { field } = req.params;
    const { level = 'beginner' } = req.query;
    
    const topics = learningRoadmap[field]?.[level] || [];
    
    res.json({
      success: true,
      field,
      level,
      topics,
      totalTopics: topics.length
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ error: 'Failed to fetch learning roadmap' });
  }
});

router.get('/topic/:topic/questions', async (req, res) => {
  try {
    const { topic } = req.params;
    const { level = 'beginner', field = 'webdev' } = req.query;
    
    // Get predefined questions for the topic
    const topicQuestions = predefinedQuestions[topic] || [
      `What is your experience with ${topic}?`,
      `How would you explain ${topic} to a beginner?`,
      `What are the best practices for ${topic}?`,
      `What challenges have you faced with ${topic}?`,
      `How do you stay updated with ${topic}?`
    ];
    
    res.json({
      success: true,
      topic,
      level,
      field,
      questions: topicQuestions.map((q, index) => ({
        id: `${topic}_${index}`,
        question: q,
        completed: false
      }))
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/question/answer', async (req, res) => {
  try {
    const { question, level = 'beginner', field = 'webdev', topic } = req.body;
    
    const fieldContext = {
      webdev: 'web development, focusing on frontend/backend technologies, frameworks, and best practices',
      datascience: 'data science, focusing on data analysis, statistics, machine learning, and data visualization',
      ml: 'machine learning, focusing on algorithms, model training, neural networks, and AI concepts',
      behavioral: 'professional behavior and soft skills'
    };
    
    const prompt = `Generate a comprehensive ${level}-level answer for this ${field} interview question: "${question}"
    
    Context: This is for ${fieldContext[field] || 'general technical knowledge'}.
    Topic: ${topic || 'General'}
    
    Requirements:
    - ${level === 'beginner' ? '3-4 clear sentences, simple explanation with basic concepts' : 
        level === 'intermediate' ? '5-6 sentences with practical examples and implementation details' : 
        '7-8 sentences with advanced concepts, best practices, and real-world scenarios'}
    - Each sentence should be a complete thought that can stand alone
    - Use field-specific terminology and examples
    - Clear, professional language suitable for speaking practice
    - Include relevant ${field} technologies, tools, or methodologies
    - Structure as separate sentences that flow logically
    
    Return ONLY the answer text with each sentence on a new line.`;
    
    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{ text: prompt }]
      }]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const answer = response.data.candidates[0].content.parts[0].text.trim();
    
    // Split into lines for line-by-line practice
    const lines = answer.split(/[.!?]+/).filter(line => line.trim().length > 0).map(line => line.trim() + '.');
    const formattedLines = lines.map((line, index) => ({
      id: index,
      text: line,
      spoken: false
    }));
    
    res.json({
      success: true,
      question,
      answer,
      lines: formattedLines,
      totalLines: formattedLines.length,
      field,
      level
    });
  } catch (error) {
    console.error('Error generating answer:', error);
    
    // Field-specific fallback answers
    const fallbackAnswers = {
      webdev: 'In web development, this involves using modern frameworks like React or Vue.js, implementing responsive design principles, and following best practices for performance and accessibility.',
      datascience: 'In data science, this requires analyzing datasets using Python libraries like Pandas and NumPy, applying statistical methods, and creating visualizations to derive meaningful insights.',
      ml: 'In machine learning, this involves selecting appropriate algorithms, preprocessing data effectively, training models with proper validation techniques, and evaluating performance using relevant metrics.',
      behavioral: 'This requires strong communication skills, collaborative teamwork, and the ability to adapt to changing requirements while maintaining professional relationships and delivering quality results.'
    };
    
    const fallbackAnswer = fallbackAnswers[field] || 'This requires understanding the fundamental concepts. You should apply best practices consistently. Continuous learning helps you stay updated with industry standards.';
    
    const fallbackLines = fallbackAnswer.split(/[.!?]+/).filter(line => line.trim().length > 0).map(line => line.trim() + '.');
    
    res.json({
      success: true,
      question: req.body.question,
      answer: fallbackAnswer,
      lines: fallbackLines.map((line, index) => ({
        id: index,
        text: line,
        spoken: false
      })),
      totalLines: fallbackLines.length,
      field,
      level
    });
  }
});

router.post('/progress/update', async (req, res) => {
  try {
    const { userId, questionId, completed, accuracy } = req.body;
    
    if (!userProgress[userId]) {
      userProgress[userId] = {};
    }
    
    userProgress[userId][questionId] = {
      completed,
      accuracy,
      completedAt: new Date().toISOString(),
      attempts: (userProgress[userId][questionId]?.attempts || 0) + 1
    };
    
    res.json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const progress = userProgress[userId] || {};
    
    res.json({
      success: true,
      progress,
      totalCompleted: Object.values(progress).filter(p => p.completed).length
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

module.exports = router;