"use client";

import { cn } from "@/components/ui/utils";

interface CurrencyBadgeProps {
  currency: string;
  className?: string;
}

export function CurrencyBadge({ currency, className }: CurrencyBadgeProps) {
  const styles: Record<string, string> = {
    CAD: "bg-primary/10 text-primary",
    USD: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold",
        styles[currency] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {currency}
    </span>
  );
}
