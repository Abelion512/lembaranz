/**
 * i18n setup for the dashboard.
 *
 * English is the base language and Simplified Chinese the secondary one, per
 * the language policy in AGENTS.md. The language choice is persisted in
 * `localStorage`; every visible string lives in `locales/*.json` rather than
 * inline, so a translation never requires touching a component.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'zh'],
    fallbackLng: 'en',
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
