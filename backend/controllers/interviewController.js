const interviewService = require('../services/interviewService');

// Start Interview Session
const startSession = (req, res) => {
  try {
    const { userId, type, company, difficulty, interviewConfig } = req.body;

    const result = interviewService.startSession(userId, type, company, difficulty, interviewConfig);

    res.json(result);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

// Complete Interview
const completeInterview = (req, res) => {
  try {
    const { results, questionScores } = req.body;

    const result = interviewService.completeInterview(results, questionScores);

    res.json(result);
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
};

// Get Interview Results
const getResults = (req, res) => {
  try {
    const { id } = req.params;

    const result = interviewService.getResults(id);

    res.json(result);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
};

// Get Interview History
const getHistory = (req, res) => {
  try {
    const history = interviewService.getHistory();

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

module.exports = {
  startSession,
  completeInterview,
  getResults,
  getHistory
};