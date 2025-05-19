
import React from 'react';
import Footer from '@/components/Footer';
import NavDrawer from '@/components/NavDrawer';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 w-full flex items-center justify-between py-4 px-4 bg-background border-b shadow-sm">
        <div>
          <NavDrawer />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
        <div className="w-10"></div> {/* Empty div for centering title */}
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pt-8">
        <div className="prose max-w-none">
          <p className="mb-4">
            We'd love to hear from you. Please use the information below to get in touch with us.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            Email: support@qrcodesnappy.com
          </p>
          <p className="mb-4">
            Phone: +1 (555) 123-4567
          </p>
          <p className="mb-4">
            Office Hours: Monday - Friday, 9:00 AM - 5:00 PM EST
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
          <p>
            For any inquiries or support requests, please email us and we'll get back to you as soon as possible.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
