import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language } from '../types/database';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (ar: string | null | undefined, en: string | null | undefined) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('nzamy_lang') as Language) || 'ar';
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('nzamy_lang', language);
  }, [language]);

  // Helper: pick the right language field
  const t = (ar: string | null | undefined, en: string | null | undefined): string => {
    if (language === 'en') return en || ar || '';
    return ar || en || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};