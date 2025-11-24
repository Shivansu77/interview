const natural = require('natural');
console.log('Natural loaded');
const tokenizer = new natural.WordTokenizer();
console.log('Tokenizer created');
const tokens = tokenizer.tokenize("This is a test.");
console.log('Tokens:', tokens);
const analyzer = new natural.SentimentAnalyzer("English", null, "afinn");
console.log('Analyzer created');
