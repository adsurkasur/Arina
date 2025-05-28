import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

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
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader>
        <CardTitle>{t('settingsPanel.settings')}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4">
          ✕
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-medium">{t('settingsPanel.darkMode')}</span>
          <Button variant={darkMode ? "default" : "outline"} onClick={handleDarkModeToggle}>
            {darkMode ? t('settingsPanel.on') : t('settingsPanel.off')}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">{t('settingsPanel.language')}</span>
          <select
            className="border rounded px-2 py-1"
            value={i18n.language}
            onChange={handleLanguageChange}
          >
            <option value="en">{t('settingsPanel.english')}</option>
            <option value="id">{t('settingsPanel.indonesian')}</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
