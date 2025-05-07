
import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { CameraOff, RefreshCw, Download, ScanQrCode } from 'lucide-react';
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
          width: { ideal: 1920 }, // Higher resolution for better detection
          height: { ideal: 1080 },
          frameRate: { ideal: 60 } // Higher frame rate for smoother scanning
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

  // Enhanced process image data function with better QR detection
  const processImageData = (imageData: ImageData, attempt: number = 0): boolean => {
    // Try multiple inversion attempts to improve detection rates
    const inversionTypes = ["dontInvert", "onlyInvert", "attemptBoth", "invertFirst"] as const;
    
    // Try with each inversion type for better detection chances
    for (const inversionAttempt of inversionTypes) {
      const code = jsQR(
        imageData.data, 
        imageData.width, 
        imageData.height, 
        { inversionAttempts: inversionAttempt }
      );
      
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
    }
    
    return false;
  };

  // Significantly enhanced scanQRCode function with multiple detection strategies
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return false;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return false;
    
    // Set canvas dimensions to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Multi-scale scanning - try at different scales for better detection
    const scales = [1.0, 0.75, 1.25, 0.5];
    
    // Try each scale
    for (const scale of scales) {
      // Calculate dimensions based on scale
      const scaledWidth = Math.floor(video.videoWidth * scale);
      const scaledHeight = Math.floor(video.videoHeight * scale);
      
      // Clear canvas for the new attempt
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the video at the current scale
      ctx.drawImage(
        video, 
        (canvas.width - scaledWidth) / 2, 
        (canvas.height - scaledHeight) / 2, 
        scaledWidth, 
        scaledHeight
      );
      
      // Apply various image processing techniques to improve detection
      
      // 1. Try with original image
      const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (processImageData(originalImageData)) {
        return true;
      }
      
      // 2. Try with contrast enhancement
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        video, 
        (canvas.width - scaledWidth) / 2, 
        (canvas.height - scaledHeight) / 2, 
        scaledWidth, 
        scaledHeight
      );
      
      const contrastImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const contrastData = contrastImageData.data;
      
      // Apply high contrast
      const contrast = 2.0;
      const brightness = 0;
      
      for (let i = 0; i < contrastData.length; i += 4) {
        // Apply contrast formula to RGB channels
        contrastData[i] = Math.max(0, Math.min(255, (contrastData[i] - 128) * contrast + 128 + brightness));
        contrastData[i+1] = Math.max(0, Math.min(255, (contrastData[i+1] - 128) * contrast + 128 + brightness));
        contrastData[i+2] = Math.max(0, Math.min(255, (contrastData[i+2] - 128) * contrast + 128 + brightness));
      }
      
      ctx.putImageData(contrastImageData, 0, 0);
      if (processImageData(contrastImageData)) {
        return true;
      }
      
      // 3. Try with grayscale to improve contrast
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        video, 
        (canvas.width - scaledWidth) / 2, 
        (canvas.height - scaledHeight) / 2, 
        scaledWidth, 
        scaledHeight
      );
      
      const grayscaleImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const grayscaleData = grayscaleImageData.data;
      
      for (let i = 0; i < grayscaleData.length; i += 4) {
        // Convert to grayscale using luminance formula
        const gray = 0.299 * grayscaleData[i] + 0.587 * grayscaleData[i+1] + 0.114 * grayscaleData[i+2];
        grayscaleData[i] = grayscaleData[i+1] = grayscaleData[i+2] = gray;
      }
      
      ctx.putImageData(grayscaleImageData, 0, 0);
      if (processImageData(grayscaleImageData)) {
        return true;
      }
    }
    
    // Increment scan attempt counter if no code was found
    setScanAttempts(prev => prev + 1);
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
    let scanInProgress = false;

    if (isStreaming) {
      // Set up scanning with a higher frequency
      scanInterval = setInterval(() => {
        // Only start a new scan if we're not already scanning
        if (!scanInProgress) {
          scanInProgress = true;
          
          requestAnimationFrame(() => {
            try {
              scanQRCode();
            } finally {
              scanInProgress = false;
            }
          });
        }
      }, 50); // Scan every 50ms for better detection rates
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
                
                {/* Overlay scanning animation */}
                {isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-[70%] h-[70%] border-2 border-primary/50 rounded-lg overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-scan" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ScanQrCode className="text-primary/50 w-12 h-12" />
                      </div>
                    </div>
                  </div>
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
