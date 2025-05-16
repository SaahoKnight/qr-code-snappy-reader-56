
import React from 'react';
import { Card } from '@/components/ui/card';
import QrCodeGenerator from '@/components/QrCodeGenerator';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Snappy</h1>
          <p className="text-muted-foreground">Generate QR codes easily</p>
        </header>

        <Card className="shadow-sm">
          <div className="p-4 sm:p-6">
            <QrCodeGenerator />
          </div>
        </Card>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Create QR codes instantly</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
