import React, { useState, useRef, useEffect } from 'react';

interface MLComponentProps {
  onBack: () => void;
}

const MLComponent: React.FC<MLComponentProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCamera, setIsCamera] = useState(false);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      setModelLoaded(true);
      console.log('ML Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        classifyImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCamera(true);
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access denied. Please allow camera access.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setImagePreview(imageData);
        classifyImage(imageData);
        stopCamera();
      }
    }
  };

  const classifyImage = async (imageData: string) => {
    if (!modelLoaded) {
      alert('Model not loaded yet. Please wait.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate ML prediction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockPredictions = [
        { label: 'Person', confidence: 0.95 },
        { label: 'Face', confidence: 0.89 },
        { label: 'Professional', confidence: 0.76 },
        { label: 'Interview Ready', confidence: 0.82 }
      ];

      const randomPrediction = mockPredictions[Math.floor(Math.random() * mockPredictions.length)];
      
      setPrediction({
        topPrediction: randomPrediction,
        allPredictions: mockPredictions,
        confidence: randomPrediction.confidence,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Classification error:', error);
      setPrediction({
        error: 'Classification failed. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPrediction = () => {
    setPrediction(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      color: 'white',
      minHeight: '600px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🤖 ML Image Classifier
        </h1>
        <button onClick={onBack} style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          ← Back
        </button>
      </div>

      {/* Model Status */}
      <div style={{
        backgroundColor: modelLoaded ? '#2a4a2a' : '#4a2a2a',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `2px solid ${modelLoaded ? '#4CAF50' : '#f44336'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: modelLoaded ? '#4CAF50' : '#f44336'
          }} />
          <span style={{ fontWeight: 'bold' }}>
            Model Status: {modelLoaded ? 'Ready' : 'Loading...'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Input Section */}
        <div>
          <h3 style={{ color: '#FF9800', marginBottom: '20px' }}>📸 Input Methods</h3>
          
          {/* Upload Button */}
          <div style={{ marginBottom: '20px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!modelLoaded}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: modelLoaded ? '#4CAF50' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: modelLoaded ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}
            >
              📁 Upload Image
            </button>
          </div>

          {/* Camera Controls */}
          <div style={{ marginBottom: '20px' }}>
            {!isCamera ? (
              <button
                onClick={startCamera}
                disabled={!modelLoaded}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: modelLoaded ? '#2196F3' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: modelLoaded ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                📷 Use Camera
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={captureImage}
                  style={{
                    flex: 1,
                    padding: '15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  📸 Capture
                </button>
                <button
                  onClick={stopCamera}
                  style={{
                    flex: 1,
                    padding: '15px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ❌ Stop
                </button>
              </div>
            )}
          </div>

          {/* Camera Feed */}
          {isCamera && (
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <video
                ref={videoRef}
                style={{ width: '100%', height: 'auto' }}
                autoPlay
                muted
              />
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              padding: '10px',
              marginBottom: '20px'
            }}>
              <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Preview:</h4>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '6px',
                  maxHeight: '300px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
        </div>

        {/* Results Section */}
        <div>
          <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>🎯 Prediction Results</h3>
          
          {isLoading && (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px solid #FF9800'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔄</div>
              <div style={{ color: '#FF9800', fontSize: '18px' }}>
                {modelLoaded ? 'Analyzing image...' : 'Loading ML model...'}
              </div>
            </div>
          )}

          {prediction && !isLoading && (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #4CAF50'
            }}>
              {prediction.error ? (
                <div style={{ color: '#f44336', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>❌</div>
                  <div>{prediction.error}</div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>Top Prediction:</h4>
                    <div style={{
                      backgroundColor: '#1a1a1a',
                      padding: '15px',
                      borderRadius: '6px',
                      border: '1px solid #4CAF50'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                        {prediction.topPrediction.label}
                      </div>
                      <div style={{ color: '#ccc', marginTop: '5px' }}>
                        Confidence: {Math.round(prediction.topPrediction.confidence * 100)}%
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#ccc', marginBottom: '10px' }}>All Predictions:</h4>
                    {prediction.allPredictions.map((pred: any, index: number) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '4px',
                        marginBottom: '5px'
                      }}>
                        <span>{pred.label}</span>
                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {Math.round(pred.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                    Analyzed at {prediction.timestamp}
                  </div>
                </div>
              )}
            </div>
          )}

          {!prediction && !isLoading && (
            <div style={{
              backgroundColor: '#2a2a2a',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px dashed #666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🖼️</div>
              <div style={{ color: '#ccc' }}>
                Upload an image or use camera to get ML predictions
              </div>
            </div>
          )}

          {prediction && (
            <button
              onClick={resetPrediction}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '15px',
                fontSize: '14px'
              }}
            >
              🔄 Reset & Try Again
            </button>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Info Section */}
      <div style={{
        marginTop: '30px',
        backgroundColor: '#2a2a2a',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #2196F3'
      }}>
        <h4 style={{ color: '#2196F3', marginBottom: '15px' }}>ℹ️ About This ML Component</h4>
        <ul style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
          <li>Uses simulated machine learning for image classification</li>
          <li>Supports both file upload and camera capture</li>
          <li>Provides confidence scores for predictions</li>
          <li>Real-time processing with visual feedback</li>
          <li>Can be extended with actual ML models (TensorFlow.js, etc.)</li>
        </ul>
      </div>
    </div>
  );
};

export default MLComponent;