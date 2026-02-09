'use client'

import Image from 'next/image'
import { Leaf, Mail, Menu, Phone } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from './ui/sheet';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/contexts/language-context';
import { DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";


export default function Header() {
  const { t, isRTL } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      router.push(href);
    } else {
      router.push(href);
    }
  };

  const navigationItems = [
    { href: "/#products", labelKey: "header.products" },
    { href: "/#about", labelKey: "header.about" },
    { href: "/#quality", labelKey: "header.quality" },
    { href: "/#contact", labelKey: "header.contact" },

  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <a href="/">
          <div className="flex items-center space-x-2">
            <Image src="/tuniolive-black.png" alt="Tunisian Olive oil" width={ 140 } height={ 10 } />
          </div>
        </a>
        {/* Desktop Navigation */ }
        <nav className="hidden md:flex items-center space-x-6">
          { navigationItems.map((item) => (
            <a
              key={ item.href }
              href={ item.href }
              className="text-sm hover:text-primary transition-colors"
            >
              { t(item.labelKey!) }
            </a>
          )) }
          <LanguageSwitcher />
        </nav>

        {/* Desktop Shop Now Button */ }
        {/* <Button className="hidden md:flex">Shop Now</Button> */ }

        {/* Mobile Menu */ }
        <Sheet open={ isMobileMenuOpen } onOpenChange={ setIsMobileMenuOpen }>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            {/* ✅ Accessibility fix */ }
            <VisuallyHidden>
              <DialogTitle>Mobile navigation</DialogTitle>
            </VisuallyHidden>
            <div className="flex flex-col space-y-6">
              {/* Logo in mobile menu */ }
              <a href="/">
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Image src="/tuniolive-black.png" alt="Tunisian Olive oil" width={ 140 } height={ 10 } />
                </div>
              </a>

              {/* Navigation */ }
              <nav className="ml-5 flex flex-col space-y-4">
                { navigationItems.map((item) => (
                  <SheetClose asChild key={ item.href }>
                    <button
                      onClick={ () => handleNavClick(item.href) }

                      className="text-left text-lg hover:text-green-600 transition-colors py-2"
                    >
                      { t(item.labelKey!) }
                    </button>
                  </SheetClose>
                )) }

                <LanguageSwitcher />
              </nav>


              {/* Mobile Shop Now Button */ }
              {/* <div className="pt-4 border-t">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Shop Now
                </Button>
              </div> */}

              {/* Contact Info in Mobile Menu */ }
              <div style={ { marginLeft: '20px' } } className="pt-4 border-t space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">{ t("contact.quickContact") }</h4>
                <div className="space-y-2">
                  <a
                    href="mailto:info@tuniolive.com"
                    className="flex items-center space-x-2 text-sm hover:text-green-600 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>info@tuniolive.com</span>
                  </a>
                  <a
                    href="tel:+1 (514) 601-0603"
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
