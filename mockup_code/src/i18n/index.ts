import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { es } from './es';
import { en } from './en';

export const SUPPORTED_LANGS = ['es', 'en'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    defaultNS: 'common',
    ns: ['common', 'sidebar', 'landing', 'auth', 'dashboard', 'opportunities', 'search', 'forum', 'blog', 'profile', 'reports', 'admin'],
    resources: { es, en },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'voluntariado-lang',
      caches: ['localStorage'],
    },
  });

const applyHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
};

applyHtmlLang(i18n.language || 'es');
i18n.on('languageChanged', applyHtmlLang);

export default i18n;
