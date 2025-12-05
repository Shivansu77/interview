const express = require('express');
const router = express.Router();
const { upload, parseCV, testCVParsing } = require('../controllers/cvController');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'CV route is working' });
});

// Parse uploaded CV
router.post('/parse', (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        success: false,
        error: err.message,
        message: 'File upload failed. Please check file type and size.'
      });
    }
    parseCV(req, res);
  });
});

// Test CV parsing
router.post('/test-parse', testCVParsing);

module.exports = router;