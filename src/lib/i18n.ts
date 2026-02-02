import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';
import esES from '@/locales/es-ES.json';

const supportedLocales = ['pt-BR', 'en-US', 'es-ES'] as const;
const savedLocale = localStorage.getItem('app-locale');
const storedLocale = supportedLocales.includes(savedLocale as (typeof supportedLocales)[number])
  ? savedLocale
  : 'pt-BR';

if (!savedLocale || savedLocale !== storedLocale) {
  localStorage.setItem('app-locale', storedLocale);
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
    },
    lng: storedLocale,
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

const syncDocumentLocale = (locale: string) => {
  document.documentElement.lang = locale;
  document.documentElement.setAttribute('data-locale', locale);
};

syncDocumentLocale(i18n.language);
i18n.on('languageChanged', (locale) => {
  syncDocumentLocale(locale);
});

export default i18n;
