import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { translations, getTranslation, type LanguageCode } from "@/lib/i18n";

interface I18nContextType {
  currentLanguage: LanguageCode;
  t: (key: string, params?: Record<string, string>) => string;
  changeLanguage: (languageCode: LanguageCode) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    // Get language from localStorage as the primary source
    const saved = localStorage.getItem('vinasana-language');
    return (saved as LanguageCode) || 'en';
  });

  // Translation function
  const t = (key: string, params?: Record<string, string>) => {
    const currentTranslations = translations[currentLanguage];
    return getTranslation(currentTranslations, key, params);
  };
  // Change language function
  const changeLanguage = (languageCode: LanguageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('vinasana-language', languageCode);
    }
  };

  return (
    <I18nContext.Provider value={{ currentLanguage, t, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Separate hook to sync user language preferences (to be used in components)
export function useUserLanguageSync() {
  const { changeLanguage } = useI18n();
  const { userProfile } = useUser();

  useEffect(() => {
    if (userProfile?.languageCode) {
      const langCode = userProfile.languageCode as LanguageCode;
      if (translations[langCode]) {
        changeLanguage(langCode);
      }
    }
  }, [userProfile?.languageCode, changeLanguage]);
}
