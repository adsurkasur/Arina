import React, { useEffect, useState, useContext } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider, AuthContext } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getUserProfile } from "@/lib/mongodb";
import { initializeI18n } from "@/i18n";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TooltipProvider } from "@/components/ui/tooltip";

function UniversalLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <span className="ml-4 text-gray-500 text-lg">Loading...</span>
    </div>
  );
}

function RootApp() {
  const { user, userReady } = useContext(AuthContext);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);

  // Only run loadSettings when userReady transitions to true
  useEffect(() => {
    let cancelled = false;
    async function loadSettings() {
      setSettingsLoaded(false);
      let lang = "en";
      let dark = false;
      if (user && userReady) {
        const { data } = await getUserProfile(user.id);
        if (data) {
          if (data.language) lang = data.language;
          if (typeof data.dark_mode === "boolean") dark = data.dark_mode;
        }
      }
      if (!cancelled) {
        setLanguage(lang);
        setDarkMode(dark);
        initializeI18n(lang);
        document.documentElement.classList.toggle("dark", dark);
        setSettingsLoaded(true);
      }
    }
    if (userReady) {
      loadSettings();
    } else {
      setSettingsLoaded(false);
    }
    return () => { cancelled = true; };
  }, [userReady, user]);

  if (!settingsLoaded) return <UniversalLoadingScreen />;

  return (
    <ThemeProvider darkMode={darkMode} setDarkMode={setDarkMode}>
      <LanguageProvider language={language}>
        <TooltipProvider>
          <NotificationProvider>
            <ChatProvider>
              <App />
            </ChatProvider>
          </NotificationProvider>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  </QueryClientProvider>
);
