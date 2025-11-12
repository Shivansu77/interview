const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Interview validation rules
const validateInterviewStart = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('type').isIn(['technical', 'english']).withMessage('Invalid interview type'),
  body('company').optional().isString().withMessage('Company must be a string'),
  validate
];

const validateAnswerAnalysis = [
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
  validate
];

// AI validation rules
const validateQuestionGeneration = [
  body('type').optional().isIn(['technical', 'english']).withMessage('Invalid question type'),
  body('company').optional().isString().withMessage('Company must be a string'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  validate
];

// English validation rules
const validatePronunciation = [
  body('audioData').notEmpty().withMessage('Audio data is required'),
  body('text').notEmpty().withMessage('Text is required'),
  validate
];

const validateGrammarCheck = [
  body('text').notEmpty().withMessage('Text is required'),
  validate
];

// Learning validation rules
const validateLearningProgress = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('questionId').notEmpty().withMessage('Question ID is required'),
  body('completed').isBoolean().withMessage('Completed must be boolean'),
  validate
];

module.exports = {
  validate,
  validateInterviewStart,
  validateAnswerAnalysis,
  validateQuestionGeneration,
  validatePronunciation,
  validateGrammarCheck,
  validateLearningProgress
};