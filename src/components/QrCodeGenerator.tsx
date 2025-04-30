
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, Image, Gradient } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor, setGradientColor] = useState('#8B5CF6');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
        setShowImageOverlay(true);
      };
      reader.readAsDataURL(file);
      toast({
        title: 'Image Added',
        description: 'Your image has been added to the QR code.'
      });
    }
  };

  const handleDownload = () => {
    if (!text) {
      toast({
        title: 'No content to generate',
        description: 'Please enter some text to generate a QR code',
        variant: 'destructive',
      });
      return;
    }

    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${new Date().getTime()}.png`;
      link.href = url;
      link.click();

      toast({
        title: 'QR Code Downloaded!',
        description: 'Your QR code has been downloaded successfully.'
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-md mx-auto">
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-text">Enter text or URL</Label>
          <Input
            id="qr-text"
            type="text"
            placeholder="Enter text or paste URL"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="qr-size">Size: {size}px</Label>
          </div>
          <Slider
            id="qr-size"
            value={[size]}
            min={100}
            max={300}
            step={10}
            onValueChange={(value) => setSize(value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image size={18} />
              <Label htmlFor="image-overlay">Center Image</Label>
            </div>
            <Switch
              id="image-overlay"
              checked={showImageOverlay}
              onCheckedChange={setShowImageOverlay}
            />
          </div>
          {showImageOverlay && (
            <div className="mt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? 'Change Image' : 'Upload Image'}
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gradient size={18} />
              <Label htmlFor="gradient">Use Gradient</Label>
            </div>
            <Switch
              id="gradient"
              checked={useGradient}
              onCheckedChange={setUseGradient}
            />
          </div>
          {useGradient && (
            <div className="flex items-center gap-3 mt-2">
              <input
                type="color"
                value={gradientColor}
                onChange={(e) => setGradientColor(e.target.value)}
                className="w-10 h-10 border-0 p-0 rounded-md cursor-pointer"
              />
              <div className="text-sm text-muted-foreground">
                Select gradient color
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {text ? (
          <QRCodeCanvas
            value={text}
            size={size}
            bgColor="#ffffff"
            fgColor={useGradient ? gradientColor : "#000000"}
            level="H"
            includeMargin={true}
            imageSettings={
              showImageOverlay && imageUrl ? {
                src: imageUrl,
                excavate: true,
                width: size * 0.25,
                height: size * 0.25,
              } : undefined
            }
          />
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100" 
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            <p className="text-sm text-gray-400">Enter text to generate QR</p>
          </div>
        )}
      </div>

      <Button 
        onClick={handleDownload} 
        className="w-full flex items-center gap-2"
        disabled={!text}
      >
        <Download size={18} />
        Download QR Code
      </Button>
    </div>
  );
};

export default QrCodeGenerator;
