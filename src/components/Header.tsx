
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from '@/components/ui/drawer';

const navItems = [
  { title: 'Home', path: '/' },
  { title: 'About Us', path: '/about' },
  { title: 'Contact', path: '/contact' },
  { title: 'Privacy Policy', path: '/privacy' },
  { title: 'Terms & Conditions', path: '/terms' }
];

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Snappy</h1>
        
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Navigation</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <nav className="flex flex-col space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="py-2 px-3 text-lg rounded-md hover:bg-accent transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}
      </div>

      {!isMobile && (
        <nav className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                asChild
              >
                <Link to={item.path}>{item.title}</Link>
              </Button>
            ))}
          </div>
        </nav>
      )}

      <p className="text-muted-foreground text-center">Generate QR codes easily</p>
    </header>
  );
};

export default Header;
