/**
 * i18n engine for Booth Rent vs Commission Calculator V2.
 *
 * `src/i18n/locales/en.ts` is the single canonical dictionary. Every other
 * locale must define exactly the same key set — `scripts/check-i18n.mjs`
 * enforces key parity, placeholder parity, currency-symbol hygiene and the
 * banned-claim list at build time.
 *
 * Currency is never written literally inside a dictionary value. Values use the
 * `{cur}` token, which `t()` substitutes with the symbol for the active locale,
 * so a translated string can never disagree with the numbers beside it.
 */

import { en } from './locales/en';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { de } from './locales/de';
import { es } from './locales/es';
import { nl } from './locales/nl';
import { pt } from './locales/pt';

/** Canonical English dictionary; also the runtime fallback for any missing key. */
export const translations: Record<string, string> = en;

/** All shipped dictionaries, keyed by language code. */
export const locales: Record<string, Record<string, string>> = { en, fr, it, de, es, nl, pt };

export const supportedLanguages = ['en', 'fr', 'it', 'de', 'es', 'nl', 'pt'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

/**
 * Currency symbol injected wherever a dictionary value contains `{cur}`.
 * English prices in pound sterling because the tax overlay models HMRC first;
 * every other locale in this suite prices in euros.
 */
const CURRENCY_SYMBOL: Record<SupportedLanguage, string> = {
  en: '£',
  fr: '€',
  it: '€',
  de: '€',
  es: '€',
  nl: '€',
  pt: '€',
};

/** ISO 4217 code used for locale-aware number formatting. */
const CURRENCY_CODE: Record<SupportedLanguage, string> = {
  en: 'GBP',
  fr: 'EUR',
  it: 'EUR',
  de: 'EUR',
  es: 'EUR',
  nl: 'EUR',
  pt: 'EUR',
};

/** Endonym shown in the language selector, so it reads correctly in every locale. */
export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
  es: 'Español',
  nl: 'Nederlands',
  pt: 'Português',
};

/**
 * BCP 47 tag used for `Intl` date and number formatting.
 * English formats as en-GB because this suite models HMRC figures first;
 * every other locale formats with its own regional conventions, so a printed
 * summary reads "11 septembre 2026" in French rather than an English date.
 */
const LOCALE_TAG: Record<SupportedLanguage, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  it: 'it-IT',
  de: 'de-DE',
  es: 'es-ES',
  nl: 'nl-NL',
  pt: 'pt-PT',
};

let currentLanguage: SupportedLanguage = 'en';

export function getLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function getCurrencySymbol(lang?: SupportedLanguage): string {
  return CURRENCY_SYMBOL[lang || currentLanguage] || CURRENCY_SYMBOL.en;
}

export function getCurrencyCode(lang?: SupportedLanguage): string {
  return CURRENCY_CODE[lang || currentLanguage] || CURRENCY_CODE.en;
}

/** BCP 47 tag for the active locale, for `Intl.DateTimeFormat` and friends. */
export function getLocaleTag(lang?: SupportedLanguage): string {
  return LOCALE_TAG[lang || currentLanguage] || LOCALE_TAG.en;
}

export function setLanguage(lang: SupportedLanguage): void {
  if (locales[lang]) {
    currentLanguage = lang;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang);
    }
  }
}

export type TranslationKey = keyof typeof en;

/**
 * Single translate function for the whole suite.
 * Resolves a key from the active dictionary, substitutes `{cur}` plus any
 * caller-supplied parameters, and falls back to English (then to the key
 * itself) so a missing translation degrades instead of crashing.
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  langOverride?: SupportedLanguage
): string {
  const activeLang = langOverride || currentLanguage;
  const dict = locales[activeLang] || translations;

  let str = dict[key];
  if (str === undefined && activeLang !== 'en') {
    str = translations[key];
  }
  if (str === undefined) {
    str = key;
  }

  const values: Record<string, string | number> = {
    cur: CURRENCY_SYMBOL[activeLang] || CURRENCY_SYMBOL.en,
    ...(params || {}),
  };

  Object.entries(values).forEach(([k, v]) => {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  });

  return str;
}

/**
 * Resolve a user-editable label that ships with a seed value.
 * A name the user has typed always wins; otherwise the seed's translation key
 * is rendered in the active language, so switching language still relabels
 * rows the user has not touched.
 */
export function resolveName(
  name?: string,
  nameKey?: string,
  params?: Record<string, string | number>
): string {
  // An explicitly set name always wins — including an empty one, so clearing a
  // field does not snap the seeded label back.
  if (name !== undefined) return name;
  if (nameKey) return t(nameKey, params);
  return '';
}
