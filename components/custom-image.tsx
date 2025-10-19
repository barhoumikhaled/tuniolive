"use client";
import React, { useState } from 'react'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Badge } from 'lucide-react';

export default function CustomImage({ product }: { product: any }) {

  const [selectedImage, setSelectedImage] = useState(product?.images[0] || "");
  return (
    <div className="space-y-4">
      <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={ selectedImage }
          alt={ product.name }
          className="h-full w-full object-cover rounded-lg"
        />
        {/* <Badge className="absolute top-4 left-4">{ product.badge }</Badge> */}
      </div>
      <div className="grid grid-cols-3 gap-4">
        { product.images.map((image: string | undefined, index: number) => (
          <div
            key={ index }
            className={ `relative h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${selectedImage === image
              ? 'ring-2 ring-green-600 ring-offset-2'
              : 'hover:opacity-75'
              }` }
            onClick={ () => setSelectedImage(image) }
          >
            <ImageWithFallback
              src={ image }
              alt={ `${product.name} ${index + 1}` }
              className="h-full w-full object-cover"
            />
          </div>
        )) }
      </div>
    </div>
  )
}
