
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown, Clipboard, Palette, FileJpg, FilePdf, FileImage } from 'lucide-react';
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
  const qrRef = useRef<HTMLDivElement>(null);
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

    if (!qrRef.current) return;

    // Get the QR code canvas element
    const qrCanvas = qrRef.current.querySelector('canvas');
    if (!qrCanvas) return;

    // Create a new canvas with border if needed
    const finalCanvas = document.createElement('canvas');
    const fullWidth = size + (borderSize * 2);
    const fullHeight = size + (borderSize * 2);
    finalCanvas.width = fullWidth;
    finalCanvas.height = fullHeight;
    
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;
    
    // Fill with background color (for border)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, fullWidth, fullHeight);
    
    // Draw QR code in the center
    ctx.drawImage(qrCanvas, borderSize, borderSize);
    
    // Handle download based on format
    let url, filename;
    
    if (downloadFormat === 'svg') {
      // Create SVG
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
      img.setAttribute('width', size.toString());
      img.setAttribute('height', size.toString());
      img.setAttribute('href', qrCanvas.toDataURL('image/png'));
      svgEl.appendChild(img);
      
      // Convert SVG to data URL
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
      url = URL.createObjectURL(svgBlob);
      filename = `qrcode-${new Date().getTime()}.svg`;
    } else if (downloadFormat === 'jpg') {
      // For JPG, use the canvas we already created
      // JPG doesn't support transparency, so we need to ensure the background is filled
      url = finalCanvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
      filename = `qrcode-${new Date().getTime()}.jpg`;
    } else if (downloadFormat === 'pdf') {
      // For PDF, we'll use a different approach
      // Create a temporary iframe to generate PDF
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-1000px';
      printFrame.style.left = '-1000px';
      document.body.appendChild(printFrame);
      
      // Create content for the PDF
      const pdfContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code</title>
            <style>
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .qr-container {
                text-align: center;
              }
              .qr-value {
                margin-top: 20px;
                font-family: Arial, sans-serif;
                word-break: break-all;
                max-width: 400px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${finalCanvas.toDataURL()}" width="${fullWidth}" height="${fullHeight}" />
              <p class="qr-value">${text}</p>
            </div>
          </body>
        </html>
      `;
      
      printFrame.onload = () => {
        try {
          // Access the iframe document
          const doc = printFrame.contentDocument;
          if (doc) {
            // Open the print dialog
            const win = printFrame.contentWindow;
            if (win) {
              win.focus();
              win.print();
              
              // Inform the user
              toast({
                title: 'PDF Download',
                description: 'Save as PDF in the print dialog that opens.'
              });
            }
          }
          
          // Cleanup after a delay to ensure the print dialog has time to open
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 2000);
        } catch (error) {
          console.error('Error creating PDF:', error);
          toast({
            title: 'Error',
            description: 'Could not create PDF. Please try another format.',
            variant: 'destructive'
          });
        }
      };
      
      // Write content to iframe
      const doc = printFrame.contentDocument;
      if (doc) {
        doc.open();
        doc.write(pdfContent);
        doc.close();
      }
      
      // Return early as we're handling the download differently
      return;
    } else {
      // Default PNG format
      url = finalCanvas.toDataURL('image/png');
      filename = `qrcode-${new Date().getTime()}.png`;
    }
    
    // Download the image (for non-PDF formats)
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

  // Helper to get the appropriate icon for the selected format
  const getFormatIcon = () => {
    switch (downloadFormat) {
      case 'jpg':
        return <FileJpg size={16} />;
      case 'pdf':
        return <FilePdf size={16} />;
      case 'svg':
        return <FileImage size={16} />;
      default:
        return <FileImage size={16} />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-md mx-auto">
      {/* QR Code at the top */}
      <div className="w-full flex justify-center">
        <div style={qrContainerStyle} ref={qrRef}>
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
                <span className="mr-1 flex items-center gap-1">
                  {getFormatIcon()}
                  {downloadFormat.toUpperCase()}
                </span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDownloadFormat('png')}>
              <FileImage size={16} className="mr-2" />
              PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDownloadFormat('jpg')}>
              <FileJpg size={16} className="mr-2" />
              JPG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDownloadFormat('svg')}>
              <FileImage size={16} className="mr-2" />
              SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDownloadFormat('pdf')}>
              <FilePdf size={16} className="mr-2" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default QrCodeGenerator;
