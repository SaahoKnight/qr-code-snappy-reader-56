
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
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [scanningFeedback, setScanningFeedback] = useState<string>('');
  const [scannerState, setScannerState] = useState<'idle' | 'scanning' | 'detected' | 'error'>('idle');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerBoxRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    setIsScanning(true);
    setScannerState('scanning');
    setCapturedImage(null);
    setScanningFeedback('Initializing camera...');
    
    try {
      // Try to get the environment camera (rear camera on mobile devices)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        setScanningFeedback('Looking for QR code...');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Access Error',
        description: 'Could not access your camera. Please check permissions.',
        variant: 'destructive',
      });
      setScannerState('error');
      setScanningFeedback('Camera access denied');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsStreaming(false);
    setScanningFeedback('');
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

  // Enhanced QR code scanning with multiple attempts and different processing methods
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
    
    // Try standard scan
    let code = jsQR(imageData.data, imageData.width, imageData.height);
    
    // If no code detected, try with different processing
    if (!code) {
      // Increase contrast
      const enhancedData = enhanceImageContrast(imageData.data, imageData.width, imageData.height);
      code = jsQR(enhancedData, imageData.width, imageData.height);
    }
    
    // If still no code detected, track attempts for feedback
    if (!code) {
      setDetectionAttempts(prev => {
        const newAttempts = prev + 1;
        
        // Update feedback based on attempts
        if (newAttempts % 10 === 0) {
          setScanningFeedback('Still searching... Try adjusting lighting or position');
        } else if (newAttempts % 20 === 0) {
          setScanningFeedback('Make sure QR code is clearly visible');
        }
        
        return newAttempts;
      });
      
      // Visual feedback on scanner box
      if (scannerBoxRef.current) {
        scannerBoxRef.current.classList.add('scanning-pulse');
        setTimeout(() => {
          if (scannerBoxRef.current) {
            scannerBoxRef.current.classList.remove('scanning-pulse');
          }
        }, 300);
      }
      
      return false;
    }
    
    // Code detected!
    // Capture the image at the moment of detection
    const imgUrl = captureFrame();
    setCapturedImage(imgUrl);
    
    setScannerState('detected');
    onScan(code.data);
    stopCamera();
    setIsScanning(false);
    setDetectionAttempts(0);
    toast({
      title: 'QR Code Detected!',
      description: 'Successfully scanned the QR code.',
    });
    return true;
  };

  // Image processing function to enhance contrast for better QR detection
  const enhanceImageContrast = (data: Uint8ClampedArray, width: number, height: number) => {
    const enhancedData = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply threshold to increase contrast
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const value = avg > 100 ? 255 : 0; // Threshold value
      
      enhancedData[i] = value;     // R
      enhancedData[i + 1] = value; // G
      enhancedData[i + 2] = value; // B
      enhancedData[i + 3] = data[i + 3]; // Keep original alpha
    }
    
    return enhancedData;
  };

  const handleScanAgain = () => {
    setCapturedImage(null);
    setDetectionAttempts(0);
    setScanningFeedback('');
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
      }, 250); // Scan more frequently (every 250ms instead of 500ms)
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
        <div className="relative w-full h-full">
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
          
          {/* Scanner overlay with feedback */}
          {isStreaming && (
            <div 
              ref={scannerBoxRef}
              className={`absolute inset-0 pointer-events-none`}
            >
              {/* Scanner guides */}
              <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-primary"></div>
              <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-primary"></div>
              
              {/* Scanner animation line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-80 animate-scanner-line"></div>
              
              {/* Feedback text */}
              {scanningFeedback && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <div className="bg-black/60 text-white text-sm py-1 px-2 rounded-full inline-block">
                    {scanningFeedback}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!isStreaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-gray-500">Initializing camera...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-400 flex flex-col items-center gap-2 p-8 w-full h-full">
          <p>Camera access required to scan QR code</p>
        </div>
      )}
    </div>
  );
};

export default QrCodeCameraScanner;
