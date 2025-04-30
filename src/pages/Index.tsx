
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import QrCodeScanner from '@/components/QrCodeScanner';
import { QrCode, Image } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Snappy</h1>
          <p className="text-muted-foreground">Generate and scan QR codes easily</p>
        </header>

        <Card className="border shadow-sm">
          <Tabs 
            defaultValue="generate" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <QrCode size={18} />
                <span>Generate</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Image size={18} />
                <span>Scan</span>
              </TabsTrigger>
            </TabsList>
            
            <CardContent>
              <TabsContent value="generate" className="mt-0">
                <QrCodeGenerator />
              </TabsContent>
              
              <TabsContent value="scan" className="mt-0">
                <QrCodeScanner />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Create and scan QR codes instantly</p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
