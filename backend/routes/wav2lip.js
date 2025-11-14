const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Generate lip-synced video using Wav2Lip
router.post('/generate', upload.fields([
  { name: 'face', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const faceFile = req.files.face[0];
    const audioFile = req.files.audio[0];
    
    if (!faceFile || !audioFile) {
      return res.status(400).json({ error: 'Face image and audio file required' });
    }
    
    const outputPath = path.join('uploads', `output_${Date.now()}.mp4`);
    
    // Run Wav2Lip Python script
    const wav2lipProcess = spawn('python', [
      'wav2lip/inference.py',
      '--checkpoint_path', 'wav2lip/checkpoints/wav2lip_gan.pth',
      '--face', faceFile.path,
      '--audio', audioFile.path,
      '--outfile', outputPath
    ]);
    
    wav2lipProcess.on('close', (code) => {
      // Clean up input files
      fs.unlinkSync(faceFile.path);
      fs.unlinkSync(audioFile.path);
      
      if (code === 0 && fs.existsSync(outputPath)) {
        // Send the generated video
        res.sendFile(path.resolve(outputPath), (err) => {
          if (!err) {
            // Clean up output file after sending
            setTimeout(() => {
              if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
              }
            }, 5000);
          }
        });
      } else {
        res.status(500).json({ error: 'Wav2Lip generation failed' });
      }
    });
    
    wav2lipProcess.on('error', (error) => {
      console.error('Wav2Lip process error:', error);
      res.status(500).json({ error: 'Failed to start Wav2Lip process' });
    });
    
  } catch (error) {
    console.error('Wav2Lip API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple avatar endpoint using pre-generated videos
router.post('/simple-avatar', async (req, res) => {
  try {
    const { text, voice = 'en-US-JennyNeural' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Generate TTS audio first
    const ttsResponse = await fetch('http://localhost:5003/api/ai/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice })
    });
    
    if (!ttsResponse.ok) {
      throw new Error('TTS generation failed');
    }
    
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioPath = path.join('uploads', `tts_${Date.now()}.wav`);
    fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
    
    // Use default avatar face
    const defaultFace = path.join(__dirname, '../assets/default-avatar.jpg');
    const outputPath = path.join('uploads', `avatar_${Date.now()}.mp4`);
    
    // Generate lip-sync video
    const wav2lipProcess = spawn('python', [
      'wav2lip/inference.py',
      '--checkpoint_path', 'wav2lip/checkpoints/wav2lip_gan.pth',
      '--face', defaultFace,
      '--audio', audioPath,
      '--outfile', outputPath
    ]);
    
    wav2lipProcess.on('close', (code) => {
      fs.unlinkSync(audioPath);
      
      if (code === 0 && fs.existsSync(outputPath)) {
        res.sendFile(path.resolve(outputPath), (err) => {
          if (!err) {
            setTimeout(() => {
              if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
              }
            }, 5000);
          }
        });
      } else {
        res.status(500).json({ error: 'Avatar generation failed' });
      }
    });
    
  } catch (error) {
    console.error('Simple avatar error:', error);
    res.status(500).json({ error: 'Avatar generation failed' });
  }
});

module.exports = router;