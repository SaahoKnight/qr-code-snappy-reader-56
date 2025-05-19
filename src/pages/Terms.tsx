
import React from 'react';
import Footer from '@/components/Footer';
import NavDrawer from '@/components/NavDrawer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 w-full flex items-center justify-between py-4 px-4 bg-background border-b shadow-sm">
        <div>
          <NavDrawer />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
        <div className="w-10"></div> {/* Empty div for centering title */}
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pt-8">
        <div className="prose max-w-none">
          <p className="mb-4">Last updated: May 19, 2025</p>
          
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using QR Code Snappy ("Service"), you agree to be bound by these 
            Terms and Conditions and all applicable laws and regulations. If you do not agree 
            with any of these terms, you are prohibited from using the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily use the Service for personal, non-commercial 
            purposes. This license does not include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Modifying or copying our materials</li>
            <li>Using the materials for any commercial purpose</li>
            <li>Attempting to decompile or reverse engineer any software contained in the Service</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
          <p className="mb-4">
            The materials on QR Code Snappy's website are provided on an 'as is' basis. 
            QR Code Snappy makes no warranties, expressed or implied, and hereby disclaims 
            and negates all other warranties including, without limitation, implied warranties 
            or conditions of merchantability, fitness for a particular purpose, or non-infringement 
            of intellectual property.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
          <p className="mb-4">
            In no event shall QR Code Snappy or its suppliers be liable for any damages 
            (including, without limitation, damages for loss of data or profit, or due to 
            business interruption) arising out of the use or inability to use the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">5. Changes to Terms</h2>
          <p className="mb-4">
            QR Code Snappy reserves the right to revise these terms of service at any time 
            without notice. By using this Service, you are agreeing to be bound by the current 
            version of these terms of service.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the 
            laws and you irrevocably submit to the exclusive jurisdiction of the courts 
            in that jurisdiction.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
