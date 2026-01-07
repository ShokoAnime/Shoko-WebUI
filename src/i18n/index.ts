import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

import resources from './resources';

await i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: false,
  });

export default i18n;
