const express = require('express');
const router = express.Router();
const {
  startSession,
  completeInterview,
  getResults,
  getHistory
} = require('../controllers/interviewController');

// Start Interview Session
router.post('/start-session', startSession);

// Complete Interview
router.post('/complete', completeInterview);

// Get Interview Results
router.get('/results/:id', getResults);

// Get Interview History
router.get('/history', getHistory);

module.exports = router;