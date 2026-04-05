import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import mr from './locales/mr.json';
import hi from './locales/hi.json';

const i18n = createI18n({
  legacy: false, // Vue 3 Composition API support
  locale: localStorage.getItem('lang') || 'en', // Saved language check
  fallbackLocale: 'en',
  messages: { en, mr, hi }
});

export default i18n;