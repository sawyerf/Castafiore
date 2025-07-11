import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import it from './it.json';
import fr from './fr.json';
import ru from './ru.json';
import zhHans from './zh-Hans.json';
import zhHant from './zh-Hant.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: en,
    it: it,
    fr: fr,
    ru: ru,
    zhHans: zhHans,
    zhHant: zhHant,
  },
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
