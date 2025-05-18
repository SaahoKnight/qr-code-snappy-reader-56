
import React from 'react';
import { Link } from 'react-router-dom';
import { Copyright } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-12 py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Copyright size={16} className="mr-1" />
            <span>{currentYear} QR Code Snappy. All rights reserved.</span>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Use
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
