
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { isURL } from '@/utils/qrCodeUtils';

interface QrCodeResultProps {
  result: string | null;
}

const QrCodeResult: React.FC<QrCodeResultProps> = ({ result }) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => {
        toast({
          title: 'Copied!',
          description: 'QR code content has been copied to clipboard.'
        });
      }, () => {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard.',
          variant: 'destructive',
        });
      });
    }
  };

  const openLink = () => {
    if (result && isURL(result)) {
      window.open(result, '_blank', 'noopener,noreferrer');
    }
  };

  if (!result) return null;

  return (
    <div className="w-full mt-2 space-y-4">
      <div className="rounded-lg border p-4 relative">
        <p className="text-sm font-medium mb-1">Scanned Content:</p>
        <div className="bg-muted rounded p-3 pr-10 break-all relative">
          {result}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </Button>
        </div>
      </div>
      
      {isURL(result) && (
        <Button 
          className="w-full flex items-center gap-2"
          onClick={openLink}
        >
          <ExternalLink size={18} />
          Open URL
        </Button>
      )}
    </div>
  );
};

export default QrCodeResult;
