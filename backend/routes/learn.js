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

// Company-specific questions for realistic interview scenarios
const companyQuestions = {
  google: {
    webdev: [
      'How would you optimize the performance of a web application serving millions of users like Google Search?',
      'Explain how you would implement real-time collaboration features similar to Google Docs.',
      'How would you design a scalable frontend architecture for a product like Gmail?',
      'Describe your approach to implementing accessibility features in a complex web application.',
      'How would you handle state management in a large-scale React application like Google Drive?'
    ],
    datascience: [
      'How would you design a recommendation system for YouTube videos?',
      'Explain how you would analyze user behavior data to improve Google Search results.',
      'How would you approach A/B testing for a feature used by billions of users?',
      'Describe how you would build a machine learning pipeline for Google Ads targeting.',
      'How would you handle data privacy while still extracting valuable insights from user data?'
    ],
    ml: [
      'How would you improve the accuracy of Google Translate for low-resource languages?',
      'Explain your approach to building a computer vision system for Google Photos.',
      'How would you design a neural network architecture for Google Assistant voice recognition?',
      'Describe how you would implement and scale a deep learning model for billions of users.',
      'How would you approach bias detection and mitigation in Google\'s hiring algorithms?'
    ],
    behavioral: [
      'Tell me about a time when you had to work with ambiguous requirements on a large-scale project.',
      'How do you stay innovative while maintaining the reliability that users expect from Google products?',
      'Describe a situation where you had to collaborate across multiple teams to deliver a solution.',
      'How would you approach disagreeing with a technical decision made by a senior engineer?',
      'Tell me about a time when you had to learn a completely new technology quickly to solve a problem.'
    ]
  },
  microsoft: {
    webdev: [
      'How would you implement real-time synchronization features for Microsoft Teams?',
      'Explain your approach to building cross-platform web applications that work seamlessly with Office 365.',
      'How would you optimize the performance of a web application integrated with Azure services?',
      'Describe how you would implement security features for enterprise web applications.',
      'How would you design a responsive web interface for Microsoft Outlook that works across all devices?'
    ],
    datascience: [
      'How would you analyze user engagement data to improve Microsoft Office productivity features?',
      'Explain your approach to building predictive models for Azure resource optimization.',
      'How would you design analytics for Microsoft Teams to help organizations improve collaboration?',
      'Describe how you would implement data governance for enterprise customers using Microsoft 365.',
      'How would you approach sentiment analysis for customer feedback across Microsoft products?'
    ],
    ml: [
      'How would you improve Cortana\'s natural language understanding capabilities?',
      'Explain your approach to building AI features for Microsoft Office that enhance productivity.',
      'How would you design a machine learning system for Azure that automatically scales based on demand?',
      'Describe how you would implement AI-powered code suggestions for Visual Studio Code.',
      'How would you approach building inclusive AI systems that work for users with disabilities?'
    ],
    behavioral: [
      'Describe a time when you had to balance innovation with backward compatibility for existing users.',
      'How do you approach building technology that empowers every person and organization on the planet?',
      'Tell me about a situation where you had to make a difficult technical tradeoff.',
      'How would you handle a situation where your solution conflicts with established Microsoft standards?',
      'Describe a time when you had to advocate for a user-centric approach in a technical discussion.'
    ]
  },
  amazon: {
    webdev: [
      'How would you design a highly available web service that can handle Amazon\'s Black Friday traffic?',
      'Explain your approach to building a microservices architecture for Amazon\'s e-commerce platform.',
      'How would you implement real-time inventory updates across Amazon\'s global marketplace?',
      'Describe how you would optimize the performance of Amazon\'s product search and recommendation engine.',
      'How would you design a web application that integrates seamlessly with AWS services?'
    ],
    datascience: [
      'How would you design a recommendation system that increases customer purchase conversion on Amazon?',
      'Explain your approach to demand forecasting for millions of products across Amazon\'s supply chain.',
      'How would you analyze customer behavior data to optimize Amazon Prime delivery routes?',
      'Describe how you would build a fraud detection system for Amazon Pay transactions.',
      'How would you approach pricing optimization for Amazon\'s dynamic pricing strategy?'
    ],
    ml: [
      'How would you improve Alexa\'s speech recognition accuracy in noisy environments?',
      'Explain your approach to building a computer vision system for Amazon Go stores.',
      'How would you design a machine learning pipeline for Amazon\'s logistics optimization?',
      'Describe how you would implement personalization algorithms for Amazon Prime Video.',
      'How would you approach building scalable ML models that serve millions of requests per second?'
    ],
    behavioral: [
      'Tell me about a time when you had to dive deep into a complex technical problem to find the root cause.',
      'Describe a situation where you had to deliver results under tight deadlines while maintaining high standards.',
      'How do you approach making decisions when you have to act with incomplete information?',
      'Tell me about a time when you had to simplify a complex technical solution for stakeholders.',
      'Describe a situation where you had to take ownership of a problem that wasn\'t originally your responsibility.'
    ]
  },
  meta: {
    webdev: [
      'How would you optimize the performance of Facebook\'s news feed for billions of users?',
      'Explain your approach to building real-time messaging features like those in WhatsApp.',
      'How would you implement content moderation tools for Instagram that scale globally?',
      'Describe how you would design a web application that handles Facebook\'s massive concurrent user load.',
      'How would you approach building cross-platform features that work across Facebook, Instagram, and WhatsApp?'
    ],
    datascience: [
      'How would you design algorithms to detect and prevent misinformation spread on Facebook?',
      'Explain your approach to analyzing user engagement to improve Instagram\'s content recommendation.',
      'How would you build models to optimize ad targeting while respecting user privacy?',
      'Describe how you would measure and improve user well-being across Meta\'s platforms.',
      'How would you approach A/B testing for features that affect billions of users daily?'
    ],
    ml: [
      'How would you improve Facebook\'s automatic photo tagging using computer vision?',
      'Explain your approach to building natural language processing for multilingual content moderation.',
      'How would you design recommendation algorithms that promote meaningful social interactions?',
      'Describe how you would implement real-time content ranking for Facebook\'s news feed.',
      'How would you approach building AI systems that detect harmful content while preserving free expression?'
    ],
    behavioral: [
      'Tell me about a time when you had to build something that connects people in a meaningful way.',
      'Describe a situation where you had to balance user engagement with user well-being.',
      'How do you approach building technology that brings the world closer together?',
      'Tell me about a time when you had to make a decision that prioritized long-term impact over short-term gains.',
      'Describe how you would handle building features for a global, diverse user base.'
    ]
  },
  apple: {
    webdev: [
      'How would you design web applications that integrate seamlessly with Apple\'s ecosystem?',
      'Explain your approach to building privacy-focused web features that align with Apple\'s values.',
      'How would you optimize web applications for Safari and ensure the best user experience on Apple devices?',
      'Describe how you would implement web-based features for iCloud that maintain Apple\'s design standards.',
      'How would you approach building responsive web applications that feel native on iOS and macOS?'
    ],
    datascience: [
      'How would you analyze user behavior data while maintaining Apple\'s strict privacy standards?',
      'Explain your approach to building recommendation systems for the App Store that respect user privacy.',
      'How would you design analytics for Apple Music that improve user experience without compromising privacy?',
      'Describe how you would approach health data analysis for Apple Watch while ensuring data security.',
      'How would you build predictive models for Apple\'s supply chain while maintaining competitive secrecy?'
    ],
    ml: [
      'How would you improve Siri\'s natural language understanding while keeping processing on-device?',
      'Explain your approach to building computer vision features for iPhone camera that work offline.',
      'How would you design machine learning models for Apple Watch health features that protect user privacy?',
      'Describe how you would implement AI-powered photo organization in Photos app with on-device processing.',
      'How would you approach building personalization features that don\'t require sending user data to servers?'
    ],
    behavioral: [
      'Tell me about a time when you had to prioritize user privacy over potentially valuable data insights.',
      'Describe a situation where you had to maintain the highest standards of quality under pressure.',
      'How do you approach building technology that enriches people\'s lives in meaningful ways?',
      'Tell me about a time when you had to think differently to solve a complex problem.',
      'Describe how you would contribute to Apple\'s culture of innovation and attention to detail.'
    ]
  },
  netflix: {
    webdev: [
      'How would you optimize Netflix\'s video streaming web application for global audiences?',
      'Explain your approach to building personalized user interfaces that adapt to viewing preferences.',
      'How would you implement A/B testing infrastructure for Netflix\'s web platform?',
      'Describe how you would design a content management system for Netflix\'s global content library.',
      'How would you approach building responsive web applications that work seamlessly across all devices?'
    ],
    datascience: [
      'How would you design recommendation algorithms that help users discover new content on Netflix?',
      'Explain your approach to analyzing viewing patterns to inform Netflix\'s content acquisition strategy.',
      'How would you build models to optimize video quality based on network conditions and device capabilities?',
      'Describe how you would approach churn prediction and retention strategies for Netflix subscribers.',
      'How would you analyze global viewing data to guide Netflix\'s international expansion decisions?'
    ],
    ml: [
      'How would you improve Netflix\'s content recommendation system using deep learning?',
      'Explain your approach to building computer vision systems for automatic content tagging and thumbnails.',
      'How would you design natural language processing systems for subtitle generation and content search?',
      'Describe how you would implement real-time personalization that adapts to user behavior during viewing sessions.',
      'How would you approach building ML models that optimize content delivery and streaming quality?'
    ],
    behavioral: [
      'Tell me about a time when you had to innovate rapidly in a competitive market.',
      'Describe a situation where you had to use data to challenge conventional wisdom.',
      'How do you approach building technology that entertains and delights millions of users worldwide?',
      'Tell me about a time when you had to make a decision with incomplete data but significant impact.',
      'Describe how you would contribute to Netflix\'s culture of freedom and responsibility.'
    ]
  }
};

// General fallback questions for topics not covered by company-specific questions
const generalQuestions = {
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
    const { level = 'beginner', field = 'webdev', company = 'general' } = req.query;
    
    let topicQuestions;
    
    // Get company-specific questions if available
    if (company !== 'general' && companyQuestions[company] && companyQuestions[company][field]) {
      topicQuestions = companyQuestions[company][field];
    } else {
      // Fallback to general questions or generate generic ones
      topicQuestions = generalQuestions[topic] || [
        `What is your experience with ${topic}?`,
        `How would you explain ${topic} to a beginner?`,
        `What are the best practices for ${topic}?`,
        `What challenges have you faced with ${topic}?`,
        `How do you stay updated with ${topic}?`
      ];
    }
    
    res.json({
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
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.post('/question/answer', async (req, res) => {
  try {
    const { question, level = 'beginner', field = 'webdev', topic, company = 'general' } = req.body;
    
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
      `\n\nCompany Context: Frame your answer considering ${companyContext[company] || 'general industry standards'}. Include specific examples or considerations relevant to ${company.charAt(0).toUpperCase() + company.slice(1)}\'s environment, scale, and values.` : '';
    
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
    
    const { field } = req.body;
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
      level: req.body.level
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