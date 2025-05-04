import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { Download, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QrCodeCameraScannerProps {
  onScan: (result: string) => void;
  isActive: boolean;
}

const QrCodeCameraScanner = ({ onScan, isActive }: QrCodeCameraScannerProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState('png');
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

  const handleDownloadImage = async () => {
    if (!capturedImage) return;

    // Function to convert the image to the requested format
    let filename = `qrcode-scan-${new Date().getTime()}`;
    let downloadUrl = capturedImage;
    
    // Create a temporary canvas to handle format conversions
    const img = new Image();
    img.src = capturedImage;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast({
        title: 'Error',
        description: 'Failed to process image for download',
        variant: 'destructive',
      });
      return;
    }
    
    // Draw image on canvas
    ctx.drawImage(img, 0, 0);
    
    // Process based on format
    switch (downloadFormat) {
      case 'png':
        downloadUrl = canvas.toDataURL('image/png');
        filename += '.png';
        break;
        
      case 'jpg':
      case 'jpeg':
        downloadUrl = canvas.toDataURL('image/jpeg', 0.9);  // 0.9 quality
        filename += '.jpg';
        break;
        
      case 'pdf':
        // For PDF we'll need to use a library or the browser's print functionality
        try {
          // Simple implementation using window.print()
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            throw new Error('Could not open print window');
          }
          
          printWindow.document.write(`
            <html>
              <head>
                <title>QR Code Scan</title>
                <style>
                  body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                  }
                  img {
                    max-width: 100%;
                    max-height: 100vh;
                  }
                </style>
              </head>
              <body>
                <img src="${capturedImage}" alt="QR Code Scan" />
                <script>
                  window.onload = function() { 
                    setTimeout(function() { 
                      window.print(); 
                      window.close(); 
                    }, 500);
                  };
                </script>
              </body>
            </html>
          `);
          
          toast({
            title: 'PDF Preparation',
            description: 'Your PDF is being prepared for printing/saving',
          });
          
          return; // Exit early as the PDF is handled differently
        } catch (err) {
          console.error('PDF generation error:', err);
          toast({
            title: 'PDF Generation Failed',
            description: 'Could not generate PDF. Try another format.',
            variant: 'destructive',
          });
          return;
        }
    }

    // Download the file
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Image Downloaded',
      description: `QR code scan image has been downloaded as ${downloadFormat.toUpperCase()}.`,
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
          
          {/* Bottom-start: Download button with format options */}
          <DropdownMenu>
            <div className="absolute bottom-2 left-2">
              <Button 
                variant="secondary"
                size="sm"
                className="shadow-sm"
                onClick={handleDownloadImage}
                title="Download image"
              >
                <Download size={18} className="mr-1" />
                {downloadFormat.toUpperCase()}
              </Button>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="ml-1 px-1 shadow-sm"
                >
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setDownloadFormat('png')}>
                PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDownloadFormat('jpg')}>
                JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDownloadFormat('pdf')}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
