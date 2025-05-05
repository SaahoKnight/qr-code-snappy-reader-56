
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Upload, Camera } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import QrCodeCameraScanner from './QrCodeCameraScanner';
import QrCodeUploader from './QrCodeUploader';
import QrCodeResult from './QrCodeResult';

const QrCodeScanner = () => {
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('camera');

  const handleScan = (scannedResult: string) => {
    setResult(scannedResult);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md mx-auto">
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera size={18} />
            <span>Camera</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={18} />
            <span>Upload</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-0">
          <AspectRatio ratio={1/1}>
            <QrCodeCameraScanner onScan={handleScan} isActive={activeTab === 'camera'} />
          </AspectRatio>
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <QrCodeUploader onScan={handleScan} />
        </TabsContent>
      </Tabs>

      <QrCodeResult result={result} />
    </div>
  );
};

export default QrCodeScanner;
