
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: number;
  borderSize: number;
  onSizeChange: (size: number) => void;
  onBorderSizeChange: (borderSize: number) => void;
}

const SizeDialog: React.FC<SizeDialogProps> = ({
  open,
  onOpenChange,
  size,
  borderSize,
  onSizeChange,
  onBorderSizeChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>QR Code Size Settings</DialogTitle>
          <DialogDescription>
            Adjust the size and padding of your QR code.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
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
              onValueChange={(value) => onSizeChange(value[0])}
            />
          </div>

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
              onValueChange={(value) => onBorderSizeChange(value[0])}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SizeDialog;
