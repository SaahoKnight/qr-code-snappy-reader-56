
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown, Clipboard, Image, FileText, FileImage, FileCode } from 'lucide-react';
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
  const [borderSize, setBorderSize] = useState(0);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const MAX_CHARS = 2048; // QR code text capacity limit

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setText(text.substring(0, MAX_CHARS)); // Limit to MAX_CHARS
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit input to MAX_CHARS
    setText(e.target.value.substring(0, MAX_CHARS));
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
    const finalSize = size + (borderSize * 2);
    finalCanvas.width = finalSize;
    finalCanvas.height = finalSize;
    
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;
    
    // Fill with background color (for border)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, finalSize, finalSize);
    
    // Draw QR code in the center
    ctx.drawImage(
      qrCanvas, 
      borderSize, borderSize, size, size
    );
    
    // Handle download based on format
    let url, filename;
    
    if (downloadFormat === 'svg') {
      // Create SVG
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('width', finalSize.toString());
      svgEl.setAttribute('height', finalSize.toString());
      svgEl.setAttribute('viewBox', `0 0 ${finalSize} ${finalSize}`);
      
      // Add background rect for the border
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', finalSize.toString());
      bgRect.setAttribute('height', finalSize.toString());
      bgRect.setAttribute('fill', bgColor);
      svgEl.appendChild(bgRect);
      
      // Add QR code as image centered within border
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('x', borderSize.toString());
      img.setAttribute('y', borderSize.toString());
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
      // For JPG, use the canvas we already created
      // JPG doesn't support transparency, so we need to ensure the background is filled
      url = finalCanvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
      filename = `qrcode-${new Date().getTime()}.jpg`;
    } else if (downloadFormat === 'pdf') {
      // Generate PDF directly
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
        const yPos = 40; // Some margin from the top
        
        // Add the QR code image
        pdf.addImage(imgData, 'PNG', xPos, yPos, qrSizeInPdf, qrSizeInPdf);
        
        // Add text content below the QR code
        pdf.setFontSize(12);
        
        // Add title
        pdf.setFont(undefined, 'bold');
        pdf.text('QR Code Content:', xPos, yPos + qrSizeInPdf + 15);
        
        // Add the actual text content with word wrapping
        pdf.setFont(undefined, 'normal');
        const splitText = pdf.splitTextToSize(text, pageWidth - 40);
        pdf.text(splitText, xPos, yPos + qrSizeInPdf + 25);
        
        // Save the PDF
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

  // Update the container style to properly show the border as padding
  const qrContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
    aspectRatio: '1 / 1',
  };

  // Create a separate style for the QR code wrapper with the border
  const qrWrapperStyle = {
    padding: `${borderSize}px`,
    backgroundColor: bgColor,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center'
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

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-md mx-auto">
      {/* QR Code at the top */}
      <div style={qrContainerStyle} ref={qrRef}>
        <div style={qrWrapperStyle}>
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
            <div className="flex items-center justify-center bg-gray-100" style={{ width: size, height: size }}>
              <p className="text-sm text-gray-400">Enter text to generate QR</p>
            </div>
          )}
        </div>
      </div>

      {/* Input field with paste button */}
      <div className="w-full space-y-2">
        <Label htmlFor="qr-text">Enter text or URL</Label>
        <div className="relative">
          <Textarea
            id="qr-text"
            ref={inputRef}
            placeholder="Enter text or paste URL"
            value={text}
            onChange={handleTextChange}
            className="w-full pr-10 resize-none"
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
        <div className="text-xs text-muted-foreground text-right">
          {text.length} / {MAX_CHARS} characters
        </div>
      </div>
      
      {/* Customization Options - without Card border */}
      <div className="w-full space-y-6">
        {/* Colors Selection - responsive layout */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
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
      </div>

      {/* Download Button with Format Selection */}
      <div className="w-full flex justify-center">
        <DropdownMenu>
          <div className="flex">
            <Button 
              onClick={handleDownload} 
              className="flex-1 flex items-center justify-center gap-2 rounded-r-none"
              disabled={!text}
            >
              <Download size={18} />
              Download
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
              <Image size={16} className="mr-2" />
              JPG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDownloadFormat('svg')}>
              <Code size={16} className="mr-2" />
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
  );
};

export default QrCodeGenerator;
