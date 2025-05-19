
import React from 'react';
import { Link } from 'react-router-dom';
import { Copyright } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      category: "Company",
      links: [
        { title: "About Us", path: "/about" },
        { title: "Contact Us", path: "/contact" },
      ]
    },
    {
      category: "Legal",
      links: [
        { title: "Privacy Policy", path: "/privacy" },
        { title: "Terms of Service", path: "/terms" },
      ]
    }
  ];
  
  return (
    <footer className="mt-12 py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {footerLinks.map((column) => (
            <div key={column.category}>
              <h3 className="text-sm font-semibold mb-4">{column.category}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path} 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center text-sm text-muted-foreground border-t pt-6">
          <Copyright size={16} className="mr-1" />
          <span>{currentYear} QR Code Snappy. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
