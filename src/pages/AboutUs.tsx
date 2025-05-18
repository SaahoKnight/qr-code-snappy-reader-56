
import React from 'react';
import Footer from '@/components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">About Us</h1>
          <p className="text-muted-foreground">Learn more about QR Code Snappy</p>
        </header>

        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <div className="prose max-w-none">
            <p className="mb-4">QR Code Snappy is your go-to solution for creating custom QR codes quickly and efficiently. Our platform is designed with simplicity and functionality in mind, making it accessible for users of all skill levels.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">Our Mission</h2>
            <p className="mb-4">Our mission is to provide a reliable, straightforward tool that enables individuals and businesses to generate and customize QR codes for their various needs.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">What We Offer</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>Easy-to-use QR code generator</li>
              <li>Customization options for colors and sizes</li>
              <li>Quick download functionality</li>
              <li>Mobile-friendly interface</li>
              <li>No account required - just generate and go!</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">Our Team</h2>
            <p className="mb-4">Behind QR Code Snappy is a dedicated team of developers passionate about creating practical web tools. We continuously work to enhance our application and provide the best possible user experience.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-4">Get in Touch</h2>
            <p>Have questions or suggestions? We'd love to hear from you! Visit our <a href="/contact" className="text-primary hover:underline">Contact page</a> to reach out to our team.</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
