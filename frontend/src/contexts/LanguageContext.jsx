import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        // General
        welcome: "Welcome to YojanaAI",
        subtitle: "Your bridge to Government Schemes",
        getStarted: "Get Started",
        profile: "Profile",
        schemes: "Schemes",
        applications: "Applications",
        home: "Home",

        // Auth
        createAccount: "Create Account",
        signupSubtitle: "Start accessing government schemes today",
        login: "Log In",
        loginSubtitle: "Welcome back",
        signup: "Sign Up",
        phone: "Phone Number",
        email: "Email",
        password: "Password",
        phoneOrEmail: "Phone or Email",
        phoneOrEmailPlaceholder: "Enter phone or email",
        alreadyHaveAccount: "Already have an account?",
        noAccount: "Don't have an account?",
        logout: "Logout",

        // Onboarding prompts
        onboarding_name: "What is your full name?",
        onboarding_age: "How old are you?",
        onboarding_gender: "What is your gender?",
        onboarding_state: "Which state do you live in?",
        onboarding_district: "Which district?",
        onboarding_address: "What is your full address?",
        onboarding_pincode: "What is your PIN code?",
        onboarding_occupation: "What is your occupation?",
        onboarding_income: "What is your annual household income (₹)?",
        onboarding_caste: "What is your category?",
        onboarding_education: "What is your education level?",
        onboarding_ration_card_type: "What type of ration card do you have?",
        onboarding_complete: "Profile complete! Let's find schemes for you.",

        // Placeholders
        placeholder_name: "Type your full name",
        placeholder_age: "e.g. 35",
        placeholder_state: "e.g. Madhya Pradesh",
        placeholder_district: "e.g. Indore",
        placeholder_address: "Your village / town / address",
        placeholder_pincode: "e.g. 452001",
        placeholder_occupation: "e.g. Farmer, Laborer",
        placeholder_income: "e.g. 80000",

        // Navigation
        step: "Step",
        next: "Next",
        back: "Back",
        finish: "Finish",
        listening: "Listening...",
        speak: "Tap to Speak",
        optional_skip: "This field is optional — you can skip it",

        // Profile
        name: "Name",
        age: "Age",
        gender: "Gender",
        income: "Annual Income",
        occupation: "Occupation",
        state: "State",
        submit: "Save Profile",
    },
    hi: {
        // General
        welcome: "योजनाAI में आपका स्वागत है",
        subtitle: "सरकारी योजनाओं के लिए आपका सेतु",
        getStarted: "शुरू करें",
        profile: "प्रोफाइल",
        schemes: "योजनाएं",
        applications: "आवेदन",
        home: "होम",

        // Auth
        createAccount: "खाता बनाएं",
        signupSubtitle: "आज ही सरकारी योजनाओं का लाभ लें",
        login: "लॉग इन",
        loginSubtitle: "वापसी पर स्वागत है",
        signup: "साइन अप",
        phone: "फ़ोन नंबर",
        email: "ईमेल",
        password: "पासवर्ड",
        phoneOrEmail: "फ़ोन या ईमेल",
        phoneOrEmailPlaceholder: "फ़ोन या ईमेल दर्ज करें",
        alreadyHaveAccount: "पहले से खाता है?",
        noAccount: "खाता नहीं है?",
        logout: "लॉग आउट",

        // Onboarding prompts
        onboarding_name: "आपका पूरा नाम क्या है?",
        onboarding_age: "आपकी उम्र क्या है?",
        onboarding_gender: "आपका लिंग क्या है?",
        onboarding_state: "आप किस राज्य में रहते हैं?",
        onboarding_district: "कौन सा जिला?",
        onboarding_address: "आपका पूरा पता क्या है?",
        onboarding_pincode: "आपका पिन कोड क्या है?",
        onboarding_occupation: "आपका व्यवसाय क्या है?",
        onboarding_income: "आपकी वार्षिक पारिवारिक आय कितनी है (₹)?",
        onboarding_caste: "आपकी श्रेणी क्या है?",
        onboarding_education: "आपकी शिक्षा का स्तर क्या है?",
        onboarding_ration_card_type: "आपके पास किस प्रकार का राशन कार्ड है?",
        onboarding_complete: "प्रोफ़ाइल पूरी हुई! अब आपके लिए योजनाएं खोजते हैं।",

        // Placeholders
        placeholder_name: "अपना पूरा नाम लिखें",
        placeholder_age: "जैसे 35",
        placeholder_state: "जैसे मध्य प्रदेश",
        placeholder_district: "जैसे इंदौर",
        placeholder_address: "आपका गाँव / कस्बा / पता",
        placeholder_pincode: "जैसे 452001",
        placeholder_occupation: "जैसे किसान, मजदूर",
        placeholder_income: "जैसे 80000",

        // Navigation
        step: "चरण",
        next: "आगे",
        back: "पीछे",
        finish: "पूरा करें",
        listening: "सुन रहा हूँ...",
        speak: "बोलने के लिए टैप करें",
        optional_skip: "यह वैकल्पिक है — आप छोड़ सकते हैं",

        // Profile
        name: "नाम",
        age: "आयु",
        gender: "लिंग",
        income: "वार्षिक आय",
        occupation: "व्यवसाय",
        state: "राज्य",
        submit: "प्रोफाइल सहेजें",
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language]?.[key] || key;
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
