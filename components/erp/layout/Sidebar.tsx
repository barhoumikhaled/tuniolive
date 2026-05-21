"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/utils";
import {
  LayoutDashboard, Users, FileText, CreditCard, Receipt,
  BookOpen, BookMarked, BarChart3, ChevronRight, Leaf, X, Menu, ClipboardList
} from "lucide-react";

const navItems = [
  { href: "/erp", label: "Dashboard", icon: LayoutDashboard },
  { href: "/erp/contacts", label: "Contacts", icon: Users },
  { href: "/erp/ap/invoices", label: "AP Invoices", icon: FileText },
  { href: "/erp/ap/payments", label: "AP Payments", icon: CreditCard },
  { href: "/erp/ar/invoices", label: "AR Invoices", icon: Receipt },
  { href: "/erp/ar/statements", label: "AR Statements", icon: ClipboardList },
  { href: "/erp/gl/accounts", label: "Chart of Accounts", icon: BookOpen },
  { href: "/erp/gl/entries", label: "Journal Entries", icon: BookMarked },
  { href: "/erp/reports", label: "Reports", icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export function ErpSidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto",
        "bg-[hsl(142_42%_21%)] text-[hsl(40_33%_97%)]",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-[hsl(41_52%_55%)] flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-[hsl(142_42%_10%)]" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">TuniOlive</p>
            <p className="text-xs opacity-60 mt-0.5">ERP System</p>
          </div>
          <button className="ml-auto lg:hidden opacity-60 hover:opacity-100" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/erp" ? pathname === "/erp" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors",
                  active
                    ? "bg-[hsl(41_52%_55%)] text-[hsl(142_42%_10%)] font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-xs opacity-40">v1.0 · Québec, Canada</p>
        </div>
      </aside>
    </>
  );
}

export function ErpMobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 rounded-md hover:bg-black/5">
      <Menu className="w-5 h-5" />
    </button>
  );
}
