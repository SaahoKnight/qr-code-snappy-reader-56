
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown, Clipboard } from 'lucide-react';
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
  const [borderSize, setBorderSize] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setText(text);
      toast({
        title: 'Content Pasted',
        description: 'Text has been pasted from clipboard',
      });
    } catch (error) {
      toast({
        title: 'Paste Failed',
        description: 'Unable to access clipboard content',
        variant: 'destructive',
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
      {/* QR Code at the top */}
      <div className="w-full">
        {text ? (
          <div 
            className="w-full flex justify-center" 
            style={{ 
              padding: `${borderSize}px`,
              backgroundColor: borderSize > 0 ? bgColor : 'transparent' 
            }}
          >
            <QRCodeCanvas
              value={text}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              includeMargin={false}
            />
          </div>
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100" 
            style={{ 
              width: `${size}px`, 
              height: `${size}px`,
              margin: '0 auto'
            }}
          >
            <p className="text-sm text-gray-400">Enter text to generate QR</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-text">Enter text or URL</Label>
          <div className="relative">
            <Input
              id="qr-text"
              ref={inputRef}
              type="text"
              placeholder="Enter text or paste URL"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={handlePasteFromClipboard}
              title="Paste from clipboard"
            >
              <Clipboard size={18} />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
                title="Select background color"
              />
              <Input 
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Foreground Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
                title="Select foreground color"
              />
              <Input 
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
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
          <div className="flex justify-between">
            <Label htmlFor="qr-border">Border: {borderSize}px</Label>
          </div>
          <Slider
            id="qr-border"
            value={[borderSize]}
            min={0}
            max={50}
            step={1}
            onValueChange={(value) => setBorderSize(value[0])}
          />
        </div>
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
