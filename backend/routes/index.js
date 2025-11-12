const express = require('express');
const aiRoutes = require('./ai');
const englishRoutes = require('./english');
const interviewRoutes = require('./interview');
const learnRoutes = require('./learn');

const router = express.Router();

router.use('/ai', aiRoutes);
router.use('/english', englishRoutes);
router.use('/interview', interviewRoutes);
router.use('/learn', learnRoutes);

module.exports = router;