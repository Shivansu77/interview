const { asyncHandler } = require('../middleware/errorHandler');
const learningService = require('../services/learningService');

// Get Learning Roadmap
const getRoadmap = asyncHandler(async (req, res) => {
  const { field } = req.params;
  const { level = 'beginner' } = req.query;
  
  const result = learningService.getRoadmap(field, level);
  
  res.json(result);
});

// Get Topic Questions
const getTopicQuestions = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  const { level = 'beginner', field = 'webdev', company = 'general' } = req.query;
  
  const result = learningService.getTopicQuestions(topic, level, field, company);
  
  res.json(result);
});

// Generate Question Answer
const generateAnswer = asyncHandler(async (req, res) => {
  const { question, level = 'beginner', field = 'webdev', topic, company = 'general' } = req.body;
  
  const result = await learningService.generateAnswer(question, level, field, topic, company);
  
  res.json(result);
});

// Update Learning Progress
const updateProgress = asyncHandler(async (req, res) => {
  const { userId, questionId, completed, accuracy } = req.body;
  
  const result = learningService.updateProgress(userId, questionId, completed, accuracy);
  
  res.json(result);
});

// Get Learning Progress
const getProgress = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const result = learningService.getProgress(userId);
  
  res.json(result);
});

module.exports = {
  getRoadmap,
  getTopicQuestions,
  generateAnswer,
  updateProgress,
  getProgress
};