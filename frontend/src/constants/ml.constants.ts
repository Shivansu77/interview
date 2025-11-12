export const ML_CONSTANTS = {
  MODEL_LOAD_DELAY: 2000,
  PREDICTION_DELAY: 1500,
  MOCK_PREDICTIONS: [
    { label: 'Person', confidence: 0.95 },
    { label: 'Face', confidence: 0.89 },
    { label: 'Professional', confidence: 0.76 },
    { label: 'Interview Ready', confidence: 0.82 }
  ]
} as const;

export const COLORS = {
  PRIMARY: '#4CAF50',
  SECONDARY: '#2196F3',
  WARNING: '#FF9800',
  ERROR: '#f44336',
  BACKGROUND: '#1a1a1a',
  CARD_BACKGROUND: '#2a2a2a',
  TEXT_SECONDARY: '#ccc',
  TEXT_MUTED: '#666'
} as const;