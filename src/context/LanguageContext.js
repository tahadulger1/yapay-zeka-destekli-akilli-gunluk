"use client";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tr } from '@/lib/translations/tr';
import { en } from '@/lib/translations/en';

const dictionaries = { tr, en };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('tr');

  useEffect(() => {
    const saved = localStorage.getItem('ai-to-lang');
    if (saved && dictionaries[saved]) setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-to-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key) => {
    return dictionaries[lang]?.[key] || dictionaries['tr']?.[key] || key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'tr' ? 'en' : 'tr');
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
