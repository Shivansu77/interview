const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Parse CV and extract profile information
router.post('/parse', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text = '';
    
    // Extract text from PDF
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } else {
      // For DOC/DOCX files, you'd need additional libraries like mammoth
      text = req.file.buffer.toString('utf8');
    }

    // Extract profile information using simple regex patterns
    const profile = extractProfile(text);
    
    res.json({ 
      success: true, 
      profile,
      rawText: text.substring(0, 500) // First 500 chars for debugging
    });
  } catch (error) {
    console.error('CV parsing error:', error);
    res.status(500).json({ error: 'Failed to parse CV' });
  }
});

function extractProfile(text) {
  const lowerText = text.toLowerCase();
  
  // Extract name (first line or after "name:")
  const nameMatch = text.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m) || 
                   text.match(/name[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i);
  const name = nameMatch ? nameMatch[1] : 'Candidate';

  // Extract experience
  const expMatch = text.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
  const experience = expMatch ? `${expMatch[1]} years of experience` : 'Entry level';

  // Extract skills
  const skillsSection = extractSection(text, ['skills', 'technical skills', 'technologies']);
  const skills = extractSkills(skillsSection || text);

  // Extract projects
  const projectsSection = extractSection(text, ['projects', 'work experience', 'experience']);
  const projects = extractProjects(projectsSection || text);

  // Extract education
  const educationSection = extractSection(text, ['education', 'qualification']);
  const education = extractEducation(educationSection || text);

  // Extract technologies (similar to skills but more specific)
  const technologies = skills.filter(skill => 
    ['javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'mongodb', 'sql', 'aws', 'docker'].some(tech => 
      skill.toLowerCase().includes(tech)
    )
  );

  return {
    name,
    experience,
    skills: skills.slice(0, 10), // Limit to top 10 skills
    projects: projects.slice(0, 5), // Limit to top 5 projects
    education,
    technologies: technologies.slice(0, 8) // Limit to top 8 technologies
  };
}

function extractSection(text, keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]*([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Z\\s]*:|$)`, 'i');
    const match = text.match(regex);
    if (match) return match[1];
  }
  return null;
}

function extractSkills(text) {
  const skillPatterns = [
    /(?:javascript|js|typescript|ts|python|java|c\+\+|c#|php|ruby|go|rust|swift)/gi,
    /(?:react|angular|vue|svelte|next\.js|nuxt\.js)/gi,
    /(?:node\.js|express|django|flask|spring|laravel)/gi,
    /(?:mongodb|mysql|postgresql|redis|elasticsearch)/gi,
    /(?:aws|azure|gcp|docker|kubernetes|jenkins)/gi,
    /(?:html|css|sass|scss|tailwind|bootstrap)/gi,
    /(?:git|github|gitlab|bitbucket|jira|confluence)/gi
  ];

  const skills = new Set();
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => skills.add(match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()));
  });

  // Also extract comma-separated skills
  const commaSkills = text.match(/(?:^|\n|\s)([A-Za-z][A-Za-z\s\.]*?)(?:,|\n|$)/g) || [];
  commaSkills.forEach(skill => {
    const cleaned = skill.trim().replace(/^[,\s]+|[,\s]+$/g, '');
    if (cleaned.length > 2 && cleaned.length < 20) {
      skills.add(cleaned);
    }
  });

  return Array.from(skills).slice(0, 15);
}

function extractProjects(text) {
  const projectPatterns = [
    /project[:\s]*([^\n]+)/gi,
    /built[:\s]*([^\n]+)/gi,
    /developed[:\s]*([^\n]+)/gi,
    /created[:\s]*([^\n]+)/gi
  ];

  const projects = new Set();
  
  projectPatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const project = match.replace(/^(project|built|developed|created)[:\s]*/i, '').trim();
      if (project.length > 5 && project.length < 100) {
        projects.add(project);
      }
    });
  });

  return Array.from(projects).slice(0, 5);
}

function extractEducation(text) {
  const eduPatterns = [
    /(?:bachelor|master|phd|degree|diploma|certification)[\s\w]*(?:in|of)[\s\w]*/gi,
    /(?:b\.?tech|m\.?tech|b\.?sc|m\.?sc|mba|bba)[\s\w]*/gi,
    /(?:computer science|engineering|information technology|software)/gi
  ];

  for (const pattern of eduPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return 'Computer Science background';
}

module.exports = router;