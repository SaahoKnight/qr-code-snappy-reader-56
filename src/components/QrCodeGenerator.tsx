
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown, Clipboard, Image, FileText, FileImage, FileCode, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from 'jspdf';
import { useIsMobile } from '@/hooks/use-mobile';
import { Textarea } from '@/components/ui/textarea';

const QrCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [borderSize, setBorderSize] = useState(10);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [isTextTooLong, setIsTextTooLong] = useState(false);
  const [qrError, setQrError] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const MAX_CHARS = 2048; // QR code text capacity limit

  // Reset error state when text changes
  const resetErrorState = () => {
    setQrError(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const truncatedText = text.substring(0, MAX_CHARS);
      setText(truncatedText);
      setIsTextTooLong(text.length > MAX_CHARS);
      resetErrorState();
      
      if (text.length > MAX_CHARS) {
        toast({
          title: 'Text truncated',
          description: `Text was too long and has been truncated to ${MAX_CHARS} characters`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Content Pasted',
          description: 'Text has been pasted from clipboard',
        });
      }
    } catch (error) {
      toast({
        title: 'Paste Failed',
        description: 'Unable to access clipboard content',
        variant: 'destructive',
      });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resetErrorState();
    
    // Limit input to MAX_CHARS
    const newText = e.target.value.substring(0, MAX_CHARS);
    setText(newText);
    setIsTextTooLong(e.target.value.length > MAX_CHARS);
    
    if (e.target.value.length > MAX_CHARS) {
      toast({
        title: 'Character limit reached',
        description: `Text has been truncated to ${MAX_CHARS} characters`,
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

    if (isTextTooLong || qrError) {
      toast({
        title: 'Cannot generate QR code',
        description: 'The text is too complex for a QR code. Please reduce text length or complexity.',
        variant: 'destructive',
      });
      return;
    }

    if (!qrRef.current) return;

    // Get the QR code canvas element
    const qrCanvas = qrRef.current.querySelector('canvas');
    if (!qrCanvas) return;

    // Create a new canvas without border
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = size;
    finalCanvas.height = size;
    
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;
    
    // Fill with background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw QR code in the center
    ctx.drawImage(
      qrCanvas, 
      0, 0, size, size
    );
    
    // Handle download based on format
    let url, filename;
    
    if (downloadFormat === 'svg') {
      // Create SVG
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('width', size.toString());
      svgEl.setAttribute('height', size.toString());
      svgEl.setAttribute('viewBox', `0 0 ${size} ${size}`);
      
      // Add background rect
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', size.toString());
      bgRect.setAttribute('height', size.toString());
      bgRect.setAttribute('fill', bgColor);
      svgEl.appendChild(bgRect);
      
      // Add QR code as image
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('x', '0');
      img.setAttribute('y', '0');
      img.setAttribute('width', size.toString());
      img.setAttribute('height', size.toString());
      
      // Make sure we get the full QR code
      const dataUrl = qrCanvas.toDataURL('image/png');
      img.setAttribute('href', dataUrl);
      svgEl.appendChild(img);
      
      // Convert SVG to data URL
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
      url = URL.createObjectURL(svgBlob);
      filename = `qrcode-${new Date().getTime()}.svg`;
    } else if (downloadFormat === 'jpg') {
      url = finalCanvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
      filename = `qrcode-${new Date().getTime()}.jpg`;
    } else if (downloadFormat === 'pdf') {
      // Generate PDF directly - modified to only include the QR code
      try {
        // Create new PDF document
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // A4 size is 210x297mm
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Convert canvas to data URL
        const imgData = finalCanvas.toDataURL('image/png');
        
        // Calculate QR code size for PDF (max 70% of page width)
        const qrSizeInPdf = Math.min(pageWidth * 0.7, 150);
        
        // Center QR on page
        const xPos = (pageWidth - qrSizeInPdf) / 2;
        const yPos = (pageHeight - qrSizeInPdf) / 2; // Center vertically as well
        
        // Add the QR code image
        pdf.addImage(imgData, 'PNG', xPos, yPos, qrSizeInPdf, qrSizeInPdf);
        
        // Save the PDF - no text content added
        pdf.save(`qrcode-${new Date().getTime()}.pdf`);
        
        toast({
          title: 'QR Code Downloaded!',
          description: 'Your QR code has been downloaded as PDF.'
        });
      } catch (error) {
        console.error('Error creating PDF:', error);
        toast({
          title: 'Error',
          description: 'Could not create PDF. Please try another format.',
          variant: 'destructive'
        });
      }
      
      // Return early as we've handled the PDF generation
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

  // Helper to get the appropriate icon for the selected format
  const getFormatIcon = () => {
    switch (downloadFormat) {
      case 'jpg':
        return <Image size={16} />;
      case 'pdf':
        return <FileText size={16} />;
      case 'svg':
        return <FileCode size={16} />;
      default:
        return <FileImage size={16} />;
    }
  };

  // Enhanced renderQrCode function to catch errors
  const renderQrCode = () => {
    if (!text) {
      return (
        <div className="flex items-center justify-center bg-gray-100" style={{ width: size, height: size }}>
          <p className="text-sm text-gray-400">Enter text to generate QR</p>
        </div>
      );
    }
    
    if (isTextTooLong) {
      return (
        <div className="flex items-center justify-center bg-gray-100" style={{ width: size, height: size }}>
          <p className="text-sm text-gray-400 text-center px-4">Text too long for QR code.<br/>Reduce to {MAX_CHARS} characters.</p>
        </div>
      );
    }
    
    try {
      return (
        <QRCodeCanvas
          value={text}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="L" // Lower error correction level for better capacity
          includeMargin={false}
          onError={() => {
            setQrError(true);
            console.error("QR Code generation error");
          }}
        />
      );
    } catch (error) {
      console.error("QR Code generation error:", error);
      setQrError(true);
      return (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-4" style={{ width: size, height: size }}>
          <AlertTriangle className="text-red-500 mb-2" size={32} />
          <p className="text-sm text-gray-700 text-center">
            Cannot generate QR code.<br/>Text is too complex.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="w-full mx-auto">
      {/* Responsive layout container */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column (QR code and download button) */}
        <div className="flex flex-col items-center gap-6 lg:w-2/5">
          {/* QR Code */}
          <div 
            className="flex justify-center items-center bg-white w-full max-w-[300px] aspect-square" 
            ref={qrRef}
          >
            {renderQrCode()}
          </div>

          {/* Download Button with Format Selection */}
          <div className="w-full max-w-[300px]">
            <DropdownMenu>
              <div className="flex">
                <Button 
                  onClick={handleDownload} 
                  className="flex-1 flex items-center justify-center gap-2 rounded-r-none"
                  disabled={!text || isTextTooLong || qrError}
                >
                  <Download size={18} />
                  Download
                </Button>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="px-2 rounded-l-none border-l-[1px] border-l-primary-foreground/20"
                    variant="default"
                    disabled={!text || isTextTooLong || qrError}
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
                  <Image size={16} className="mr-2" />
                  JPG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDownloadFormat('svg')}>
                  <FileCode size={16} className="mr-2" />
                  SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDownloadFormat('pdf')}>
                  <FileText size={16} className="mr-2" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right column (form controls) */}
        <div className="flex flex-col gap-6 lg:w-3/5">
          {/* Input field with paste button */}
          <div className="space-y-2">
            <Label htmlFor="qr-text">Enter text or URL</Label>
            <div className="relative">
              <Textarea
                id="qr-text"
                ref={inputRef}
                placeholder="Enter text or paste URL"
                value={text}
                onChange={handleTextChange}
                className={`w-full pr-10 resize-none ${isTextTooLong || qrError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                rows={3}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handlePasteFromClipboard}
                title="Paste from clipboard"
              >
                <Clipboard size={18} />
              </Button>
            </div>
            <div className={`text-xs ${isTextTooLong || qrError ? 'text-red-500 font-medium' : 'text-muted-foreground'} text-right`}>
              {text.length} / {MAX_CHARS} characters
              {isTextTooLong && ' (text too long)'}
              {qrError && !isTextTooLong && ' (content too complex for QR code)'}
            </div>
          </div>
          
          {/* Colors Selection - responsive layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border border-gray-300"
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
                  className="w-12 h-12 rounded cursor-pointer border border-gray-300"
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
          
          {/* Size and Border Sliders */}
          <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default QrCodeGenerator;
