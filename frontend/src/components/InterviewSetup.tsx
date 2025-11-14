import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CVProfile {
  name: string;
  experience: string;
  skills: string[];
  projects: string[];
  education: string;
  technologies: string[];
}

interface InterviewSetupProps {
  onStartInterview: (profile?: CVProfile) => void;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStartInterview }) => {
  const [mode, setMode] = useState<'choice' | 'cv-upload' | 'manual' | 'confirm'>('choice');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cvProfile, setCvProfile] = useState<CVProfile | null>(null);
  const [manualProfile, setManualProfile] = useState({
    jobRole: '',
    experienceLevel: '',
    skills: ''
  });

  const handleCVUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      
      const response = await fetch('http://localhost:5003/api/cv/parse', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setCvProfile(data.profile);
      setMode('confirm');
    } catch (error) {
      console.error('CV parsing error:', error);
      // Fallback mock profile for demo
      setCvProfile({
        name: 'John Doe',
        experience: '2 years in web development',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        projects: ['E-commerce Platform', 'Task Management App'],
        education: 'Bachelor in Computer Science',
        technologies: ['React', 'Express.js', 'MongoDB', 'TypeScript']
      });
      setMode('confirm');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      handleCVUpload(file);
    }
  };

  const handleManualSubmit = () => {
    const profile: CVProfile = {
      name: 'Candidate',
      experience: `${manualProfile.experienceLevel} in ${manualProfile.jobRole}`,
      skills: manualProfile.skills.split(',').map(s => s.trim()),
      projects: [],
      education: '',
      technologies: manualProfile.skills.split(',').map(s => s.trim())
    };
    onStartInterview(profile);
  };

  if (mode === 'choice') {
    return (
      <div className="interview-setup">
        <div className="setup-container">
          <h2>Welcome to AI Interview</h2>
          <p>Choose how you'd like to start your interview:</p>
          
          <div className="setup-options">
            <div className="option-card recommended" onClick={() => setMode('cv-upload')}>
              <div className="option-icon">📄</div>
              <h3>Start with Resume</h3>
              <p>Upload your CV for personalized questions</p>
              <span className="badge">Recommended</span>
            </div>
            
            <div className="option-card" onClick={() => setMode('manual')}>
              <div className="option-icon">⚡</div>
              <h3>Quick Start</h3>
              <p>Enter basic info for general questions</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'cv-upload') {
    return (
      <div className="interview-setup">
        <div className="setup-container">
          <button className="back-btn" onClick={() => setMode('choice')}>← Back</button>
          <h2>Upload Your Resume</h2>
          
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
              <p>Click to upload your CV</p>
              <small>Supports PDF, DOC, DOCX</small>
            </label>
          </div>
          
          {isProcessing && (
            <div className="processing">
              <div className="spinner"></div>
              <p>Analyzing your resume...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'manual') {
    return (
      <div className="interview-setup">
        <div className="setup-container">
          <button className="back-btn" onClick={() => setMode('choice')}>← Back</button>
          <h2>Quick Setup</h2>
          
          <div className="manual-form">
            <div className="form-group">
              <label>Job Role</label>
              <select 
                value={manualProfile.jobRole} 
                onChange={(e) => setManualProfile({...manualProfile, jobRole: e.target.value})}
              >
                <option value="">Select Role</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Experience Level</label>
              <select 
                value={manualProfile.experienceLevel} 
                onChange={(e) => setManualProfile({...manualProfile, experienceLevel: e.target.value})}
              >
                <option value="">Select Level</option>
                <option value="Entry Level">Entry Level (0-1 years)</option>
                <option value="Junior">Junior (1-3 years)</option>
                <option value="Mid Level">Mid Level (3-5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Key Skills</label>
              <input
                type="text"
                placeholder="e.g., JavaScript, React, Node.js"
                value={manualProfile.skills}
                onChange={(e) => setManualProfile({...manualProfile, skills: e.target.value})}
              />
            </div>
            
            <button 
              className="start-btn"
              onClick={handleManualSubmit}
              disabled={!manualProfile.jobRole || !manualProfile.experienceLevel}
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'confirm' && cvProfile) {
    return (
      <div className="interview-setup">
        <div className="setup-container">
          <h2>Confirm Your Profile</h2>
          <p>Please verify the information extracted from your resume:</p>
          
          <div className="profile-summary">
            <div className="profile-item">
              <strong>Experience:</strong> {cvProfile.experience}
            </div>
            <div className="profile-item">
              <strong>Skills:</strong> {cvProfile.skills.join(', ')}
            </div>
            <div className="profile-item">
              <strong>Technologies:</strong> {cvProfile.technologies.join(', ')}
            </div>
            {cvProfile.projects.length > 0 && (
              <div className="profile-item">
                <strong>Projects:</strong> {cvProfile.projects.join(', ')}
              </div>
            )}
          </div>
          
          <div className="confirm-actions">
            <button className="edit-btn" onClick={() => setMode('manual')}>
              Edit Information
            </button>
            <button className="confirm-btn" onClick={() => onStartInterview(cvProfile)}>
              Looks Good - Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewSetup;