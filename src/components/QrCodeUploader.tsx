
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { processQrFromImage } from '@/utils/qrCodeUtils';

interface QrCodeUploaderProps {
  onScan: (result: string) => void;
}

const QrCodeUploader: React.FC<QrCodeUploaderProps> = ({ onScan }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const processFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Read the image
    const img = new Image();
    
    img.onload = () => {
      processQrFromImage(
        img,
        (result) => {
          onScan(result);
          toast({
            title: 'QR Code Detected!',
            description: 'Successfully scanned the QR code.',
          });
          setIsProcessing(false);
        },
        (errorMessage) => {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
          setIsProcessing(false);
        }
      );
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
  }, [onScan, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('drag-active');
    }
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

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

  return (
    <div className="w-full space-y-4">
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
              <Image size={48} className="text-gray-400" />
              <div className="space-y-2 text-center p-4">
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
      </AspectRatio>

      <Button 
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center gap-2"
      >
        <Upload size={18} />
        Upload Image
      </Button>
    </div>
  );
};

export default QrCodeUploader;
