
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown, Clipboard, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [borderSize, setBorderSize] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
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

    // Create a temporary container to hold our QR code with border
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'inline-block';
    tempContainer.style.backgroundColor = bgColor;
    tempContainer.style.padding = `${borderSize}px`;
    document.body.appendChild(tempContainer);
    
    // Create a temporary canvas for the QR code
    const tempCanvas = document.createElement('canvas');
    const qrSize = size;
    tempCanvas.width = qrSize;
    tempCanvas.height = qrSize;
    tempContainer.appendChild(tempCanvas);
    
    // Render QR code to the temporary canvas
    const qr = new QRCodeCanvas({
      value: text,
      size: qrSize,
      bgColor: bgColor,
      fgColor: fgColor,
      level: 'H',
      includeMargin: false,
    });
    
    // Get the canvas context and draw QR code
    const tempCanvasContext = tempCanvas.getContext('2d');
    if (tempCanvasContext) {
      const qrCanvas = qr.getCanvas();
      tempCanvasContext.drawImage(qrCanvas, 0, 0, qrSize, qrSize);
    }
    
    // Calculate full size with border
    const fullWidth = qrSize + (borderSize * 2);
    const fullHeight = qrSize + (borderSize * 2);
    
    let url, filename, mimeType;
    
    if (downloadFormat === 'svg') {
      // For SVG we create an SVG element with border
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('width', fullWidth.toString());
      svgEl.setAttribute('height', fullHeight.toString());
      svgEl.setAttribute('viewBox', `0 0 ${fullWidth} ${fullHeight}`);
      
      // Add background rect for the border
      if (borderSize > 0) {
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', fullWidth.toString());
        bgRect.setAttribute('height', fullHeight.toString());
        bgRect.setAttribute('fill', bgColor);
        svgEl.appendChild(bgRect);
      }
      
      // Add QR code as image centered within border
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('x', borderSize.toString());
      img.setAttribute('y', borderSize.toString());
      img.setAttribute('width', qrSize.toString());
      img.setAttribute('height', qrSize.toString());
      img.setAttribute('href', tempCanvas.toDataURL('image/png'));
      svgEl.appendChild(img);
      
      // Convert SVG to data URL
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
      url = URL.createObjectURL(svgBlob);
      filename = `qrcode-${new Date().getTime()}.svg`;
      mimeType = 'image/svg+xml';
    } else {
      // For PNG, create a new canvas with the border
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = fullWidth;
      finalCanvas.height = fullHeight;
      const ctx = finalCanvas.getContext('2d');
      
      if (ctx) {
        // Fill with background color (for border)
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, fullWidth, fullHeight);
        
        // Draw QR code in the center
        ctx.drawImage(tempCanvas, borderSize, borderSize);
        
        // Convert to data URL
        url = finalCanvas.toDataURL('image/png');
        filename = `qrcode-${new Date().getTime()}.png`;
        mimeType = 'image/png';
      }
    }
    
    // Clean up temporary elements
    document.body.removeChild(tempContainer);
    
    // Download the image
    if (url) {
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

  // CSS for square aspect ratio container
  const qrContainerStyle = {
    aspectRatio: '1 / 1',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: `${borderSize}px`,
    backgroundColor: borderSize > 0 ? bgColor : 'transparent'
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-md mx-auto">
      {/* QR Code at the top */}
      <div className="w-full flex justify-center">
        <div style={qrContainerStyle}>
          {text ? (
            <QRCodeCanvas
              value={text}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              includeMargin={false}
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-100 w-full h-full">
              <p className="text-sm text-gray-400">Enter text to generate QR</p>
            </div>
          )}
        </div>
      </div>

      {/* Input field with paste button */}
      <div className="w-full space-y-2">
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
      
      {/* Customize Collapsible */}
      <Collapsible 
        open={isCustomizeOpen} 
        onOpenChange={setIsCustomizeOpen}
        className="w-full border rounded-md overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center justify-between w-full rounded-b-none border-b-0"
          >
            <div className="flex items-center gap-2">
              <Palette size={18} />
              <span>Customize</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${isCustomizeOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 border-t bg-background">
          <Card className="p-4 space-y-6">
            {/* Colors Selection */}
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
            
            {/* Size Slider */}
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

            {/* Border Slider */}
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
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Download Button with Format Selection */}
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
