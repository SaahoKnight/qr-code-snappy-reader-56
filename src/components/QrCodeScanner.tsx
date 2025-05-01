
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { Upload, Image, Copy, ExternalLink, Camera } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import QrCodeCameraScanner from './QrCodeCameraScanner';

const QrCodeScanner = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const { toast } = useToast();
  
  const isURL = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const processImage = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    
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
      
      // Use jsQR to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        setResult(code.data);
        toast({
          title: 'QR Code Detected!',
          description: 'Successfully scanned the QR code.',
        });
      } else {
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
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={18} />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera size={18} />
            <span>Camera</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0">
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="drop-zone border-gray-300 w-full cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="relative w-full">
                <img 
                  src={previewUrl} 
                  alt="QR preview" 
                  className="w-full h-auto max-h-64 object-contain rounded-md mx-auto"
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Image size={48} className="text-gray-400" />
                <div className="space-y-2">
                  <div className="font-medium">Drag & Drop or Click to Upload</div>
                  <p className="text-sm text-muted-foreground">Upload an image containing a QR code</p>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 mt-4"
          >
            <Upload size={18} />
            Upload Image
          </Button>
        </TabsContent>

        <TabsContent value="camera" className="mt-0">
          <QrCodeCameraScanner onScan={handleCameraScan} />
        </TabsContent>
      </Tabs>

      {result && (
        <div className="w-full mt-2 space-y-4">
          <div className="rounded-lg border p-4 relative group">
            <p className="text-sm font-medium mb-1">Scanned Content:</p>
            <div className="bg-muted rounded p-3 pr-10 break-all">
              {result}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-6 right-2"
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
