
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [downloadFormat, setDownloadFormat] = useState('png');
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
      let url, filename, mimeType;
      
      if (downloadFormat === 'svg') {
        // For SVG we need to create an SVG element
        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.setAttribute('width', canvas.width.toString());
        svgEl.setAttribute('height', canvas.height.toString());
        
        // Create an image element to hold the canvas content
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('width', canvas.width.toString());
        img.setAttribute('height', canvas.height.toString());
        img.setAttribute('href', canvas.toDataURL('image/png'));
        svgEl.appendChild(img);
        
        // Convert SVG to data URL
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svgEl);
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
        url = URL.createObjectURL(svgBlob);
        filename = `qrcode-${new Date().getTime()}.svg`;
        mimeType = 'image/svg+xml';
      } else {
        // For PNG, draw directly on canvas
        url = canvas.toDataURL('image/png');
        filename = `qrcode-${new Date().getTime()}.png`;
        mimeType = 'image/png';
      }
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();

      toast({
        title: 'QR Code Downloaded!',
        description: `Your QR code has been downloaded as ${downloadFormat.toUpperCase()}.`
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
            level="H"
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

      <div className="w-full flex">
        <DropdownMenu>
          <div className="flex w-full">
            <Button 
              onClick={handleDownload} 
              className="flex-1 flex items-center justify-center gap-2 rounded-r-none"
              disabled={!text}
            >
              <Download size={18} />
              Download QR Code
            </Button>
            <DropdownMenuTrigger asChild>
              <Button 
                className="px-2 rounded-l-none border-l-[1px] border-l-primary-foreground/20"
                variant="default"
                disabled={!text}
              >
                <span className="mr-1">{downloadFormat.toUpperCase()}</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDownloadFormat('png')}>
              PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDownloadFormat('svg')}>
              SVG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default QrCodeGenerator;
