
import React from 'react';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">QR Code Snappy</h1>
          <p className="text-muted-foreground">Generate QR codes easily</p>
        </header>

        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <QrCodeGenerator />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
