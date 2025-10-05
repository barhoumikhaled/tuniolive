"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden md:inline">{ currentLanguage?.flag }</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        { languages.map((lang) => (
          <DropdownMenuItem
            key={ lang.code }
            onClick={ () => setLanguage(lang.code as "en" | "fr" | "ar") }
            className={ `gap-2 cursor-pointer ${language === lang.code ? "bg-accent" : ""
              }` }
          >
            <span>{ lang.flag }</span>
            <span>{ lang.label }</span>
          </DropdownMenuItem>
        )) }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
