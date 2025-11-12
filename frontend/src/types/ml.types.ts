export interface Prediction {
  label: string;
  confidence: number;
}

export interface MLPredictionResult {
  topPrediction: Prediction;
  allPredictions: Prediction[];
  confidence: number;
  timestamp: string;
  error?: string;
}

export interface MLComponentProps {
  onBack: () => void;
}