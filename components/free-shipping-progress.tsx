"use client";

import { Truck, CheckCircle } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/data/shipping-rates";
import { useLanguage } from "@/contexts/language-context";

interface FreeShippingProgressProps {
  totalPrice: number;
}

export default function FreeShippingProgress({ totalPrice }: FreeShippingProgressProps) {
  const { t } = useLanguage();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progress = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  return (
    <div
      className={`rounded-lg p-3 ${isFreeShipping ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}
      aria-label={t("shipping.progressLabel")}
    >
      <div className="flex items-center gap-2 mb-2">
        {isFreeShipping ? (
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
        ) : (
          <Truck className="h-4 w-4 text-green-600 flex-shrink-0" />
        )}
        <span className={`text-sm font-medium ${isFreeShipping ? "text-green-700" : "text-foreground"}`}>
          {isFreeShipping
            ? t("shipping.youQualify")
            : t("shipping.addMoreForFree").replace("${amount}", remaining.toFixed(2))}
        </span>
      </div>
      <div className="w-full bg-green-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-muted-foreground">${totalPrice.toFixed(2)}</span>
        <span className="text-xs text-muted-foreground">${FREE_SHIPPING_THRESHOLD.toFixed(2)}</span>
      </div>
    </div>
  );
}
