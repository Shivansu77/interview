// API Configuration
const API_CONFIG = {
  GEMINI_URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCnVsLg1_mxqRzEWo74dxe5ASlSRNpf-uQ`,
  SPEECHACE_URL: 'https://api.speechace.co/api/scoring/text/v9.9/json',
  LANGUAGETOOL_URL: 'https://api.languagetoolplus.com/v2/check',
  DICTIONARY_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  GOOGLE_SPEECH_URL: `https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyCnVsLg1_mxqRzEWo74dxe5ASlSRNpf-uQ`,
  GOOGLE_TTS_URL: `https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyCnVsLg1_mxqRzEWo74dxe5ASlSRNpf-uQ`
};

// Cache Configuration
const CACHE_CONFIG = {
  DURATION: 5 * 60 * 1000, // 5 minutes
  DAILY_CACHE_DURATION: 24 * 60 * 60 * 1000 // 24 hours
};

// Rate Limiting
const RATE_LIMITS = {
  API_DELAY: 1000, // 1 second between calls
  MAX_REQUESTS_PER_MINUTE: 60
};

// Interview Configuration
const INTERVIEW_CONFIG = {
  MAX_QUESTIONS: 5,
  AUTO_STOP_DURATION: 120000, // 2 minutes
  TIMER_DURATION: 30 // 30 seconds
};

// Score Ranges
const SCORE_RANGES = {
  MIN_SCORE: 4,
  MAX_SCORE: 10,
  PASSING_SCORE: 6
};

module.exports = {
  API_CONFIG,
  CACHE_CONFIG,
  RATE_LIMITS,
  INTERVIEW_CONFIG,
  SCORE_RANGES
};