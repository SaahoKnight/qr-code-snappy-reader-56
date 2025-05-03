
import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrCodeCameraScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
}

const QrCodeCameraScanner = ({ onScan, isActive }: QrCodeCameraScannerProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    setIsScanning(true);
    setCapturedImage(null);
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
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/png');
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
      // Capture the image at the moment of detection
      const imgUrl = captureFrame();
      setCapturedImage(imgUrl);
      
      onScan(code.data);
      stopCamera();
      setIsScanning(false); // Add this line to properly update scanning state
      toast({
        title: 'QR Code Detected!',
        description: 'Successfully scanned the QR code.',
      });
      return true;
    }
    
    return false;
  };

  const handleScanAgain = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleDownloadImage = () => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = 'qrcode-scan.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Image Downloaded',
      description: 'QR code scan image has been downloaded.',
    });
  };

  // Start camera when tab becomes active
  useEffect(() => {
    if (isActive && !capturedImage) {
      startCamera();
    } else if (!isActive) {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isActive]);

  useEffect(() => {
    let animationFrame: number;
    let scanInterval: NodeJS.Timeout;

    if (isStreaming && !capturedImage) {
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
  }, [isStreaming, capturedImage]);

  return (
    <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
      {capturedImage ? (
        <div className="relative w-full h-full">
          <img 
            src={capturedImage} 
            alt="QR Code Scan" 
            className="w-full h-full object-contain"
          />
          
          {/* Bottom-start: Download button */}
          <Button 
            variant="secondary"
            size="sm"
            className="absolute bottom-2 left-2 shadow-sm"
            onClick={handleDownloadImage}
            title="Download image"
          >
            <Download size={18} />
          </Button>
          
          {/* Bottom-end: Scan Again button */}
          <Button 
            variant="default"
            size="sm"
            className="absolute bottom-2 right-2 shadow-sm"
            onClick={handleScanAgain}
          >
            <RefreshCw size={18} className="mr-1" />
            Scan Again
          </Button>
        </div>
      ) : isScanning ? (
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
        <div className="text-sm text-gray-400 flex flex-col items-center gap-2 p-8 w-full h-full">
          <p>Camera access required to scan QR code</p>
        </div>
      )}
    </div>
  );
};

export default QrCodeCameraScanner;
