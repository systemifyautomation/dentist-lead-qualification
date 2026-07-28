import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { appLocale, localeSettings } from '../config/localization';
import type { AppLocale } from '../config/localization';
import { translations } from './translations';
import type { Messages } from './translations';

interface I18nValue {
  locale: AppLocale;
  intlLocale: string;
  messages: Messages;
}

const I18nContext = createContext<I18nValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const settings = localeSettings[appLocale];

  useEffect(() => {
    document.documentElement.lang = settings.htmlLang;
    document.documentElement.dir = settings.direction;
  }, [settings.direction, settings.htmlLang]);

  return (
    <I18nContext.Provider value={{
      locale: appLocale,
      intlLocale: settings.intlLocale,
      messages: translations[appLocale] as Messages,
    }}>
      {children}
    </I18nContext.Provider>
  );
};

// The provider and its hook intentionally share a module.
// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
