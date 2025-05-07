
import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { CameraOff, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrCodeCameraScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
}

const QrCodeCameraScanner = ({ onScan, isActive }: QrCodeCameraScannerProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    setIsScanning(true);
    setCapturedFrame(null);
    setScanAttempts(0);
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          // Request higher frame rates for smoother scanning
          frameRate: { ideal: 30 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
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

  // Process image data to detect QR code with enhanced error handling and multiple attempts
  const processImageData = (imageData: ImageData, attempt: number = 0): boolean => {
    // Use jsQR to detect QR code in image data with increased sensitivity
    const options = {
      inversionAttempts: "dontInvert", // Try with default first (faster)
    };
    
    let code = jsQR(imageData.data, imageData.width, imageData.height, options);
    
    // If no code found with default inversion, try with inversion (catches more codes)
    if (!code && attempt === 0) {
      const invertedOptions = {
        inversionAttempts: "invertFirst", // Try inverted version
      };
      code = jsQR(imageData.data, imageData.width, imageData.height, invertedOptions);
    }
    
    if (code) {
      // Save the current frame as an image when QR code is detected
      if (canvasRef.current) {
        const capturedImageUrl = canvasRef.current.toDataURL('image/png');
        setCapturedFrame(capturedImageUrl);
      }
      
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

  // Enhanced scanQRCode function with multiple processing attempts
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return false;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return false;
    
    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Try with original size first
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Increment scan attempt counter
    setScanAttempts(prev => prev + 1);
    
    // Try normal scan first
    if (processImageData(imageData)) {
      return true;
    }
    
    // If we've had several failed attempts, try with different image processing techniques
    if (scanAttempts > 10) {
      // Try increased contrast
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      
      // Adjust contrast and brightness - helps with difficult lighting
      const contrastImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = contrastImageData.data;
      
      const contrast = 1.5; // Increase contrast
      const intercept = 0; // Brightness
      
      for (let i = 0; i < data.length; i += 4) {
        // Apply contrast formula to RGB channels
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + intercept));
        data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128) * contrast + 128 + intercept));
        data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128) * contrast + 128 + intercept));
      }
      
      ctx.putImageData(contrastImageData, 0, 0);
      const enhancedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Try scanning with enhanced image
      if (processImageData(enhancedImageData, 1)) {
        return true;
      }
    }
    
    return false;
  };

  // Restart scanning
  const handleRescan = () => {
    setCapturedFrame(null);
    setIsScanning(false);
    setScanAttempts(0);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Download captured frame
  const handleDownloadFrame = () => {
    if (!capturedFrame) return;
    
    const link = document.createElement('a');
    link.href = capturedFrame;
    link.download = `qr-scan-${new Date().getTime()}.png`;
    link.click();
    
    toast({
      title: 'Image Downloaded',
      description: 'The captured QR image has been downloaded.',
    });
  };

  // Start camera when tab becomes active
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isActive]);

  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    let isScanning = false;

    if (isStreaming) {
      // Set up continuous scanning with adaptive interval
      scanInterval = setInterval(() => {
        // Only start a new scan if we're not already scanning
        if (!isScanning) {
          isScanning = true;
          
          // Use requestAnimationFrame to sync with browser rendering
          requestAnimationFrame(() => {
            try {
              scanQRCode();
            } finally {
              isScanning = false;
            }
          });
        }
      }, 100); // Increased frequency to 10 scans per second for better detection
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [isStreaming, scanAttempts]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {isScanning ? (
          <>
            {capturedFrame ? (
              <div className="relative w-full h-full">
                {/* Display captured frame edge to edge */}
                <img 
                  src={capturedFrame} 
                  alt="Captured QR code" 
                  className="w-full h-full object-cover"
                />
                
                {/* Blurred button background for download (bottom-left) */}
                <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm rounded-full">
                  <Button 
                    onClick={handleDownloadFrame}
                    size="icon" 
                    className="h-12 w-12 rounded-full"
                  >
                    <Download className="h-6 w-6" />
                  </Button>
                </div>
                
                {/* Blurred button background for rescan (bottom-right) */}
                <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-full">
                  <Button 
                    onClick={handleRescan}
                    size="icon" 
                    className="h-12 w-12 rounded-full"
                  >
                    <RefreshCw className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                  autoPlay
                />
                <canvas 
                  ref={canvasRef} 
                  className="hidden"
                />
                {!isStreaming && (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-400 flex flex-col items-center gap-2 p-8 w-full h-full">
            <p>Camera access required to scan QR code</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodeCameraScanner;
