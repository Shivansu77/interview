const express = require('express');
const router = express.Router();
const {
  assessPronunciation,
  checkGrammar,
  getRandomVocabulary,
  getDailyChallenge,
  searchWord,
  comprehensiveAssessment
} = require('../controllers/englishController');

// Pronunciation Assessment
router.post('/pronunciation/assess', assessPronunciation);

// Grammar Check
router.post('/grammar/check', checkGrammar);

// Random Vocabulary
router.get('/vocabulary/random/:type?', getRandomVocabulary);

// Daily Challenge
router.get('/vocabulary/daily-challenge', getDailyChallenge);

// Word Search
router.get('/vocabulary/search/:word', searchWord);

// Comprehensive Assessment
router.post('/assess/comprehensive', comprehensiveAssessment);

// Legacy endpoints for backward compatibility
router.get('/vocabulary/word/:word', searchWord);
router.get('/vocabulary/define/:word', searchWord);

module.exports = router;