import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import np from './np.json';

const savedLanguage = typeof localStorage !== 'undefined' && localStorage.getItem('kds-language') === 'np' ? 'np' : 'en';
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, np: { translation: np } },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  initImmediate: false
});

export default i18n;
