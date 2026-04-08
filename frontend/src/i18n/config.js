import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslations from './locales/en.json'
import hiTranslations from './locales/hi.json'
import guTranslations from './locales/gu.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: enTranslations,
        auth: enTranslations,
        dashboard: enTranslations,
        chat: enTranslations,
      },
      hi: {
        common: hiTranslations,
        auth: hiTranslations,
        dashboard: hiTranslations,
        chat: hiTranslations,
      },
      gu: {
        common: guTranslations,
        auth: guTranslations,
        dashboard: guTranslations,
        chat: guTranslations,
      },
    },
    ns: ['common', 'auth', 'dashboard', 'chat'],
    defaultNS: 'common',
  })

export default i18n
