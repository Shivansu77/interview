const express = require('express');
const router = express.Router();
const { upload, parseCV } = require('../controllers/cvController');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'CV route is working' });
});

// Parse uploaded CV
router.post('/parse', (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    parseCV(req, res);
  });
});

module.exports = router;