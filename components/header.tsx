'use client'

import { Leaf, Mail, Menu, Phone } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    // Small delay to allow menu to close before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const navigationItems = [
    { href: "#products", label: "Products" },
    { href: "#about", label: "About" },
    { href: "#quality", label: "Quality" },
    { href: "#contact", label: "Contact" }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <div className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-green-600" />
          <span className="text-xl font-bold">Olive Grove</span>
        </div>

        {/* Desktop Navigation */ }
        <nav className="hidden md:flex items-center space-x-6">
          { navigationItems.map((item) => (
            <a
              key={ item.href }
              href={ item.href }
              className="text-sm hover:text-primary transition-colors"
            >
              { item.label }
            </a>
          )) }
        </nav>

        {/* Desktop Shop Now Button */ }
        <Button className="hidden md:flex">Shop Now</Button>

        {/* Mobile Menu */ }
        <Sheet open={ isMobileMenuOpen } onOpenChange={ setIsMobileMenuOpen }>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-6">
              {/* Logo in mobile menu */ }
              <div className="flex items-center space-x-2 pb-4 border-b">
                <Leaf className="h-6 w-6 text-green-600" />
                <span className="text-lg font-bold">Olive Grove</span>
              </div>

              {/* Mobile Navigation Links */ }
              <nav className="flex flex-col space-y-4">
                { navigationItems.map((item) => (
                  <button
                    key={ item.href }
                    onClick={ () => handleNavClick(item.href) }
                    className="text-left text-lg hover:text-green-600 transition-colors py-2"
                  >
                    { item.label }
                  </button>
                )) }
              </nav>

              {/* Mobile Shop Now Button */ }
              <div className="pt-4 border-t">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Shop Now
                </Button>
              </div>

              {/* Contact Info in Mobile Menu */ }
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Quick Contact</h4>
                <div className="space-y-2">
                  <a
                    href="mailto:hello@olivegrove.com"
                    className="flex items-center space-x-2 text-sm hover:text-green-600 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>tuniolive518@gmail.com</span>
                  </a>
                  <a
                    href="tel:+15551234567"
                    className="flex items-center space-x-2 text-sm hover:text-green-600 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+1 (514) 601-0603</span>
                  </a>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
