
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bgColor: string;
  fgColor: string;
  onBgColorChange: (color: string) => void;
  onFgColorChange: (color: string) => void;
}

const ColorDialog: React.FC<ColorDialogProps> = ({
  open,
  onOpenChange,
  bgColor,
  fgColor,
  onBgColorChange,
  onFgColorChange,
}) => {
  const { toast } = useToast();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>QR Code Colors</DialogTitle>
          <DialogDescription>
            Customize the background and foreground colors of your QR code.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex items-center gap-2">
              <div className="border border-input rounded overflow-hidden">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                  title="Select background color"
                />
              </div>
              <div className="flex-1 relative">
                <Input 
                  type="text"
                  value={bgColor}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => handleColorPaste(onBgColorChange)}
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
                  onChange={(e) => onFgColorChange(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                  title="Select foreground color"
                />
              </div>
              <div className="flex-1 relative">
                <Input 
                  type="text"
                  value={fgColor}
                  onChange={(e) => onFgColorChange(e.target.value)}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => handleColorPaste(onFgColorChange)}
                  title="Paste color from clipboard"
                >
                  <Clipboard size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorDialog;
