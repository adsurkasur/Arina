import { useLanguage } from "@/contexts/LanguageContext";

/**
 * useTranslation hook provides a `t` function for translating UI strings.
 * Usage: const { t } = useTranslation(); t("English", "Indonesian")
 */
export function useTranslation() {
  const { language } = useLanguage();
  const t = (en: string, id: string) => (language === "id" ? id : en);
  return { t, language };
}
