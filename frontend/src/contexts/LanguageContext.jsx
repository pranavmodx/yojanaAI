import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        welcome: "Welcome to YojanaAI",
        subtitle: "Your bridge to Government Schemes",
        getStarted: "Get Started",
        profile: "Profile",
        schemes: "Schemes",
        applications: "Applications",
        name: "Name",
        age: "Age",
        gender: "Gender",
        income: "Annual Income",
        occupation: "Occupation",
        state: "State",
        submit: "Save Profile",
        listening: "Listening...",
        speak: "Tap to Speak",
    },
    hi: {
        welcome: "योजनाAI में आपका स्वागत है",
        subtitle: "सरकारी योजनाओं के लिए आपका सेतु",
        getStarted: "शुरू करें",
        profile: "प्रोफाइल",
        schemes: "योजनाएं",
        applications: "आवेदन",
        name: "नाम",
        age: "आयु",
        gender: "लिंग",
        income: "वार्र्षिक आय",
        occupation: "व्यवसाय",
        state: "राज्य",
        submit: "प्रोफाइल सहेजें",
        listening: "सुन रहा हूँ...",
        speak: "बोलने के लिए टैप करें",
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
