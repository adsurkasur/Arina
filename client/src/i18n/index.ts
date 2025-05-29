import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import id from './id.json';

export const resources = {
  en: { translation: en },
  id: { translation: id },
};

export const initializeI18n = (lng: string) => {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
      });
  } else {
    i18n.changeLanguage(lng);
  }
  return i18n;
};

export default i18n;
