import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { normalizarTraducoes } from './utils/normalizarTraducoes';

// Carrega todos os ficheiros da pasta locales automaticamente
const translations = import.meta.glob('./locales/*.js', { eager: true });
const resources = {};

Object.keys(translations).forEach(path => {
  const lang = path.replace('./locales/', '').replace('.js', '');
  const data = translations[path].default;
  
  // Se o ficheiro já tem 'translation' usa direto, senão envolve
  resources[lang] = normalizarTraducoes(data);
});

// O ficheiro histórico ir.js contém as traduções italianas.
resources.it = resources.ir;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false }
  });

export default i18n;
