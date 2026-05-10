"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

interface StatusBadgeProps {
  status: "Paid" | "Partial" | "Unpaid" | "Pending" | "Overdue" | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    Paid: "bg-green-100 text-green-800 border-green-200",
    Partial: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Unpaid: "bg-red-100 text-red-800 border-red-200",
    Pending: "bg-blue-100 text-blue-800 border-blue-200",
    Overdue: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[status] ?? "bg-gray-100 text-gray-800 border-gray-200",
        className,
      )}
    >
      {status}
    </span>
  );
}
