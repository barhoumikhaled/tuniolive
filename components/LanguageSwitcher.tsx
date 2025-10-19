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
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "عربيّة" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" style={ { justifyContent: 'flex-start' } }>
          {/* <Languages className="h-4 w-4" /> */ }
          <span className="text-sm">{ currentLanguage?.label }</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        { languages.map((lang) => (
          <DropdownMenuItem
            key={ lang.code }
            onClick={ () => setLanguage(lang.code as "en" | "fr" | "ar") }
            className={ `cursor-pointer ${language === lang.code ? "bg-accent" : ""}` }
          >
            { lang.label }
          </DropdownMenuItem>
        )) }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
