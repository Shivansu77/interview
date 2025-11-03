const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  profilePicture: String,
  interviewHistory: [{
    sessionId: String,
    date: { type: Date, default: Date.now },
    score: Number,
    eyeContactScore: Number,
    fluencyScore: Number,
    timingStats: {
      avgResponseTime: Number,
      totalQuestions: Number
    }
  }],
  englishLevel: { type: String, default: 'beginner' },
  preferences: {
    interviewType: { type: String, default: 'technical' },
    difficulty: { type: String, default: 'medium' }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);