import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { useAuth } from "@/hooks/useAuth";
import { updateUserPreferences, getUserProfile } from "@/lib/mongodb";

export default function SettingsPanel({ onClose, animatingOut }: { onClose: () => void; animatingOut?: boolean }) {
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const { i18n, t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleDarkModeToggle = async () => {
    if (!user) return;
    setLoading(true);
    // Update database first, then update UI
    await updateUserPreferences(user.id, { dark_mode: !darkMode }, { email: user.email, name: user.name, photoURL: user.photoURL });
    setDarkMode(!darkMode);
    setLoading(false);
  };

  const handleLanguageChange = async (e: any) => {
    const lang = e.target.value;
    if (user) {
      setLoading(true);
      // Update database first, then update UI
      await updateUserPreferences(user.id, { language: lang }, { email: user.email, name: user.name, photoURL: user.photoURL });
      i18n.changeLanguage(lang);
      setLoading(false);
    } else {
      i18n.changeLanguage(lang);
    }
  };

  return (
    <PanelContainer onClose={onClose} title={t('settingsPanel.settings')} animatingOut={animatingOut}>
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              {t('settingsPanel.darkMode')}
            </span>
            <Button variant={darkMode ? "default" : "outline"} onClick={handleDarkModeToggle} disabled={loading}>
              {loading ? t('settingsPanel.loading') : darkMode ? t('settingsPanel.on') : t('settingsPanel.off')}
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
