
import React from 'react';
import Footer from '@/components/Footer';
import NavDrawer from '@/components/NavDrawer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 w-full flex items-center justify-between py-4 px-4 bg-background border-b shadow-sm">
        <div>
          <NavDrawer />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <div className="w-10"></div> {/* Empty div for centering title */}
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pt-8">
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: May 19, 2025</p>
          
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            QR Code Snappy ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how your personal information is collected, used, and 
            disclosed by QR Code Snappy. By accessing or using our Service, you signify that you 
            have read, understood, and agree to our collection, storage, use, and disclosure of 
            your personal information as described in this Privacy Policy.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us. For example, we collect 
            information when you create an account, subscribe to our newsletter, respond to a 
            survey, fill out a form, request customer support, or otherwise communicate with us.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p className="mb-4">
            We may use the information we collect from you for various purposes, including to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send you related information</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Develop new products and services</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
          <p className="mb-4">
            We do not share your personal information with third parties without your consent, 
            except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>With vendors, consultants, and other service providers</li>
            <li>In connection with a business transfer</li>
            <li>For legal reasons</li>
            <li>With your consent</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@qrcodesnappy.com.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
