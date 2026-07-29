export const supportedLocales = ['fr', 'en', 'ar'] as const;

export type AppLocale = (typeof supportedLocales)[number];

const configuredLocale = import.meta.env.VITE_APP_LOCALE;

/**
 * Application language, configured through VITE_APP_LOCALE in .env.
 * Unsupported or missing values fall back to English.
 */
export const appLocale: AppLocale = supportedLocales.includes(configuredLocale as AppLocale)
  ? configuredLocale as AppLocale
  : 'en';

export const localeSettings: Record<AppLocale, { htmlLang: string; direction: 'ltr' | 'rtl'; intlLocale: string }> = {
  fr: { htmlLang: 'fr', direction: 'ltr', intlLocale: 'fr-CA' },
  en: { htmlLang: 'en', direction: 'ltr', intlLocale: 'en-CA' },
  ar: { htmlLang: 'ar', direction: 'rtl', intlLocale: 'ar-MA' },
};
