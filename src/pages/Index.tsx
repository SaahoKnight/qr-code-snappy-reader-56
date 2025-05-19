
import React from 'react';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <header className="w-full text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Snappy</h1>
      </header>

      <main className="w-full max-w-4xl">
        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <QrCodeGenerator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
