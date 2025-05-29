import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/mongodb";
import i18n from "@/i18n";

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    async function loadUserLanguage() {
      if (user) {
        const { data } = await getUserProfile(user.id);
        if (data && data.language) {
          setLanguageState(data.language);
          // Set the language for i18n immediately
          i18n.changeLanguage(data.language);
        }
      } else {
        const stored = localStorage.getItem("arina-language");
        if (stored) {
          setLanguageState(stored);
          i18n.changeLanguage(stored);
        }
      }
    }
    loadUserLanguage();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    localStorage.setItem("arina-language", language);
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
