const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// MediaPipe face detection endpoint
router.post('/detect-face', async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ error: 'Image data required' });
    }
    
    // Save base64 image to temp file
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    const tempImagePath = path.join('uploads', `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempImagePath, imageBuffer);
    
    // Run MediaPipe Python script
    const pythonScript = `
import cv2
import mediapipe as mp
import json
import sys

mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

def detect_blendshapes(image_path):
    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5) as face_mesh:
        
        image = cv2.imread(image_path)
        results = face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0]
            
            # Extract key points for blendshapes
            blendshapes = {
                'eyeBlinkLeft': calculate_eye_blink(landmarks, 'left'),
                'eyeBlinkRight': calculate_eye_blink(landmarks, 'right'),
                'jawOpen': calculate_jaw_open(landmarks),
                'mouthSmile': calculate_mouth_smile(landmarks),
                'browInnerUp': calculate_brow_raise(landmarks)
            }
            
            return blendshapes
    
    return {}

def calculate_eye_blink(landmarks, side):
    # Simplified eye aspect ratio calculation
    if side == 'left':
        # Left eye landmarks
        p1, p2, p3, p4, p5, p6 = 362, 385, 387, 263, 373, 380
    else:
        # Right eye landmarks  
        p1, p2, p3, p4, p5, p6 = 33, 160, 158, 133, 153, 144
    
    # Calculate eye aspect ratio
    vertical_1 = abs(landmarks.landmark[p2].y - landmarks.landmark[p6].y)
    vertical_2 = abs(landmarks.landmark[p3].y - landmarks.landmark[p5].y)
    horizontal = abs(landmarks.landmark[p1].x - landmarks.landmark[p4].x)
    
    ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
    return max(0, 1 - ear * 5)  # Normalize to 0-1

def calculate_jaw_open(landmarks):
    # Upper and lower lip distance
    upper_lip = landmarks.landmark[13].y
    lower_lip = landmarks.landmark[14].y
    jaw_open = abs(lower_lip - upper_lip)
    return min(1, jaw_open * 20)  # Normalize

def calculate_mouth_smile(landmarks):
    # Mouth corner positions
    left_corner = landmarks.landmark[61]
    right_corner = landmarks.landmark[291]
    mouth_center = landmarks.landmark[13]
    
    # Calculate smile based on corner elevation
    smile_left = max(0, mouth_center.y - left_corner.y)
    smile_right = max(0, mouth_center.y - right_corner.y)
    return min(1, (smile_left + smile_right) * 10)

def calculate_brow_raise(landmarks):
    # Eyebrow and eye distance
    left_brow = landmarks.landmark[70].y
    left_eye = landmarks.landmark[159].y
    brow_distance = abs(left_eye - left_brow)
    return min(1, brow_distance * 15)

if __name__ == "__main__":
    image_path = sys.argv[1]
    blendshapes = detect_blendshapes(image_path)
    print(json.dumps(blendshapes))
`;
    
    // Write Python script to temp file
    const scriptPath = path.join('uploads', 'mediapipe_detect.py');
    fs.writeFileSync(scriptPath, pythonScript);
    
    // Execute Python script
    const pythonProcess = spawn('python', [scriptPath, tempImagePath]);
    
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up temp files
      fs.unlinkSync(tempImagePath);
      fs.unlinkSync(scriptPath);
      
      if (code === 0) {
        try {
          const blendshapes = JSON.parse(output);
          res.json({ blendshapes });
        } catch (error) {
          res.status(500).json({ error: 'Failed to parse MediaPipe output' });
        }
      } else {
        res.status(500).json({ error: 'MediaPipe processing failed' });
      }
    });
    
  } catch (error) {
    console.error('MediaPipe API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real-time blendshapes streaming
router.get('/stream-blendshapes', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send sample blendshapes data
  const sendBlendshapes = () => {
    const blendshapes = {
      eyeBlinkLeft: Math.random() * 0.3,
      eyeBlinkRight: Math.random() * 0.3,
      jawOpen: Math.random() * 0.5,
      mouthSmile: Math.random() * 0.4,
      browInnerUp: Math.random() * 0.3
    };
    
    res.write(`data: ${JSON.stringify(blendshapes)}\n\n`);
  };
  
  const interval = setInterval(sendBlendshapes, 100); // 10 FPS
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

module.exports = router;