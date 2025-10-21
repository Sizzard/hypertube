"use client";
import { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface LanguageContextType {
  lang: "en" | "fr";
  setLang: (lang: "en" | "fr") => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<"en" | "fr">("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // On lit le cookie côté client seulement
    const cookieLang = document.cookie.split("; ").find(c => c.startsWith("lang="))?.split("=")[1] as "en" | "fr";
    if (cookieLang) setLangState(cookieLang);
    setMounted(true);
  }, []);

  const setLang = (newLang: "en" | "fr") => {
    document.cookie = `lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setLangState(newLang);
  };

  // On ne rend rien tant que le composant n'est pas monté côté client
  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
