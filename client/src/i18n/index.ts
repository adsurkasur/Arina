import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import id from './id.json';

const resources = {
  en: { translation: en },
  id: { translation: id },
};

const getInitialLanguage = () => {
  if (window && (window as any).__arinaUserLanguage) {
    return (window as any).__arinaUserLanguage;
  }
  // Fallback
  return "en";
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
