const express = require('express');
const router = express.Router();
const {
  getRoadmap,
  getTopicQuestions,
  generateAnswer,
  updateProgress,
  getProgress
} = require('../controllers/learningController');

// Get Learning Roadmap
router.get('/roadmap/:field', getRoadmap);

// Get Topic Questions
router.get('/topic/:topic/questions', getTopicQuestions);

// Generate Question Answer
router.post('/question/answer', generateAnswer);

// Update Learning Progress
router.post('/progress/update', updateProgress);

// Get Learning Progress
router.get('/progress/:userId', getProgress);

module.exports = router;