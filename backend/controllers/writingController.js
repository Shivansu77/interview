const writingCheckerService = require('../services/writingCheckerService');

// Check writing quality and errors
exports.checkWriting = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required'
            });
        }

        if (text.length > 10000) {
            return res.status(400).json({
                success: false,
                message: 'Text is too long. Maximum 10,000 characters allowed.'
            });
        }

        const analysis = await writingCheckerService.analyzeText(text);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        console.error('Writing check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze text',
            error: error.message
        });
    }
};

// Apply corrections to text
exports.applyCorrections = async (req, res) => {
    try {
        const { text, errors } = req.body;

        if (!text || !errors) {
            return res.status(400).json({
                success: false,
                message: 'Text and errors are required'
            });
        }

        const correctedText = writingCheckerService.applyAllCorrections(text, errors);

        res.json({
            success: true,
            correctedText
        });
    } catch (error) {
        console.error('Apply corrections error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to apply corrections',
            error: error.message
        });
    }
};
