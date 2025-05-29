import en from "@/i18n/en.json";
import id from "@/i18n/id.json";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * useTranslation hook provides a `t` function for translating UI strings.
 * Usage: const { t } = useTranslation(); t("chat.typing")
 */
export function useTranslation() {
  const { language } = useLanguage();
  const translations = (language === "id" ? id : en) as Record<string, string>;
  const t = (key: string, fallback?: string) => {
    return translations[key] || fallback || key;
  };
  return { t, language };
}
