"use client";
import Image from "next/image";
import React, { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function CustomImage({ product }: { product: any }) {
  const [selectedImage, setSelectedImage] = useState(
    product?.images[0] || ""
  );

  return (
    <div className="space-y-4">
      {/* MAIN IMAGE */ }
      {/* <div className="relative h-[600px] rounded-lg overflow-hidden"> */ }
      <div className="w-full flex justify-center items-center rounded-lg p-4">
        <Image
          src={ selectedImage }
          alt={ product.name }
          width={ 1100 }
          height={ 1100 }
          className="max-w-full max-h-[600px] object-contain"
          sizes="(max-width: 768px) 100vw, 600px"
          priority
        />
      </div>

      {/* <div className="w-full flex justify-center items-center bg-gray-100 rounded-lg p-4">
        <Image
          src={ selectedImage }
          alt={ product.name }
          width={ 1100 }
          height={ 1100 }
          className="max-h-[491px] w-auto object-contain"
          sizes="(max-width: 768px) 100vw, 491px"
          priority
        />
      </div> */}

      {/* THUMBNAILS */ }
      <div className="grid grid-cols-6 gap-4">
        { product.images.map((image: string, index: number) => (
          <button
            key={ index }
            onClick={ () => setSelectedImage(image) }
            className={ `relative aspect-square rounded-lg overflow-hidden transition-all duration-300
              ${selectedImage === image
                ? "ring-2 ring-green-600 ring-offset-2"
                : "hover:opacity-75"
              }` }
          >
            <ImageWithFallback
              src={ image }
              alt={ `${product.name} ${index + 1}` }
              className="h-full w-full object-contain"
            />
          </button>
        )) }
      </div>
    </div>
  );
}
