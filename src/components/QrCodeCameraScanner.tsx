
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { Camera, CameraOff } from 'lucide-react';

interface QrCodeCameraScannerProps {
  onScan: (result: string) => void;
}

const QrCodeCameraScanner = ({ onScan }: QrCodeCameraScannerProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Access Error',
        description: 'Could not access your camera. Please check permissions.',
        variant: 'destructive',
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsStreaming(false);
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Use jsQR to detect QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      onScan(code.data);
      stopCamera();
      toast({
        title: 'QR Code Detected!',
        description: 'Successfully scanned the QR code.',
      });
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    let animationFrame: number;
    let scanInterval: NodeJS.Timeout;

    if (isStreaming) {
      // Set up continuous scanning
      scanInterval = setInterval(() => {
        animationFrame = requestAnimationFrame(() => {
          scanQRCode();
        });
      }, 500); // Scan every 500ms
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      // Clean up on component unmount
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div 
        className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
        onClick={() => !isScanning && startCamera()}
      >
        {isScanning ? (
          <>
            <video 
              ref={videoRef} 
              className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
              playsInline
              muted
            />
            <canvas 
              ref={canvasRef} 
              className="hidden"
            />
            {!isStreaming && (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-400 flex flex-col items-center gap-2 p-8 w-full h-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center">
            <Camera size={48} className="text-gray-300" />
            <p>Click here to scan QR code with camera</p>
          </div>
        )}
      </div>

      <Button 
        onClick={isScanning ? stopCamera : startCamera} 
        variant={isScanning ? "destructive" : "default"}
        className="w-full flex items-center gap-2"
      >
        {isScanning ? (
          <>
            <CameraOff size={18} />
            Stop Camera
          </>
        ) : (
          <>
            <Camera size={18} />
            Start Camera
          </>
        )}
      </Button>
    </div>
  );
};

export default QrCodeCameraScanner;
