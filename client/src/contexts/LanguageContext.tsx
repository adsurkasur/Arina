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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserLanguage() {
      setLoading(true);
      let lang = "en";
      if (user) {
        const { data } = await getUserProfile(user.id);
        if (data && data.language) {
          lang = data.language;
        }
      }
      setLanguageState(lang);
      i18n.changeLanguage(lang);
      // Set global variable for i18n init
      if (typeof window !== 'undefined') {
        (window as any).__arinaUserLanguage = lang;
      }
      setLoading(false);
    }
    loadUserLanguage();
    // eslint-disable-next-line
  }, [user]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      (window as any).__arinaUserLanguage = lang;
    }
  };

  if (loading) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
