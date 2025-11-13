const learningService = require('../services/learningService');

// Get Learning Roadmap
const getRoadmap = (req, res) => {
  try {
    const { field } = req.params;
    const { level = 'beginner' } = req.query;
    const result = learningService.getRoadmap(field, level);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Topic Questions
const getTopicQuestions = (req, res) => {
  try {
    const { topic } = req.params;
    const { level = 'beginner', field = 'webdev', company = 'general' } = req.query;
    const result = learningService.getTopicQuestions(topic, level, field, company);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate Question Answer
const generateAnswer = async (req, res) => {
  try {
    const { question, level = 'beginner', field = 'webdev', topic, company = 'general' } = req.body;
    const result = await learningService.generateAnswer(question, level, field, topic, company);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Learning Progress
const updateProgress = (req, res) => {
  try {
    const { userId, questionId, completed, accuracy } = req.body;
    const result = learningService.updateProgress(userId, questionId, completed, accuracy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Learning Progress
const getProgress = (req, res) => {
  try {
    const { userId } = req.params;
    const result = learningService.getProgress(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRoadmap,
  getTopicQuestions,
  generateAnswer,
  updateProgress,
  getProgress
};