import React, { useEffect, useState, useContext } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider, AuthContext } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getUserProfile } from "@/lib/mongodb";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeI18n } from "@/i18n";

function UniversalLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <span className="ml-4 text-gray-500 text-lg">Loading...</span>
    </div>
  );
}

function ApiHealthGate({ children }: { children: React.ReactNode }) {
  const [apiReady, setApiReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkApi() {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error('API not ready');
        if (!cancelled) {
          setApiReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Connecting to server...');
          setTimeout(checkApi, 1000);
        }
      }
    }
    checkApi();
    return () => { cancelled = true; };
  }, []);

  if (!apiReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-4 text-gray-500 text-lg">{error || 'Connecting to server...'}</span>
      </div>
    );
  }
  return <>{children}</>;
}

function RootApp() {
  const { user, userReady } = useContext(AuthContext);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  // Track if i18n has been initialized
  const [i18nReady, setI18nReady] = useState(false);

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
        document.documentElement.classList.toggle("dark", dark);
        // Initialize i18n with the loaded language (or fallback to en)
        initializeI18n(lang);
        setI18nReady(true);
        setSettingsLoaded(true);
      }
    }
    if (user) {
      if (userReady) {
        loadSettings();
      } else {
        setSettingsLoaded(false);
      }
    } else {
      // No user, so allow login screen to show
      // Initialize i18n with fallback language
      initializeI18n("en");
      setI18nReady(true);
      setSettingsLoaded(true);
    }
    return () => { cancelled = true; };
  }, [userReady, user]);

  if (!settingsLoaded || !i18nReady) return <UniversalLoadingScreen />;

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
  <ApiHealthGate>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootApp />
      </AuthProvider>
    </QueryClientProvider>
  </ApiHealthGate>
);
