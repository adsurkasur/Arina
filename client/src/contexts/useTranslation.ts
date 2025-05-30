import en from "@/i18n/en.json";
import id from "@/i18n/id.json";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * useTranslation hook provides a `t` function for translating UI strings.
 * Usage: const { t } = useTranslation(); t("chat.typing")
 */
function getNested(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

export function useTranslation() {
  const { language } = useLanguage();
  const translations = language === "id" ? id : en;
  const t = (key: string, fallback?: string) => {
    const value = getNested(translations, key);
    return value !== undefined ? value : fallback || key;
  };
  return { t, language };
}
