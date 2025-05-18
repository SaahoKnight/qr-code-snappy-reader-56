
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, FileEdit, Mail, Phone, User, FileCode } from 'lucide-react';

export type QrCodeType = 'text' | 'url' | 'contact' | 'email' | 'phone';

interface QrTypeItem {
  id: QrCodeType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const qrTypes: QrTypeItem[] = [
  {
    id: 'text',
    title: 'Plain Text',
    description: 'Generate a QR code from plain text or any content',
    icon: <FileEdit size={16} />
  },
  {
    id: 'url',
    title: 'URL / Website',
    description: 'Create a QR code that opens a webpage',
    icon: <FileCode size={16} />
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Share contact details via QR code',
    icon: <User size={16} />
  },
  {
    id: 'email',
    title: 'Email Address',
    description: 'Create a QR code that starts an email',
    icon: <Mail size={16} />
  },
  {
    id: 'phone',
    title: 'Phone Number',
    description: 'Generate a QR code for a phone number',
    icon: <Phone size={16} />
  }
];

interface QrTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: QrCodeType;
  onTypeSelect: (type: QrCodeType) => void;
}

const QrTypeDialog = ({
  open,
  onOpenChange,
  selectedType,
  onTypeSelect
}: QrTypeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select QR Code Type</DialogTitle>
          <DialogDescription>
            Choose the type of QR code you want to generate
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {qrTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              className="justify-between px-4 py-6"
              onClick={() => {
                onTypeSelect(type.id);
                onOpenChange(false);
              }}
            >
              <div className="flex items-center gap-2">
                {type.icon}
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{type.title}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </div>
              </div>
              {selectedType === type.id && <Check className="h-4 w-4" />}
            </Button>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrTypeDialog;
