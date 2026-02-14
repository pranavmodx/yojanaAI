import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { LANGUAGES } from '../i18n';

const LanguageContext = createContext();

export { LANGUAGES };

export const LanguageProvider = ({ children }) => {
    const { t, i18n: i18nInstance } = useTranslation();

    const language = i18nInstance.language;

    const setLanguage = (lang) => {
        i18nInstance.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const toggleLanguage = () => {
        // Cycle through languages
        const codes = LANGUAGES.map(l => l.code);
        const idx = codes.indexOf(language);
        const next = codes[(idx + 1) % codes.length];
        setLanguage(next);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
