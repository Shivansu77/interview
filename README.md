# AI Interview Platform

A MERN stack application for AI-powered interview preparation with real-time feedback on eye contact, speech fluency, and performance analytics.

## Features

- 🤖 AI-generated interview questions using OpenAI GPT
- 🎤 Voice interaction with speech-to-text and text-to-speech
- 👁️ Real-time eye contact monitoring using TensorFlow.js
- 📊 Performance analytics and timing statistics
- 🔄 Live feedback during interviews
- 📈 Progress tracking and interview history

## Quick Start

### Backend Setup
```bash
cd backend
npm install
# Add your API keys to .env file
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create `.env` in backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/interview-ai
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
```

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Socket.io
- **Frontend**: React, TypeScript, TensorFlow.js
- **AI Services**: OpenAI GPT, Web Speech API
- **Real-time**: WebRTC, Socket.io

## Core Components

### Backend
- `server.js` - Main server with Socket.io
- `routes/ai.js` - AI question generation and analysis
- `routes/auth.js` - User authentication
- `routes/interview.js` - Interview session management
- `models/User.js` - User data model

### Frontend
- `InterviewRoom.tsx` - Main interview interface
- `FaceMonitor.tsx` - Eye contact detection
- `VoiceRecorder.tsx` - Speech-to-text recording
- `App.tsx` - Main application component

## Usage

1. Start the backend server: `npm run dev` in `/backend`
2. Start the frontend: `npm start` in `/frontend`
3. Open http://localhost:3000
4. Click "Start Interview" to begin AI-powered interview
5. Allow camera and microphone permissions
6. Answer AI-generated questions with voice input
7. Get real-time feedback on eye contact and performance

## Next Steps

- Integrate Google Cloud Speech-to-Text for better accuracy
- Add MediaPipe for advanced face detection
- Implement user authentication system
- Add English learning modules
- Deploy to cloud platforms