
import React, { useState } from 'react';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Contact Us</h1>
          <p className="text-muted-foreground">Get in touch with our team</p>
        </header>

        <div className="p-4 sm:p-6 bg-background rounded-lg">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="How can we help you?" 
                    className="min-h-[120px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required 
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Our Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium">Email</h3>
                  <p className="text-muted-foreground">support@qrcodesnappy.com</p>
                </div>
                
                <div>
                  <h3 className="text-base font-medium">Address</h3>
                  <p className="text-muted-foreground">
                    123 QR Street<br />
                    Web App City, Digital State 12345<br />
                    United States
                  </p>
                </div>
                
                <div>
                  <h3 className="text-base font-medium">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Friday: 9:00 AM - 5:00 PM<br />
                    Saturday & Sunday: Closed
                  </p>
                </div>
                
                <div>
                  <h3 className="text-base font-medium">Social Media</h3>
                  <div className="flex gap-4 mt-2">
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Facebook</a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors">LinkedIn</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
