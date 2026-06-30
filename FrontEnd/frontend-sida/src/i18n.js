import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viTranslation from './locales/vi.json';
import enTranslation from './locales/en.json';

i18n
  // Sử dụng plugin detect ngôn ngữ tự động (từ localStorage, cookie, hoặc trình duyệt)
  .use(LanguageDetector)
  // Gắn i18next vào react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        translation: viTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    // Nếu LanguageDetector không tìm thấy ngôn ngữ đã lưu, dùng 'vi' mặc định
    fallbackLng: 'vi',
    debug: false,

    interpolation: {
      escapeValue: false // React đã tự escape chống XSS
    }
  });

export default i18n;
