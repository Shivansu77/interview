import { useRef, useEffect, useState } from 'react';

interface AudioAnalyzerHook {
  audioLevel: number;
  startAnalyzing: () => void;
  stopAnalyzing: () => void;
  isAnalyzing: boolean;
}

export const useAudioAnalyzer = (): AudioAnalyzerHook => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const startAnalyzing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzer = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      setIsAnalyzing(true);
      
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!analyzer) return;
        
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255);
        
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAnalyzing = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsAnalyzing(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      stopAnalyzing();
    };
  }, []);

  return {
    audioLevel,
    startAnalyzing,
    stopAnalyzing,
    isAnalyzing
  };
};