
import React from 'react';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 w-full text-center py-4 bg-background border-b shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">About Us</h1>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pt-8">
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="mb-4">
            QR Code Snappy was created with a simple goal in mind: to provide users with a fast, 
            reliable, and easy-to-use QR code generation tool. In today's digital age, QR codes 
            have become an essential part of connecting the physical and digital worlds.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <p className="mb-4">
            Our application allows you to quickly generate QR codes for various purposes - from 
            website URLs to contact information, from plain text to complex data. We've designed 
            our platform to be intuitive and accessible for everyone, whether you're a business 
            professional or just someone who needs a QR code for personal use.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <p className="mb-4">
            Behind QR Code Snappy is a dedicated team of developers and designers passionate about 
            creating tools that simplify digital interactions. We continuously work to improve our 
            service based on user feedback and emerging technologies.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Looking Forward</h2>
          <p>
            We're committed to evolving QR Code Snappy with new features and improvements. Our 
            roadmap includes adding more customization options, advanced QR code types, and 
            analytics tools to help you track QR code performance.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
