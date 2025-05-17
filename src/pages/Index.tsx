
import React from 'react';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <div className="inline-block mb-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              QR Code Snappy
            </h1>
            <div className="h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full mt-1"></div>
          </div>
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
