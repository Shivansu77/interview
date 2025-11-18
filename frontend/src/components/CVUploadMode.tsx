import React, { useState } from 'react';
import { CVProfile, InterviewConfig } from './InterviewModeSelector';

interface CVUploadModeProps {
  onStartInterview: (config: InterviewConfig) => void;
  onBack: () => void;
}

const CVUploadMode: React.FC<CVUploadModeProps> = ({ onStartInterview, onBack }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'confirm' | 'edit'>('upload');
  const [cvProfile, setCvProfile] = useState<CVProfile | null>(null);
  const [, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setStep('processing');
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('cv', file);
      
      const response = await fetch('http://localhost:5003/api/cv/parse', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.profile) {
        setCvProfile(data.profile);
        setStep('confirm');
      } else {
        throw new Error(data.error || 'Failed to parse CV');
      }
    } catch (error) {
      console.error('CV parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`CV parsing failed: ${errorMessage}. Please try a different file or use manual setup.`);
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleStartInterview = () => {
    if (cvProfile) {
      onStartInterview({
        mode: 'cv',
        profile: cvProfile,
        questionCount: 7
      });
    }
  };

  if (step === 'upload') {
    return (
      <div className="cv-upload-mode">
        <button className="back-btn" onClick={onBack}>← Back</button>
        
        <div className="upload-container">
          <h2>Smart Interview Mode</h2>
          <p>Upload your CV for personalized questions based on your experience</p>
          
          <div className="upload-area">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className="upload-label">
              <div className="upload-icon">📁</div>
              <h3>Drop your CV here or click to browse</h3>
              <p>Supports PDF, DOC, DOCX files</p>
            </label>
          </div>
          
          <div className="benefits">
            <h4>What you'll get:</h4>
            <ul>
              <li>✓ 2 Skill-based questions from your CV</li>
              <li>✓ 2 Project-based questions</li>
              <li>✓ 2 Conceptual/System-design questions</li>
              <li>✓ 1 HR/Behavioral question</li>
            </ul>
          </div>
          
          <div className="upload-note">
            <p><strong>Note:</strong> Supports PDF and DOCX files. If upload fails, you can use the manual setup option.</p>
          </div>
        </div>

        <style>{`
          .cv-upload-mode {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
          }

          .back-btn {
            background: none;
            border: none;
            color: #667eea;
            font-size: 1rem;
            cursor: pointer;
            margin-bottom: 2rem;
          }

          .upload-container {
            text-align: center;
          }

          .upload-container h2 {
            color: #1a202c;
            margin-bottom: 0.5rem;
          }

          .upload-container p {
            color: #718096;
            margin-bottom: 2rem;
          }

          .upload-area {
            border: 2px dashed #cbd5e0;
            border-radius: 12px;
            padding: 3rem 2rem;
            margin-bottom: 2rem;
            transition: all 0.3s ease;
          }

          .upload-area:hover {
            border-color: #667eea;
            background: #f7fafc;
          }

          .upload-label {
            cursor: pointer;
            display: block;
          }

          .upload-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .upload-label h3 {
            color: #2d3748;
            margin-bottom: 0.5rem;
          }

          .upload-label p {
            color: #a0aec0;
            font-size: 0.9rem;
          }

          .benefits {
            background: #f7fafc;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: left;
          }

          .benefits h4 {
            color: #2d3748;
            margin-bottom: 1rem;
          }

          .benefits ul {
            list-style: none;
            padding: 0;
          }

          .benefits li {
            color: #4a5568;
            margin-bottom: 0.5rem;
          }
          
          .upload-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
            text-align: center;
          }
          
          .upload-note p {
            color: #856404;
            margin: 0;
            font-size: 0.9rem;
          }
        `}</style>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="processing-container">
        <div className="avatar-speaking">
          <div className="avatar-circle">
            <span className="avatar-emoji">🤖</span>
          </div>
          <div className="speech-bubble">
            "I'm analyzing your CV. This will help me ask you personalized questions based on your experience..."
          </div>
        </div>
        
        <div className="processing-steps">
          <div className="step active">📄 Reading CV content...</div>
          <div className="step active">🔍 Extracting skills & experience...</div>
          <div className="step active">🏗️ Analyzing projects & achievements...</div>
          <div className="step active">✨ Preparing personalized questions...</div>
        </div>

        <style>{`
          .processing-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
          }

          .avatar-speaking {
            margin-bottom: 3rem;
          }

          .avatar-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            animation: pulse 2s infinite;
          }

          .avatar-emoji {
            font-size: 2rem;
          }

          .speech-bubble {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 20px;
            padding: 1rem 1.5rem;
            position: relative;
            color: #2d3748;
            font-style: italic;
          }

          .speech-bubble::before {
            content: '';
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 8px solid #e2e8f0;
          }

          .processing-steps {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .step {
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            color: #718096;
          }

          .step.active {
            border-color: #10b981;
            background: #ecfdf5;
            color: #065f46;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  if (step === 'confirm' && cvProfile) {
    return (
      <div className="confirm-container">
        <div className="avatar-speaking">
          <div className="avatar-circle">
            <span className="avatar-emoji">🤖</span>
          </div>
          <div className="speech-bubble">
            "I have reviewed your CV. I see you have experience in {cvProfile.skills.slice(0,2).join(' and ')}. I will ask you questions based on your experience."
          </div>
        </div>

        <div className="profile-summary">
          <h3>Your Profile Summary</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <strong>Experience:</strong> {cvProfile.experience}
            </div>
            <div className="profile-item">
              <strong>Key Skills:</strong> {cvProfile.skills.slice(0,5).join(', ')}
            </div>
            <div className="profile-item">
              <strong>Projects:</strong> {cvProfile.projects.slice(0,2).join(', ')}
            </div>
            <div className="profile-item">
              <strong>Technologies:</strong> {cvProfile.technologies.slice(0,4).join(', ')}
            </div>
          </div>
        </div>

        <div className="interview-plan">
          <h4>Your Personalized Interview Plan (7 Questions)</h4>
          <div className="question-types">
            <div className="question-type">📋 2 Skill-based questions</div>
            <div className="question-type">🚀 2 Project-based questions</div>
            <div className="question-type">🏗️ 2 System design questions</div>
            <div className="question-type">💼 1 Behavioral question</div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="edit-btn" onClick={() => setStep('edit')}>
            ✏️ Edit Profile
          </button>
          <button className="start-interview-btn" onClick={handleStartInterview}>
            Start My Personalized Interview
          </button>
        </div>

        <style>{`
          .confirm-container {
            max-width: 700px;
            margin: 0 auto;
            padding: 2rem;
          }

          .avatar-speaking {
            margin-bottom: 2rem;
            text-align: center;
          }

          .avatar-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
          }

          .avatar-emoji {
            font-size: 1.5rem;
          }

          .speech-bubble {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 20px;
            padding: 1rem 1.5rem;
            color: #2d3748;
            font-style: italic;
            max-width: 500px;
            margin: 0 auto;
          }

          .profile-summary {
            background: #f7fafc;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .profile-summary h3 {
            color: #2d3748;
            margin-bottom: 1rem;
          }

          .profile-grid {
            display: grid;
            gap: 0.75rem;
          }

          .profile-item {
            color: #4a5568;
            line-height: 1.5;
          }

          .profile-item strong {
            color: #2d3748;
          }

          .interview-plan {
            background: #ecfdf5;
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .interview-plan h4 {
            color: #065f46;
            margin-bottom: 1rem;
          }

          .question-types {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.75rem;
          }

          .question-type {
            background: white;
            border-radius: 8px;
            padding: 0.75rem;
            color: #065f46;
            font-weight: 500;
          }

          .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .edit-btn {
            background: none;
            border: 2px solid #667eea;
            color: #667eea;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .edit-btn:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
          }

          .start-interview-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
          }

          .start-interview-btn:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  if (step === 'edit' && cvProfile) {
    return (
      <div className="edit-container">
        <h2>Edit Your Profile</h2>
        <p>Correct any information that doesn't match your background:</p>
        
        <div className="edit-form">
          <div className="form-group">
            <label>Experience</label>
            <input
              type="text"
              value={cvProfile.experience}
              onChange={(e) => setCvProfile({...cvProfile, experience: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Skills (comma-separated)</label>
            <input
              type="text"
              value={cvProfile.skills.join(', ')}
              onChange={(e) => setCvProfile({...cvProfile, skills: e.target.value.split(',').map(s => s.trim())})}
            />
          </div>
          
          <div className="form-group">
            <label>Projects (comma-separated)</label>
            <input
              type="text"
              value={cvProfile.projects.join(', ')}
              onChange={(e) => setCvProfile({...cvProfile, projects: e.target.value.split(',').map(s => s.trim())})}
            />
          </div>
          
          <div className="form-group">
            <label>Technologies (comma-separated)</label>
            <input
              type="text"
              value={cvProfile.technologies.join(', ')}
              onChange={(e) => setCvProfile({...cvProfile, technologies: e.target.value.split(',').map(s => s.trim())})}
            />
          </div>
          
          <div className="edit-actions">
            <button className="back-btn" onClick={() => setStep('confirm')}>← Back</button>
            <button className="save-btn" onClick={() => setStep('confirm')}>Save Changes</button>
          </div>
        </div>

        <style>{`
          .edit-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
          }

          .edit-container h2 {
            color: #2d3748;
            margin-bottom: 0.5rem;
          }

          .edit-container p {
            color: #718096;
            margin-bottom: 2rem;
          }

          .edit-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }

          .form-group label {
            color: #2d3748;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .form-group input {
            padding: 0.75rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
          }

          .form-group input:focus {
            outline: none;
            border-color: #667eea;
          }

          .edit-actions {
            display: flex;
            gap: 1rem;
            justify-content: space-between;
            margin-top: 2rem;
          }

          .back-btn {
            background: none;
            border: 2px solid #e2e8f0;
            color: #718096;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
          }

          .save-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default CVUploadMode;