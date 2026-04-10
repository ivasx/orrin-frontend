import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en.json';
import translationUK from './uk.json';

const resources = {
    en: {
        translation: translationEN.translation
    },
    uk: {
        translation: translationUK  // uk.json вже є плоским об'єктом
    }
};

const savedLanguage = localStorage.getItem('language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;