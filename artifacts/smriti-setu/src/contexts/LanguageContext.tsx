import { createContext, useContext, useState, ReactNode } from "react";

type Language = "te" | "en" | "hi";

interface LanguageContextType {
  language: Language | null;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  te: {
    appName: "స్మృతి సేతు",
    dashboard: "డాష్‌బోర్డ్",
    ancestors: "పూర్వీకులు",
    reminders: "రిమైండర్లు",
    settings: "సెట్టింగ్లు",
    logout: "లాగ్అవుట్",
    save: "సేవ్ చేయి",
    cancel: "రద్దు",
    add: "జోడించు",
    edit: "సవరించు",
    delete: "తొలగించు",
    search: "వెతుకు",
    loading: "లోడ్ అవుతోంది...",
    welcome: "స్వాగతం",
    changeLanguage: "భాష మార్చు",
    familyTree: "వంశ వృక్షం",
    memoryGallery: "జ్ఞాపకాల గ్యాలరీ",
    notifications: "నోటిఫికేషన్లు",
    panchangam: "పంచాంగం",
  },
  en: {
    appName: "Smriti Setu",
    dashboard: "Dashboard",
    ancestors: "Ancestors",
    reminders: "Reminders",
    settings: "Settings",
    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    loading: "Loading...",
    welcome: "Welcome",
    changeLanguage: "Change Language",
    familyTree: "Family Tree",
    memoryGallery: "Memory Gallery",
    notifications: "Notifications",
    panchangam: "Panchangam",
  },
  hi: {
    appName: "स्मृति सेतु",
    dashboard: "डैशबोर्ड",
    ancestors: "पूर्वज",
    reminders: "रिमाइंडर",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    save: "सहेजें",
    cancel: "रद्द करें",
    add: "जोड़ें",
    edit: "संपादित करें",
    delete: "हटाएं",
    search: "खोजें",
    loading: "लोड हो रहा है...",
    welcome: "स्वागत है",
    changeLanguage: "भाषा बदलें",
    familyTree: "परिवार वृक्ष",
    memoryGallery: "स्मृति गैलरी",
    notifications: "सूचनाएं",
    panchangam: "पंचांग",
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // localStorage use చేయడం లేదు - every app open లో selection వస్తుంది
  const [language, setLanguageState] = useState<Language | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (!language) return key;
    return translations[language]?.[key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
