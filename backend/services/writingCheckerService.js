const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${API_KEY}`;

class WritingCheckerService {
    constructor() {
        // Unprofessional words and their professional alternatives
        this.unprofessionalWords = {
            'yeah': 'yes',
            'yep': 'yes',
            'nope': 'no',
            'yo': 'hello',
            'hi': 'hello',
            'hey': 'hello',
            'gonna': 'going to',
            'wanna': 'want to',
            'gotta': 'have to',
            'kinda': 'kind of',
            'sorta': 'sort of',
            'dunno': "don't know",
            'lemme': 'let me',
            'gimme': 'give me',
            "ain't": 'is not',
            "y'all": 'you all',
            'ok': 'okay',
            'lol': '[remove - unprofessional]',
            'omg': '[remove - unprofessional]',
            'btw': 'by the way',
            'fyi': 'for your information',
            'asap': 'as soon as possible',
            'thx': 'thank you',
            'pls': 'please',
            'plz': 'please',
            'u': 'you',
            'ur': 'your',
            'r': 'are',
            'b4': 'before',
            'cuz': 'because',
            "'cause": 'because',
            'prolly': 'probably',
            'shoulda': 'should have',
            'coulda': 'could have',
            'woulda': 'would have',
            'hafta': 'have to',
            'outta': 'out of',
            'lotsa': 'lots of',
            'alot': 'a lot',
            'tho': 'though',
            'thru': 'through'
        };

        // Common grammar patterns to check
        this.grammarPatterns = [
            {
                pattern: /\b(he|she|it)\s+(are|were)\b/gi,
                type: 'grammar',
                message: 'Subject-verb agreement error',
                getSuggestion: (match) => match.replace(/are|were/i, match.includes('were') ? 'was' : 'is')
            },
            {
                pattern: /\b(I|you|we|they)\s+(is|was)\b/gi,
                type: 'grammar',
                message: 'Subject-verb agreement error',
                getSuggestion: (match) => match.replace(/is|was/i, match.includes('was') ? 'were' : 'are')
            },
            {
                pattern: /\b(a)\s+([aeiou])/gi,
                type: 'grammar',
                message: 'Use "an" before vowel sounds',
                getSuggestion: (match) => match.replace(/^a\s+/i, 'an ')
            },
            {
                pattern: /\bi\s+/g,
                type: 'capitalization',
                message: 'Capitalize "I"',
                getSuggestion: (match) => 'I '
            }
        ];
    }

    async analyzeText(text) {
        if (!text || text.trim().length === 0) {
            return {
                errors: [],
                suggestions: [],
                score: 0,
                metrics: {
                    wordCount: 0,
                    sentenceCount: 0,
                    readabilityScore: 0
                }
            };
        }

        try {
            // Detect all types of errors
            const unprofessionalErrors = this.detectUnprofessionalLanguage(text);
            const grammarErrors = this.detectGrammarErrors(text);
            const punctuationErrors = this.detectPunctuationErrors(text);

            // Combine all errors
            const allErrors = [...unprofessionalErrors, ...grammarErrors, ...punctuationErrors];

            // Calculate metrics
            const metrics = this.calculateMetrics(text);

            // Calculate writing score
            const score = this.calculateWritingScore(text, allErrors, metrics);

            // Generate suggestions
            const suggestions = this.generateSuggestions(allErrors);

            return {
                errors: allErrors,
                suggestions,
                score,
                metrics
            };
        } catch (error) {
            console.error('Writing analysis error:', error);

            // Fallback to basic analysis
            const unprofessionalErrors = this.detectUnprofessionalLanguage(text);
            const metrics = this.calculateMetrics(text);

            return {
                errors: unprofessionalErrors,
                suggestions: this.generateSuggestions(unprofessionalErrors),
                score: this.calculateWritingScore(text, unprofessionalErrors, metrics),
                metrics
            };
        }
    }

    detectUnprofessionalLanguage(text) {
        const errors = [];
        const words = text.split(/\b/);
        let position = 0;

        words.forEach(word => {
            const lowerWord = word.toLowerCase();

            if (this.unprofessionalWords[lowerWord]) {
                errors.push({
                    type: 'unprofessional',
                    word: word,
                    position: position,
                    length: word.length,
                    suggestion: this.unprofessionalWords[lowerWord],
                    explanation: `Use "${this.unprofessionalWords[lowerWord]}" for professional communication`,
                    severity: 'medium'
                });
            }

            position += word.length;
        });

        return errors;
    }

    detectGrammarErrors(text) {
        const errors = [];

        this.grammarPatterns.forEach(pattern => {
            let match;
            const regex = new RegExp(pattern.pattern);

            while ((match = regex.exec(text)) !== null) {
                errors.push({
                    type: pattern.type,
                    word: match[0],
                    position: match.index,
                    length: match[0].length,
                    suggestion: pattern.getSuggestion(match[0]),
                    explanation: pattern.message,
                    severity: 'high'
                });
            }
        });

        return errors;
    }

    detectPunctuationErrors(text) {
        const errors = [];

        // Check for missing periods at end of sentences
        const sentences = text.split(/[.!?]+/);
        if (sentences.length > 0 && text.trim().length > 0) {
            const lastChar = text.trim().slice(-1);
            if (!['.', '!', '?'].includes(lastChar) && text.trim().length > 10) {
                errors.push({
                    type: 'punctuation',
                    word: text.slice(-10),
                    position: text.length - 10,
                    length: 10,
                    suggestion: text.slice(-10) + '.',
                    explanation: 'Sentence should end with punctuation',
                    severity: 'low'
                });
            }
        }

        // Check for missing commas after introductory phrases
        const introPatterns = /^(however|therefore|furthermore|moreover|additionally|consequently),?\s+/gi;
        let match;
        while ((match = introPatterns.exec(text)) !== null) {
            if (!match[0].includes(',')) {
                errors.push({
                    type: 'punctuation',
                    word: match[0],
                    position: match.index,
                    length: match[0].length,
                    suggestion: match[1] + ', ',
                    explanation: 'Add comma after introductory word',
                    severity: 'low'
                });
            }
        }

        return errors;
    }

    calculateMetrics(text) {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const characters = text.replace(/\s/g, '').length;

        // Calculate average word length
        const avgWordLength = words.length > 0
            ? words.reduce((sum, word) => sum + word.length, 0) / words.length
            : 0;

        // Calculate average sentence length
        const avgSentenceLength = sentences.length > 0
            ? words.length / sentences.length
            : 0;

        // Simple readability score (Flesch Reading Ease approximation)
        const readabilityScore = sentences.length > 0 && words.length > 0
            ? Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * (characters / words.length)))
            : 0;

        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            characterCount: characters,
            avgWordLength: Math.round(avgWordLength * 10) / 10,
            avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
            readabilityScore: Math.round(readabilityScore)
        };
    }

    calculateWritingScore(text, errors, metrics) {
        let score = 100;

        // Deduct points for errors
        errors.forEach(error => {
            if (error.severity === 'high') score -= 5;
            else if (error.severity === 'medium') score -= 3;
            else score -= 1;
        });

        // Deduct points for poor readability
        if (metrics.readabilityScore < 30) score -= 10;
        else if (metrics.readabilityScore < 50) score -= 5;

        // Deduct points for very short or very long sentences
        if (metrics.avgSentenceLength < 5) score -= 5;
        if (metrics.avgSentenceLength > 30) score -= 5;

        // Bonus for good length
        if (metrics.wordCount >= 50 && metrics.wordCount <= 200) score += 5;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    generateSuggestions(errors) {
        const suggestions = [];
        const errorTypes = {};

        // Group errors by type
        errors.forEach(error => {
            if (!errorTypes[error.type]) {
                errorTypes[error.type] = [];
            }
            errorTypes[error.type].push(error);
        });

        // Generate summary suggestions
        if (errorTypes.unprofessional && errorTypes.unprofessional.length > 0) {
            suggestions.push({
                type: 'unprofessional',
                title: 'Use Professional Language',
                description: `Found ${errorTypes.unprofessional.length} informal word(s). Replace with professional alternatives.`,
                priority: 'high'
            });
        }

        if (errorTypes.grammar && errorTypes.grammar.length > 0) {
            suggestions.push({
                type: 'grammar',
                title: 'Fix Grammar Errors',
                description: `Found ${errorTypes.grammar.length} grammar error(s). Review subject-verb agreement and tense.`,
                priority: 'high'
            });
        }

        if (errorTypes.punctuation && errorTypes.punctuation.length > 0) {
            suggestions.push({
                type: 'punctuation',
                title: 'Check Punctuation',
                description: `Found ${errorTypes.punctuation.length} punctuation issue(s). Add missing commas and periods.`,
                priority: 'medium'
            });
        }

        return suggestions;
    }

    // Apply a single correction
    applyCorrection(text, error) {
        const before = text.substring(0, error.position);
        const after = text.substring(error.position + error.length);
        return before + error.suggestion + after;
    }

    // Apply all corrections
    applyAllCorrections(text, errors) {
        // Sort errors by position (descending) to avoid position shifts
        const sortedErrors = [...errors].sort((a, b) => b.position - a.position);

        let correctedText = text;
        sortedErrors.forEach(error => {
            if (error.suggestion && !error.suggestion.includes('[remove')) {
                correctedText = this.applyCorrection(correctedText, error);
            }
        });

        return correctedText;
    }
}

module.exports = new WritingCheckerService();
