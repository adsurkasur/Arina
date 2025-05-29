import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { useAuth } from "@/hooks/useAuth";
import { updateUserPreferences } from "@/lib/mongodb";

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const { i18n, t } = useTranslation();

  const handleDarkModeToggle = async () => {
    setDarkMode(!darkMode);
    if (user) await updateUserPreferences(user.id, { dark_mode: !darkMode });
  };

  const handleLanguageChange = async (e: any) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    if (user) await updateUserPreferences(user.id, { language: lang });
  };

  return (
    <PanelContainer onClose={onClose} title={t('settingsPanel.settings')}>
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
    </PanelContainer>
  );
}
