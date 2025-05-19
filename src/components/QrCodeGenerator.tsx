
import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, ChevronDown, Clipboard, Image, FileText, FileImage, FileCode, AlertTriangle, Palette, Square } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const QrCodeGenerator = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [borderSize, setBorderSize] = useState(10);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [downloadFormat, setDownloadFormat] = useState('png');
  const [isTextTooLong, setIsTextTooLong] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const MAX_CHARS = 2048; // QR code text capacity limit

  // Calculate scale factor based on viewport width
  useEffect(() => {
    const updateScaleFactor = () => {
      if (!qrContainerRef.current) return;
      
      // Calculate total desired size (QR size + padding on both sides)
      const totalDesiredWidth = size + (borderSize * 2);
      
      // Get available container width (with no safety margin)
      const containerWidth = qrContainerRef.current.clientWidth;
      
      if (totalDesiredWidth > containerWidth && containerWidth > 0) {
        // Need to scale down
        setScaleFactor(containerWidth / totalDesiredWidth);
      } else {
        // No scaling needed
        setScaleFactor(1);
      }
    };

    updateScaleFactor();
    
    // Add resize listener
    window.addEventListener('resize', updateScaleFactor);
    return () => window.removeEventListener('resize', updateScaleFactor);
  }, [size, borderSize]);

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

  const handleColorPaste = async (setter: (value: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      // Simple validation to check if pasted content is a valid hex color
      if (/^#([0-9A-F]{3}){1,2}$/i.test(text)) {
        setter(text);
        toast({
          title: 'Color Pasted',
          description: 'Color has been pasted from clipboard',
        });
      } else {
        toast({
          title: 'Invalid Color Format',
          description: 'Please paste a valid hex color (e.g., #RRGGBB)',
          variant: 'destructive',
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

  // Update the container style to properly show the border as padding without adding unnecessary borders
  const qrContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '300px',
    margin: '0 auto',
    aspectRatio: '1 / 1',
  };

  // Create a separate style for the QR code wrapper with the border and scaling
  const qrWrapperStyle = {
    padding: `${borderSize}px`,
    backgroundColor: bgColor,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: `scale(${scaleFactor})`,
    transformOrigin: 'center',
    transition: 'transform 0.2s ease',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 12px rgba(0, 0, 0, 0.08)', // Added shadow for lifted effect
    borderRadius: '8px', // Added rounded corners to enhance the lifted appearance
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
          level="L" // Changed from "H" to "L" for better capacity
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
    <div className="flex flex-col w-full">
      {/* QR Code Preview - render on top for mobile */}
      {isMobile && (
        <div className="mb-8 flex flex-col items-center w-full">
          <div style={qrContainerStyle} ref={qrContainerRef}>
            <div style={qrWrapperStyle} ref={qrRef}>
              {renderQrCode()}
            </div>
          </div>
          {scaleFactor < 1 && (
            <div className="text-xs text-muted-foreground mt-2">
              Scaled to {Math.round(scaleFactor * 100)}% to fit viewport
            </div>
          )}
          
          {/* Mobile-only controls buttons - changed from Sheet to Dialog */}
          <div className="flex justify-center gap-4 mt-4 w-full">
            {/* Color Selection Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Palette size={18} />
                  Colors
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Color Settings</DialogTitle>
                  <DialogDescription>
                    Customize the colors of your QR code
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="border border-input rounded overflow-hidden">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer"
                          title="Select background color"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <Input 
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => handleColorPaste(setBgColor)}
                          title="Paste color from clipboard"
                        >
                          <Clipboard size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Foreground Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="border border-input rounded overflow-hidden">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer"
                          title="Select foreground color"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <Input 
                          type="text"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => handleColorPaste(setFgColor)}
                          title="Paste color from clipboard"
                        >
                          <Clipboard size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <DialogClose asChild>
                    <Button className="w-full">Apply Colors</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Size Selection Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                  <Square size={18} />
                  Size
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Size Settings</DialogTitle>
                  <DialogDescription>
                    Adjust the size and padding of your QR code
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Size Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="mobile-qr-size">Size: {size}px</Label>
                    </div>
                    <Slider
                      id="mobile-qr-size"
                      value={[size]}
                      min={100}
                      max={300}
                      step={10}
                      onValueChange={(value) => setSize(value[0])}
                    />
                  </div>

                  {/* Padding Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="mobile-qr-border">Padding: {borderSize}px</Label>
                    </div>
                    <Slider
                      id="mobile-qr-border"
                      value={[borderSize]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(value) => setBorderSize(value[0])}
                    />
                  </div>

                  <DialogClose asChild>
                    <Button className="w-full">Apply Size</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Input field and customization options - first column */}
        <div className="w-full lg:w-1/2 space-y-6">
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
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
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
          
          {/* Customization Options - only show on desktop */}
          {!isMobile && (
            <div className="space-y-6">
              {/* Colors Selection - responsive layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="border border-input rounded overflow-hidden">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                        title="Select background color"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Input 
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => handleColorPaste(setBgColor)}
                        title="Paste color from clipboard"
                      >
                        <Clipboard size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Foreground Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="border border-input rounded overflow-hidden">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                        title="Select foreground color"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <Input 
                        type="text"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => handleColorPaste(setFgColor)}
                        title="Paste color from clipboard"
                      >
                        <Clipboard size={16} />
                      </Button>
                    </div>
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

              {/* Padding Slider (previously Border) */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="qr-border">Padding: {borderSize}px</Label>
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
          )}
        </div>

        {/* QR Code and download button - second column for desktop only */}
        <div className="flex flex-col items-center w-full lg:w-1/2 gap-6">
          {/* QR Code - Only show on desktop */}
          {!isMobile && (
            <div className="w-full" style={{maxWidth: '300px'}}>
              <div style={qrContainerStyle} ref={qrContainerRef}>
                <div style={qrWrapperStyle} ref={qrRef}>
                  {renderQrCode()}
                </div>
              </div>
              {scaleFactor < 1 && (
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Scaled to {Math.round(scaleFactor * 100)}% to fit viewport
                </div>
              )}
            </div>
          )}

          {/* Download Button with Format Selection - moved format selection to left */}
          <div className="w-full max-w-[300px]">
            <DropdownMenu>
              <div className="flex">
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="px-2 rounded-r-none"
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
                <Button 
                  onClick={handleDownload} 
                  className="flex-1 flex items-center justify-center gap-2 rounded-l-none border-l-[1px] border-l-primary-foreground/20"
                  disabled={!text || isTextTooLong || qrError}
                >
                  <Download size={18} />
                  Download
                </Button>
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
      </div>
    </div>
  );
};

export default QrCodeGenerator;
