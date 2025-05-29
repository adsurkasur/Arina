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
          // Always set the class correctly on first load
          if (data.dark_mode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } else {
        const stored = localStorage.getItem("arina-dark-mode");
        if (stored !== null) {
          setDarkModeState(stored === "true");
          if (stored === "true") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
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
