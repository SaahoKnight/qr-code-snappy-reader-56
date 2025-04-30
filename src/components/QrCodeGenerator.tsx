
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const { toast } = useToast();

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
        description: 'Your QR code has been downloaded successfully.',
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
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {text ? (
          <QRCodeCanvas
            value={text}
            size={size}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={true}
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
