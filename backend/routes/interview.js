const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/start-session', async (req, res) => {
  try {
    const { userId, type, difficulty } = req.body;
    const sessionId = Date.now().toString();
    
    res.json({ 
      sessionId,
      message: 'Interview session started',
      settings: { type, difficulty }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/save-results', async (req, res) => {
  try {
    const { userId, sessionId, scores, timingStats } = req.body;
    
    const user = await User.findById(userId);
    user.interviewHistory.push({
      sessionId,
      score: scores.overall,
      eyeContactScore: scores.eyeContact,
      fluencyScore: scores.fluency,
      timingStats
    });
    
    await user.save();
    res.json({ message: 'Results saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json({ history: user.interviewHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;