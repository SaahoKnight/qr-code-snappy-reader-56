
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { Upload, Image, Copy, ExternalLink, Camera, File } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import QrCodeCameraScanner from './QrCodeCameraScanner';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const QrCodeScanner = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('camera');
  const { toast } = useToast();
  
  const isURL = (text: string): boolean => {
    try {
      // Fix: Pass a string to the URL constructor
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  // Process image data to detect QR code - shared between PDF, SVG and images
  const processImageData = (imageData: ImageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      setResult(code.data);
      toast({
        title: 'QR Code Detected!',
        description: 'Successfully scanned the QR code.',
      });
      return true;
    }
    
    return false;
  };

  const handleSVG = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const svgContent = e.target?.result as string;
      
      // Create an SVG element
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // Create an image to render the SVG
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setIsProcessing(false);
          toast({
            title: 'Error',
            description: 'Could not process SVG.',
            variant: 'destructive',
          });
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (!processImageData(imageData)) {
          toast({
            title: 'No QR Code Found',
            description: 'Could not detect a QR code in this SVG.',
            variant: 'destructive',
          });
        }
        
        setIsProcessing(false);
      };
      
      // Convert SVG to data URL for the image
      const serializer = new XMLSerializer();
      const svgBlob = new Blob([serializer.serializeToString(svgElement)], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(svgBlob);
      setPreviewUrl(url);
      img.src = url;
    };
    
    reader.onerror = () => {
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: 'Could not read the SVG file.',
        variant: 'destructive',
      });
    };
    
    reader.readAsText(file);
  };

  const handlePDF = async (file: File) => {
    // We'll use the first page of the PDF only
    try {
      // Create an object URL for the PDF
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Create a hidden iframe to load the PDF
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Wait for the iframe to load the PDF
      iframe.onload = () => {
        // Wait a moment for PDF to render
        setTimeout(() => {
          try {
            // Get the iframe content window
            const iframeWindow = iframe.contentWindow;
            if (!iframeWindow) throw new Error("Couldn't access iframe window");
            
            // Create a canvas to draw the PDF
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) throw new Error("Couldn't get canvas context");
            
            // Set canvas dimensions
            canvas.width = 1000; // Default width for PDF rendering
            canvas.height = 1000; // Default height for PDF rendering
            
            // Fix: Use proper CanvasImageSource element for drawing
            // We can't draw the document.body directly, so let's attempt to render
            // the PDF content by getting an image from the iframe
            const pdfImage = new Image();
            pdfImage.onload = () => {
              // Draw the image to canvas
              ctx.drawImage(pdfImage, 0, 0, canvas.width, canvas.height);
              
              // Get image data from the canvas
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              
              // Process the image data
              if (!processImageData(imageData)) {
                toast({
                  title: 'No QR Code Found',
                  description: 'Could not detect a QR code in the first page of this PDF.',
                  variant: 'destructive',
                });
              }
              
              // Clean up
              document.body.removeChild(iframe);
              setIsProcessing(false);
            };
            
            // Attempt to convert iframe content to an image
            // Use a data URL of the content
            const iframeContent = iframeWindow.document.documentElement.outerHTML;
            const blob = new Blob([iframeContent], {type: 'text/html'});
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                pdfImage.src = reader.result.toString();
              } else {
                throw new Error("Couldn't read iframe content");
              }
            };
            reader.readAsDataURL(blob);
          } catch (error) {
            document.body.removeChild(iframe);
            setIsProcessing(false);
            toast({
              title: 'Error',
              description: 'Could not process the PDF file.',
              variant: 'destructive',
            });
            console.error('PDF processing error:', error);
          }
        }, 1000); // Give it some time to render
      };
      
      iframe.src = url;
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: 'Could not process the PDF file.',
        variant: 'destructive',
      });
      console.error('PDF processing error:', error);
    }
  };

  const processImage = useCallback((file: File) => {
    if (!file) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    
    // Handle different file types
    const fileType = file.type.toLowerCase();
    
    if (fileType === 'application/pdf') {
      handlePDF(file);
      return;
    } 
    
    if (fileType === 'image/svg+xml') {
      handleSVG(file);
      return;
    }
    
    if (!fileType.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image, PDF, or SVG file.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      return;
    }

    // Handle regular images (JPEG, PNG, etc.)
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Read the image
    const img = document.createElement('img');
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setIsProcessing(false);
        toast({
          title: 'Error',
          description: 'Could not process image.',
          variant: 'destructive',
        });
        return;
      }
      
      // Set canvas dimensions to image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image to the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data from the canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use the shared processing function
      if (!processImageData(imageData)) {
        toast({
          title: 'No QR Code Found',
          description: 'Could not detect a QR code in this image.',
          variant: 'destructive',
        });
      }
      
      setIsProcessing(false);
    };
    
    img.onerror = () => {
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: 'Could not load the image.',
        variant: 'destructive',
      });
    };
    
    img.src = url;
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-active');
    }
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  }, [processImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('drag-active');
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-active');
    }
  }, []);

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => {
        toast({
          title: 'Copied!',
          description: 'QR code content has been copied to clipboard.'
        });
      }, () => {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard.',
          variant: 'destructive',
        });
      });
    }
  };

  const openLink = () => {
    if (result && isURL(result)) {
      window.open(result, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCameraScan = (scannedResult: string) => {
    setResult(scannedResult);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md mx-auto">
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera size={18} />
            <span>Camera</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={18} />
            <span>Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-0">
          <AspectRatio ratio={1/1}>
            <QrCodeCameraScanner onScan={handleCameraScan} isActive={activeTab === 'camera'} />
          </AspectRatio>
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <AspectRatio ratio={1/1} className="bg-muted rounded-md overflow-hidden">
            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="drop-zone border-gray-300 w-full h-full cursor-pointer flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <img 
                    src={previewUrl} 
                    alt="QR preview" 
                    className="w-full h-full object-contain"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <File size={48} className="text-gray-400" />
                  <div className="space-y-2 text-center p-4">
                    <div className="font-medium">Drag & Drop or Click to Upload</div>
                    <p className="text-sm text-muted-foreground">
                      Upload an image, PDF, or SVG file containing a QR code
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.svg"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </AspectRatio>

          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 mt-4"
          >
            <Upload size={18} />
            Upload File
          </Button>
        </TabsContent>
      </Tabs>

      {result && (
        <div className="w-full mt-2 space-y-4">
          <div className="rounded-lg border p-4 relative">
            <p className="text-sm font-medium mb-1">Scanned Content:</p>
            <div className="bg-muted rounded p-3 pr-10 break-all relative">
              {result}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
          
          {isURL(result) && (
            <Button 
              className="w-full flex items-center gap-2"
              onClick={openLink}
            >
              <ExternalLink size={18} />
              Open URL
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QrCodeScanner;
