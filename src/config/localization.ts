export const supportedLocales = ['fr', 'en', 'ar'] as const;

export type AppLocale = (typeof supportedLocales)[number];

/**
 * Application language. Change this value and rebuild the app.
 * Language selection is intentionally not exposed in the user interface.
 */
export const appLocale: AppLocale = 'en';

export const localeSettings: Record<AppLocale, { htmlLang: string; direction: 'ltr' | 'rtl'; intlLocale: string }> = {
  fr: { htmlLang: 'fr', direction: 'ltr', intlLocale: 'fr-CA' },
  en: { htmlLang: 'en', direction: 'ltr', intlLocale: 'en-CA' },
  ar: { htmlLang: 'ar', direction: 'rtl', intlLocale: 'ar-MA' },
};
