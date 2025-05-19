
import React from 'react';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 w-full text-center py-4 bg-background border-b shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Snappy</h1>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pt-8">
        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <QrCodeGenerator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
