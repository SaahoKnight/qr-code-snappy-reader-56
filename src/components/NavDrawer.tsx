
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const NavDrawer = () => {
  const navItems = [
    { title: "Home", path: "/" },
    { title: "About Us", path: "/about" },
    { title: "Privacy Policy", path: "/privacy" },
    { title: "Terms & Conditions", path: "/terms" },
    { title: "Contact Us", path: "/contact" },
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
          <DrawerDescription>Browse to different sections of our site</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <DrawerClose asChild key={item.path}>
              <Link 
                to={item.path} 
                className="block w-full py-2 px-4 rounded-md hover:bg-accent text-left"
              >
                {item.title}
              </Link>
            </DrawerClose>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default NavDrawer;
