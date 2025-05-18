
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from '@/components/ui/sheet';

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
    <header className="mb-6 relative">
      <div className="flex justify-between items-center mb-2">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="py-4">
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
            </SheetContent>
          </Sheet>
        ) : null}

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-3xl font-bold tracking-tight">QR Code Snappy</h1>
        </div>

        {/* Empty div to balance the layout when drawer button is visible */}
        <div className="w-10"></div>
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
    </header>
  );
};

export default Header;
