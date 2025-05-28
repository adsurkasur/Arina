import React, { createContext, useContext, useEffect, useState } from "react";

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("arina-language");
    if (stored) setLanguageState(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("arina-language", language);
  }, [language]);

  const setLanguage = (lang: string) => setLanguageState(lang);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
