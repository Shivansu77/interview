import { useState, useEffect } from 'react';
import { MLPredictionResult } from '../types/ml.types';
import { ML_CONSTANTS } from '../constants/ml.constants';

export const useMLModel = () => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, ML_CONSTANTS.MODEL_LOAD_DELAY));
      setModelLoaded(true);
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const classifyImage = async (imageData: string): Promise<MLPredictionResult> => {
    if (!modelLoaded) {
      throw new Error('Model not loaded yet. Please wait.');
    }

    await new Promise(resolve => setTimeout(resolve, ML_CONSTANTS.PREDICTION_DELAY));
    
    const randomPrediction = ML_CONSTANTS.MOCK_PREDICTIONS[
      Math.floor(Math.random() * ML_CONSTANTS.MOCK_PREDICTIONS.length)
    ];
    
    return {
      topPrediction: randomPrediction,
      allPredictions: [...ML_CONSTANTS.MOCK_PREDICTIONS],
      confidence: randomPrediction.confidence,
      timestamp: new Date().toLocaleTimeString()
    };
  };

  return {
    modelLoaded,
    isLoading,
    classifyImage
  };
};