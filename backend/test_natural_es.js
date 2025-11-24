const natural = require('natural');
console.log('Natural loaded');
try {
    const analyzer = new natural.SentimentAnalyzer("Spanish", null, "afinn");
    console.log('Spanish Analyzer created');
} catch (e) {
    console.error('Error creating Spanish analyzer:', e);
}
