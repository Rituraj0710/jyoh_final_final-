import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return { 
    t, 
    currentLang: i18n.language,
    changeLanguage 
  };
};
