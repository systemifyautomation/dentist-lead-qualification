import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { appLocale, localeSettings } from '../config/localization';
import type { AppLocale } from '../config/localization';
import { translations } from './translations';
import type { Messages } from './translations';
import uiTranslations from './ui-translations.generated.json';

interface I18nValue {
  locale: AppLocale;
  intlLocale: string;
  messages: Messages;
  setLocale: (locale: AppLocale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    const savedLocale = localStorage.getItem('reactivationflow_locale') as AppLocale | null;
    return savedLocale && savedLocale in localeSettings ? savedLocale : appLocale;
  });
  const settings = localeSettings[locale];
  const setLocale = (nextLocale: AppLocale) => {
    localStorage.setItem('reactivationflow_locale', nextLocale);
    setLocaleState(nextLocale);
  };

  useEffect(() => {
    document.documentElement.lang = settings.htmlLang;
    document.documentElement.dir = settings.direction;
    const dictionary = uiTranslations[locale] as Record<string, string>;
    const translatableAttributes = ['aria-label', 'alt', 'placeholder', 'title'] as const;

    const translateValue = (value: string) => {
      const leadingWhitespace = value.match(/^\s*/)?.[0] ?? '';
      const trailingWhitespace = value.match(/\s*$/)?.[0] ?? '';
      const normalizedValue = value.replace(/\s+/g, ' ').trim();
      const translatedValue = dictionary[normalizedValue];
      return translatedValue
        ? `${leadingWhitespace}${translatedValue}${trailingWhitespace}`
        : value;
    };

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, [contenteditable="true"], .sidebar-brand')) return;
        const translatedValue = translateValue(node.textContent ?? '');
        if (translatedValue !== node.textContent) node.textContent = translatedValue;
        return;
      }

      if (!(node instanceof Element)) return;
      if (node.matches('script, style, .sidebar-brand') || node.closest('.sidebar-brand')) return;

      for (const attribute of translatableAttributes) {
        const value = node.getAttribute(attribute);
        if (!value) continue;
        const translatedValue = translateValue(value);
        if (translatedValue !== value) node.setAttribute(attribute, translatedValue);
      }

      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();
      while (textNode) {
        translateNode(textNode);
        textNode = walker.nextNode();
      }

      node.querySelectorAll('*').forEach((element) => {
        for (const attribute of translatableAttributes) {
          const value = element.getAttribute(attribute);
          if (!value) continue;
          const translatedValue = translateValue(value);
          if (translatedValue !== value) element.setAttribute(attribute, translatedValue);
        }
      });
    };

    translateNode(document.body);
    document.title = translateValue(document.title);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          translateNode(mutation.target);
          continue;
        }
        if (mutation.type === 'attributes') {
          translateNode(mutation.target);
          continue;
        }
        mutation.addedNodes.forEach(translateNode);
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatableAttributes],
    });

    return () => observer.disconnect();
  }, [locale, settings.direction, settings.htmlLang]);

  return (
    <I18nContext.Provider key={locale} value={{
      locale,
      intlLocale: settings.intlLocale,
      messages: translations[locale] as Messages,
      setLocale,
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
