
import React from 'react';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 18, 2025</p>
        </header>

        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">1. Introduction</h2>
            <p className="mb-4">Welcome to QR Code Snappy. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">2. The Data We Collect</h2>
            <p className="mb-4">When you use QR Code Snappy to generate a QR code, we do not store the data you enter. The application processes your input to generate a QR code, but this data is not saved on our servers. The generated QR code is temporarily available for download but is not permanently stored by us.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">3. Cookies</h2>
            <p className="mb-4">Our website uses minimal cookies necessary for the proper functioning of the service. These cookies do not collect any personal information and are solely used to enhance your user experience.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">4. How We Use Your Data</h2>
            <p className="mb-4">As we do not collect or store your personal data, we do not use it for any purpose. The data you input to generate QR codes is processed temporarily and solely for the purpose of generating the QR code.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">5. Third-Party Services</h2>
            <p className="mb-4">We do not share any data with third parties as we do not collect or store personal data.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">6. Data Security</h2>
            <p className="mb-4">We have implemented appropriate security measures to prevent your data from being accidentally lost, used, or accessed in an unauthorized way.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">7. Changes to the Privacy Policy</h2>
            <p className="mb-4">We may update our privacy policy from time to time. Any changes will be posted on this page.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">8. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us on our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
