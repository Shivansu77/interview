const natural = require('natural');
const { SCORE_RANGES } = require('../config/constants');

class NLPAnalyzer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
  }

  analyzeTextQuality(text) {
    if (!text || text.trim().length === 0) {
      return { 
        score: SCORE_RANGES.MIN_SCORE, 
        issues: ['Please provide an answer'] 
      };
    }
    
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const sentences = this.sentenceTokenizer.tokenize(text);
    
    const positives = [];
    const suggestions = [];
    let score = 7;
    
    // Length analysis
    if (words.length >= 5) {
      positives.push('Good response length');
      score += 1;
    } else {
      suggestions.push('Try to elaborate more');
      score -= 1;
    }
    
    if (words.length > 15) {
      positives.push('Detailed explanation');
      score += 1;
    }
    
    // Positive language detection
    const positiveWords = [
      'experience', 'learned', 'understand', 'know', 'can', 'will', 
      'able', 'solution', 'approach', 'implement', 'develop'
    ];
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    if (positiveCount > 0) {
      positives.push('Confident language');
      score += 1;
    }
    
    // Technical vocabulary
    const technicalWords = [
      'algorithm', 'function', 'variable', 'loop', 'array', 'object', 
      'class', 'method', 'api', 'database', 'code', 'programming',
      'framework', 'library', 'component', 'module'
    ];
    const techCount = words.filter(word => technicalWords.includes(word)).length;
    if (techCount > 0) {
      positives.push('Technical vocabulary');
      score += Math.min(2, techCount);
    }
    
    // Negative patterns
    const negativePatterns = ['no idea', 'don\'t know anything', 'impossible', 'can\'t do'];
    const hasNegative = negativePatterns.some(phrase => text.toLowerCase().includes(phrase));
    if (hasNegative) {
      suggestions.push('Show more confidence');
      score -= 2;
    }
    
    return { 
      score: Math.max(SCORE_RANGES.MIN_SCORE, Math.min(SCORE_RANGES.MAX_SCORE, score)), 
      positives, 
      suggestions 
    };
  }

  extractKeywords(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const stopWords = natural.stopwords;
    return words.filter(word => !stopWords.includes(word) && word.length > 2);
  }

  calculateReadability(text) {
    const sentences = this.sentenceTokenizer.tokenize(text);
    const words = this.tokenizer.tokenize(text);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = words.reduce((sum, word) => {
      return sum + this.countSyllables(word);
    }, 0) / words.length;
    
    // Simplified Flesch Reading Ease
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }
}

module.exports = new NLPAnalyzer();