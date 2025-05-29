import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/lib/mongodb";

interface ThemeContextProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  darkMode: false,
  setDarkMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    async function loadUserTheme() {
      if (user) {
        const { data } = await getUserProfile(user.id);
        if (data && typeof data.dark_mode === "boolean") {
          setDarkModeState(data.dark_mode);
          document.documentElement.classList.toggle("dark", data.dark_mode);
        }
      } else {
        const stored = localStorage.getItem("arina-dark-mode");
        if (stored !== null) setDarkModeState(stored === "true");
      }
    }
    loadUserTheme();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("arina-dark-mode", darkMode ? "true" : "false");
  }, [darkMode]);

  const setDarkMode = (value: boolean) => setDarkModeState(value);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
