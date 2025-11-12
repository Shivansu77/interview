const { INTERVIEW_CONFIG } = require('../config/constants');

class InterviewService {
  constructor() {
    this.interviewResults = [];
    this.activeSessions = {};
  }

  startSession(userId, type, company, difficulty) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeSessions[sessionId] = {
      userId,
      type,
      company,
      difficulty,
      startedAt: new Date().toISOString(),
      questionCount: 0
    };
    
    console.log('Interview session started:', {
      sessionId,
      userId,
      type,
      company
    });
    
    return {
      success: true,
      sessionId,
      message: 'Interview session started successfully'
    };
  }

  completeInterview(results, questionScores) {
    const interviewData = {
      id: Date.now().toString(),
      ...results,
      questionScores: questionScores,
      createdAt: new Date().toISOString()
    };
    
    this.interviewResults.push(interviewData);
    
    console.log('Interview completed:', {
      overallScore: results.overallScore,
      focusAreas: results.focusAreas,
      totalQuestions: results.totalQuestions
    });
    
    return {
      success: true,
      message: 'Interview results saved successfully',
      interviewId: interviewData.id
    };
  }

  getResults(id) {
    const result = this.interviewResults.find(r => r.id === id);
    if (!result) {
      throw new Error('Interview results not found');
    }
    return result;
  }

  getHistory(limit = 10) {
    return this.interviewResults
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(result => ({
        id: result.id,
        overallScore: result.overallScore,
        interviewType: result.interviewType,
        company: result.company,
        completedAt: result.completedAt,
        focusAreas: result.focusAreas
      }));
  }

  calculateOverallResults(scores) {
    const avgContent = scores.reduce((sum, s) => sum + s.contentScore, 0) / scores.length;
    const avgClarity = scores.reduce((sum, s) => sum + s.clarityScore, 0) / scores.length;
    const avgCompleteness = scores.reduce((sum, s) => sum + s.completenessScore, 0) / scores.length;
    const avgFluency = scores.reduce((sum, s) => sum + s.fluencyScore, 0) / scores.length;
    const avgEyeContact = scores.reduce((sum, s) => sum + s.eyeContactScore, 0) / scores.length;
    const overallScore = (avgContent + avgClarity + avgCompleteness + avgFluency) / 4;
    
    // Determine focus areas
    const focusAreas = [];
    if (avgContent < 6) focusAreas.push('Technical Knowledge');
    if (avgClarity < 6) focusAreas.push('Communication Clarity');
    if (avgCompleteness < 6) focusAreas.push('Answer Completeness');
    if (avgFluency < 6) focusAreas.push('Speaking Fluency');
    if (avgEyeContact < 60) focusAreas.push('Eye Contact');
    
    return {
      overallScore: Math.round(overallScore * 10) / 10,
      contentScore: Math.round(avgContent * 10) / 10,
      clarityScore: Math.round(avgClarity * 10) / 10,
      completenessScore: Math.round(avgCompleteness * 10) / 10,
      fluencyScore: Math.round(avgFluency * 10) / 10,
      eyeContactScore: Math.round(avgEyeContact),
      focusAreas: focusAreas,
      totalQuestions: INTERVIEW_CONFIG.MAX_QUESTIONS,
      correctAnswers: scores.filter(s => s.isCorrect).length,
      adequateAnswers: scores.filter(s => s.isAdequate).length
    };
  }

  getSession(sessionId) {
    return this.activeSessions[sessionId];
  }

  updateSession(sessionId, updates) {
    if (this.activeSessions[sessionId]) {
      this.activeSessions[sessionId] = {
        ...this.activeSessions[sessionId],
        ...updates
      };
    }
  }

  endSession(sessionId) {
    delete this.activeSessions[sessionId];
  }
}

module.exports = new InterviewService();