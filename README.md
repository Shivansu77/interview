# AI Interview Platform

A comprehensive MERN stack application for AI-powered interview preparation with real-time feedback, speech analysis, and vocabulary building.

## 🚀 Features

### Core Interview System
- 🤖 **AI-Generated Questions**: Company-specific technical and behavioral questions
- 🎤 **Voice Interaction**: Speech-to-text with Google Cloud API
- 👁️ **Eye Contact Monitoring**: Real-time face detection feedback
- 📊 **Performance Analytics**: Comprehensive scoring and improvement suggestions
- 🔄 **Live Feedback**: Real-time analysis during interviews

### Learning & Practice
- 📚 **Learning Roadmaps**: Field-specific skill development paths
- 🗣️ **Speech Practice**: Line-by-line pronunciation training
- 📖 **Vocabulary Builder**: Daily challenges with random word generation
- 🎯 **Company Focus**: Interview questions from Google, Microsoft, Amazon, Meta, Apple, Netflix

### Advanced Features
- 🌐 **Multi-Language Support**: English learning with pronunciation guides
- 📈 **Progress Tracking**: Interview history and skill development
- 🔊 **Audio Analysis**: Comprehensive speech assessment
- 💬 **Grammar Checking**: Real-time language correction

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **Google Cloud APIs** (Speech-to-Text, Gemini AI)
- **Natural Language Processing** with Natural.js

### Frontend
- **React** with TypeScript
- **Modern CSS** with responsive design
- **Web APIs** (MediaRecorder, SpeechRecognition)
- **Real-time UI** updates

### APIs & Services
- **Google Gemini 2.5 Flash** - AI question generation and analysis
- **Google Cloud Speech-to-Text** - Audio transcription
- **SpeechAce API** - Pronunciation assessment
- **LanguageTool API** - Grammar checking
- **Random Words API** - Vocabulary generation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Cloud API key
- API keys for external services

### Backend Setup
```bash
cd backend
npm install

# Create .env file with your API keys
cp .env.example .env
# Edit .env with your actual API keys

npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5003
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
SPEECHACE_API_KEY=your_speechace_api_key
LANGUAGETOOL_API_KEY=your_languagetool_api_key
LANGUAGETOOL_USERNAME=your_languagetool_username
WORDSAPI_KEY=your_wordsapi_key
```

## 🎯 Usage

### Interview Practice
1. **Start Interview**: Choose Technical or English interview type
2. **Select Company**: Pick from major tech companies or general questions
3. **Answer Questions**: Speak your responses using voice input
4. **Get Feedback**: Receive real-time analysis and improvement suggestions
5. **Review Results**: See comprehensive dashboard with scores and recommendations

### Learning Mode
1. **Choose Field**: Web Development, Data Science, ML, or Behavioral
2. **Select Level**: Beginner, Intermediate, or Advanced
3. **Practice Topics**: Work through structured learning roadmaps
4. **Speech Training**: Practice pronunciation with line-by-line feedback

### Vocabulary Building
1. **Daily Challenge**: Get new vocabulary words, idioms, and sentences
2. **Random Generator**: Generate words by category (nouns, verbs, adjectives)
3. **Pronunciation Practice**: Listen and repeat with audio feedback
4. **Progress Tracking**: Monitor your vocabulary growth

## 📊 API Endpoints

### Interview System
- `POST /api/interview/start-session` - Start new interview session
- `POST /api/interview/complete` - Complete interview and save results
- `POST /api/ai/generate-question` - Generate AI interview questions
- `POST /api/ai/analyze-answer` - Analyze interview responses

### Learning System
- `GET /api/learn/roadmap/:field` - Get learning roadmap for field
- `GET /api/learn/topic/:topic/questions` - Get questions for topic
- `POST /api/learn/question/answer` - Get AI-generated answers
- `POST /api/learn/progress/update` - Update learning progress

### English Learning
- `POST /api/english/pronunciation/assess` - Assess pronunciation
- `POST /api/english/grammar/check` - Check grammar
- `GET /api/english/vocabulary/random/:type` - Get random vocabulary
- `GET /api/english/vocabulary/daily-challenge` - Get daily challenge
- `POST /api/ai/speech-to-text` - Convert speech to text

## 🏗️ Architecture

### Component Structure
```
frontend/src/
├── components/
│   ├── InterviewRoom.tsx      # Main interview interface
│   ├── EnglishPractice.tsx    # English learning component
│   ├── VocabularyChallenge.tsx # Vocabulary building
│   ├── SpeechPractice.tsx     # Speech training
│   ├── LearnSection.tsx       # Learning dashboard
│   ├── LearningRoadmap.tsx    # Skill roadmaps
│   ├── FaceMonitor.tsx        # Eye contact detection
│   ├── VoiceRecorder.tsx      # Audio recording
│   └── AnalysisDisplay.tsx    # Results display
└── App.tsx                    # Main application
```

### Backend Structure
```
backend/
├── routes/
│   ├── ai.js          # AI services (Gemini, Speech-to-Text)
│   ├── english.js     # English learning APIs
│   ├── learn.js       # Learning system
│   ├── interview.js   # Interview management
│   └── auth.js        # Authentication
├── models/
│   └── User.js        # User data model
└── server.js          # Express server setup
```

## 🔒 Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **Error Handling**: Comprehensive error handling with fallbacks
- **Data Privacy**: Audio data is processed securely and not stored permanently

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or AWS
2. Set environment variables in deployment platform
3. Ensure MongoDB Atlas is accessible from deployment platform

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Netlify, Vercel, or similar platforms
3. Update API endpoints to point to deployed backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Cloud for AI and Speech APIs
- SpeechAce for pronunciation assessment
- LanguageTool for grammar checking
- Random Words API for vocabulary generation
- MongoDB Atlas for database hosting

## 📞 Support

For support, email support@aiinterviewplatform.com or create an issue in the repository.

---

**Built with ❤️ for better interview preparation and English learning**