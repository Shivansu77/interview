const express = require('express');
const router = express.Router();

// Store interview results (in-memory for now, can be replaced with database)
let interviewResults = [];
let activeSessions = {};

router.post('/start-session', async (req, res) => {
  try {
    const { userId, type, company, difficulty } = req.body;
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session info
    activeSessions[sessionId] = {
      userId,
      type,
      company,
      difficulty,
      startedAt: new Date().toISOString(),
      questionCount: 0
    };
    
    console.log('Interview session started:', {
      sessionId,
      userId,
      type,
      company
    });
    
    res.json({ 
      success: true,
      sessionId,
      message: 'Interview session started successfully'
    });
  } catch (error) {
    console.error('Error starting interview session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start interview session' 
    });
  }
});

router.post('/complete', async (req, res) => {
  try {
    const { results, questionScores } = req.body;
    
    // Add timestamp and unique ID
    const interviewData = {
      id: Date.now().toString(),
      ...results,
      questionScores: questionScores,
      createdAt: new Date().toISOString()
    };
    
    // Store in memory (replace with database in production)
    interviewResults.push(interviewData);
    
    console.log('Interview completed:', {
      overallScore: results.overallScore,
      focusAreas: results.focusAreas,
      totalQuestions: results.totalQuestions
    });
    
    res.json({ 
      success: true, 
      message: 'Interview results saved successfully',
      interviewId: interviewData.id
    });
  } catch (error) {
    console.error('Error saving interview results:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save interview results' 
    });
  }
});

router.get('/results/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = interviewResults.find(r => r.id === id);
    
    if (!result) {
      return res.status(404).json({ error: 'Interview results not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching interview results:', error);
    res.status(500).json({ error: 'Failed to fetch interview results' });
  }
});

router.get('/history', async (req, res) => {
  try {
    // Return last 10 interviews
    const history = interviewResults
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(result => ({
        id: result.id,
        overallScore: result.overallScore,
        interviewType: result.interviewType,
        company: result.company,
        completedAt: result.completedAt,
        focusAreas: result.focusAreas
      }));
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
});

module.exports = router;