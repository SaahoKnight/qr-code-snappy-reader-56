
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
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(error => {
          console.error("Error playing video:", error);
        });
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

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return false;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Make sure video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.log("Video not ready yet");
      return false;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (canvas.width === 0 || canvas.height === 0) {
      console.log("Canvas dimensions are zero");
      return false;
    }
    
    // Clear canvas and draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (imageData.width === 0 || imageData.height === 0) {
        console.log("Image data dimensions are zero");
        return false;
      }
      
      console.log("Attempting QR scan with dimensions:", imageData.width, imageData.height);
      
      // Try with different inversion attempts
      const inversionTypes = ["dontInvert", "onlyInvert", "attemptBoth", "invertFirst"];
      
      for (const inversionType of inversionTypes) {
        const code = jsQR(
          imageData.data, 
          imageData.width, 
          imageData.height, 
          { inversionAttempts: inversionType as any }
        );
        
        if (code) {
          console.log("QR Code detected:", code.data);
          // Save the current frame
          const capturedImageUrl = canvas.toDataURL('image/png');
          setCapturedFrame(capturedImageUrl);
          
          onScan(code.data);
          stopCamera();
          toast({
            title: 'QR Code Detected!',
            description: 'Successfully scanned the QR code.',
          });
          return true;
        }
      }
    } catch (error) {
      console.error("Error during QR scan:", error);
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
    let scanInterval: number | null = null;
    
    if (isStreaming) {
      // Set up scanning with an appropriate interval
      scanInterval = window.setInterval(() => {
        scanQRCode();
      }, 200); // 5 scans per second is reasonable
    }
    
    return () => {
      if (scanInterval !== null) {
        clearInterval(scanInterval);
      }
    };
  }, [isStreaming]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {isScanning ? (
          <>
            {capturedFrame ? (
              <div className="relative w-full h-full">
                <img 
                  src={capturedFrame} 
                  alt="Captured QR code" 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm rounded-full">
                  <Button 
                    onClick={handleDownloadFrame}
                    size="icon" 
                    className="h-12 w-12 rounded-full"
                  >
                    <Download className="h-6 w-6" />
                  </Button>
                </div>
                
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
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[70%] h-[70%] border-2 border-primary/50 rounded-lg overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-scan" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ScanQrCode className="text-primary/50 w-12 h-12" />
                    </div>
                  </div>
                </div>
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
