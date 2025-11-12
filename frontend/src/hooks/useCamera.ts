import { useState, useRef } from 'react';

export const useCamera = () => {
  const [isCamera, setIsCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      throw new Error('Camera access denied. Please allow camera access.');
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

  const captureImage = (): string | null => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  return {
    isCamera,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureImage
  };
};