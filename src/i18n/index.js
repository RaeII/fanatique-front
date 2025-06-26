import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Load translations from /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    lng: 'en', // Força o inglês como idioma padrão
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR'],
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    
    // Language detection options
    detection: {
      order: ['localStorage'], // Remove 'navigator' para não detectar idioma do navegador
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // List all namespaces for convenient reference
    ns: ['common', 'quests', 'matches', 'home', 'achievements', 'club', 'stadium-orders', 'game', 'tokens', 'app', 'clubs', 'forum'],
    defaultNS: 'common',
    
    react: {
      useSuspense: false,
    },
  });

export default i18n; 