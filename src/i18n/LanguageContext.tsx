import { createContext, useContext, useState, ReactNode } from "react";
import { Language, translations } from "./translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("aplikei-lang");
    return (saved as Language) || "en";
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("aplikei-lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
