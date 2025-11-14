const express = require('express');
const authRoutes = require('./auth');
const aiRoutes = require('./ai');
const englishRoutes = require('./english');
const interviewRoutes = require('./interview');
const learnRoutes = require('./learn');
const cvRoutes = require('./cv');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/english', englishRoutes);
router.use('/interview', interviewRoutes);
router.use('/learn', learnRoutes);
router.use('/cv', cvRoutes);

module.exports = router;