
import React from 'react';
import Footer from '@/components/Footer';

const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: May 18, 2025</p>
        </header>

        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-4">1. Introduction</h2>
            <p className="mb-4">Welcome to QR Code Snappy. These terms and conditions outline the rules and regulations for the use of our website.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">2. Terms of Use</h2>
            <p className="mb-4">By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use QR Code Snappy if you do not accept all of the terms and conditions stated on this page.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">3. License to Use</h2>
            <p className="mb-4">QR Code Snappy and its contents are owned by QR Code Snappy or its licensors and are protected by copyright laws and treaties around the world. You are granted a limited license only for purposes of viewing the material contained on this website and generating QR codes for your personal or business use.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">4. Restrictions</h2>
            <p className="mb-4">In particular, and without limitation, you agree not to:</p>
            <ul className="list-disc pl-5 mb-4">
              <li>Use QR Code Snappy in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website</li>
              <li>Use QR Code Snappy in any way which is unlawful, illegal, fraudulent, or harmful</li>
              <li>Use QR Code Snappy to copy, store, host, transmit, send, use, publish or distribute any material which consists of malware</li>
              <li>Conduct any systematic or automated data collection activities on or in relation to our website without our express written consent</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">5. No Warranties</h2>
            <p className="mb-4">This website is provided "as is," with all faults, and QR Code Snappy makes no express or implied representations or warranties, of any kind related to this website or the materials contained on this website.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">In no event shall QR Code Snappy, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">7. Changes to Terms</h2>
            <p className="mb-4">QR Code Snappy reserves the right to make changes to these terms and conditions at any time. Your continued use of the website following any changes indicates your acceptance of those changes.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">8. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us on our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsConditions;
