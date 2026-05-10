"use client";

import { useState } from "react";
import { ErpSidebar, ErpMobileMenuButton } from "./Sidebar";
import dynamic from "next/dynamic";
import { Leaf } from "lucide-react";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(40_33%_97%)]">
      <ErpSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <ErpMobileMenuButton onClick={() => setSidebarOpen(true)} />
            {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <Leaf className="w-3 h-3 text-green-700" />
              <span>TuniOlive ERP</span>
            </div>
            <UserButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
