"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X, ZoomIn } from "lucide-react";
import { Button } from "./ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        className={ `relative group cursor-zoom-in ${className}` }
        onClick={ () => setIsOpen(true) }
      >
        <ImageWithFallback
          src={ src }
          alt={ alt }
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </div>

      <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={ () => setIsOpen(false) }
            >
              <X className="h-4 w-4" />
            </Button>
            <ImageWithFallback
              src={ src }
              alt={ alt }
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}