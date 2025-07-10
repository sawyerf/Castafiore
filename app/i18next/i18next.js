import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import it from './it.json';
import fr from './fr.json';
import ru from './ru.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: en,
    it: it,
    fr: fr,
    ru: ru,
  },
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
