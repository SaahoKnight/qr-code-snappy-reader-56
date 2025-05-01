
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, Square, Text, FileImage, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [customSize, setCustomSize] = useState(200);
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [customLabel, setCustomLabel] = useState('');
  const [useCustomSize, setUseCustomSize] = useState(false);
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
        
        // Add label if exists
        if (customLabel) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', (canvas.width / 2).toString());
          text.setAttribute('y', (canvas.height - 10).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-family', 'Arial');
          text.setAttribute('font-size', '14');
          text.setAttribute('fill', '#000000');
          text.textContent = customLabel;
          svgEl.appendChild(text);
        }
        
        // Convert SVG to data URL
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svgEl);
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
        url = URL.createObjectURL(svgBlob);
        filename = `qrcode-${new Date().getTime()}.svg`;
        mimeType = 'image/svg+xml';
      } else {
        // For PNG, draw directly on canvas
        const newCanvas = document.createElement('canvas');
        const actualSize = useCustomSize ? customSize : size;
        newCanvas.width = actualSize;
        newCanvas.height = actualSize + (customLabel ? 30 : 0);
        
        const ctx = newCanvas.getContext('2d');
        if (ctx) {
          // Draw QR code
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
          ctx.drawImage(canvas, 0, 0, actualSize, actualSize);
          
          // Draw label if exists
          if (customLabel) {
            ctx.font = '14px Arial';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText(customLabel, actualSize / 2, actualSize + 20);
          }
        }
        
        url = newCanvas.toDataURL('image/png');
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

  const actualSize = useCustomSize ? customSize : size;

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
            <Label htmlFor="qr-size">Size: {actualSize}px</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-size" className="text-sm">Custom</Label>
              <input 
                type="checkbox" 
                id="custom-size" 
                checked={useCustomSize}
                onChange={() => setUseCustomSize(!useCustomSize)}
              />
            </div>
          </div>
          
          {useCustomSize ? (
            <div className="flex items-center gap-2">
              <Square size={18} className="text-gray-500" />
              <Input
                id="custom-size-input"
                type="number"
                min="100"
                max="1000"
                value={customSize}
                onChange={(e) => setCustomSize(parseInt(e.target.value) || 200)}
                className="w-full"
              />
            </div>
          ) : (
            <Slider
              id="qr-size"
              value={[size]}
              min={100}
              max={300}
              step={10}
              onValueChange={(value) => setSize(value[0])}
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="qr-label">Custom Label (optional)</Label>
          <div className="flex items-center gap-2">
            <Text size={18} className="text-gray-500" />
            <Input
              id="qr-label"
              type="text"
              placeholder="Add a label below the QR code"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="download-format">Download Format</Label>
          <Select value={downloadFormat} onValueChange={setDownloadFormat}>
            <SelectTrigger id="download-format" className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png" className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <FileImage size={16} /> PNG
                </div>
              </SelectItem>
              <SelectItem value="svg" className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <FileCode size={16} /> SVG
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {text ? (
          <div className="flex flex-col items-center gap-2">
            <QRCodeCanvas
              value={text}
              size={actualSize}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
            {customLabel && (
              <p className="text-sm font-medium mt-1">{customLabel}</p>
            )}
          </div>
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100" 
            style={{ width: `${actualSize}px`, height: `${actualSize}px` }}
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
        Download QR Code ({downloadFormat.toUpperCase()})
      </Button>
    </div>
  );
};

export default QrCodeGenerator;
