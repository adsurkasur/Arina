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
  const [loading, setLoading] = useState(true);

  // Always load from database
  useEffect(() => {
    async function loadUserTheme() {
      setLoading(true);
      if (user) {
        const { data } = await getUserProfile(user.id);
        if (data && typeof data.dark_mode === "boolean") {
          setDarkModeState(data.dark_mode);
          if (data.dark_mode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
      setLoading(false);
    }
    loadUserTheme();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Only update state, not localStorage
  const setDarkMode = (value: boolean) => setDarkModeState(value);

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
