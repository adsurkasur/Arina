import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { darkMode, setDarkMode } = useTheme();
  const { i18n, t } = useTranslation();

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleLanguageChange = (e: any) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-2xl font-semibold text-primary">
          {t('settingsPanel.settings')}
        </h2>
        <button
          className="text-gray-500 hover:text-gray-800 transition-colors"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              {t('settingsPanel.darkMode')}
            </span>
            <Button variant={darkMode ? "default" : "outline"} onClick={handleDarkModeToggle}>
              {darkMode ? t('settingsPanel.on') : t('settingsPanel.off')}
            </Button>
          </div>
          <div className="mb-2">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              {t('settingsPanel.language')}
            </span>
            <select
              className="border rounded px-2 py-1"
              value={i18n.language}
              onChange={handleLanguageChange}
            >
              <option value="en">{t('settingsPanel.english')}</option>
              <option value="id">{t('settingsPanel.indonesian')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
