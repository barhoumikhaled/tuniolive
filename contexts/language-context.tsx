"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "../translations/en";
import { fr } from "../translations/fr";
import { ar } from "../translations/ar";

type Language = "en" | "fr" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsMap: Record<Language, Record<string, any>> = {
  en: en,
  fr: fr,
  ar: ar,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved language preference
    const savedLang = localStorage.getItem("preferredLanguage") as Language;
    if (savedLang && ["en", "fr", "ar"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Update document direction for RTL
    if (language === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = language;
    }
  }, [language, isClient]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (isClient) {
      localStorage.setItem("preferredLanguage", lang);
    }
  };

  const t = (key: string): string => {
    if (!key) return "";

    const translations = translationsMap[language] || translationsMap.en;
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value?.[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Missing translation for key: "${key}" in "${language}"`);
        return key; // fallback to showing the key
      }
    }

    return typeof value === "string" ? value : key;
  };


  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={ { language, setLanguage, t, isRTL } }>
      { children }
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
