
import React from 'react';
import QrCodeGenerator from '@/components/QrCodeGenerator';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <Header />

        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <QrCodeGenerator />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
