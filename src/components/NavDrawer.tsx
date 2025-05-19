
import { Menu, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NavDrawer = () => {
  const navItems = [
    { title: "Home", path: "/" },
    { title: "About Us", path: "/about" },
    { title: "Privacy Policy", path: "/privacy" },
    { title: "Terms of Service", path: "/terms" },
    { title: "Contact Us", path: "/contact" },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Only show back button if we're not on the home page
  const showBackButton = location.pathname !== "/";

  return (
    <div className="flex items-center gap-2">
      {showBackButton && (
        <Button variant="ghost" size="icon" onClick={handleGoBack} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Browse to different sections of our site</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-2">
            {navItems.map((item) => (
              <SheetClose asChild key={item.path}>
                <Link 
                  to={item.path} 
                  className="block w-full py-2 px-4 rounded-md hover:bg-accent text-left"
                >
                  {item.title}
                </Link>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default NavDrawer;
