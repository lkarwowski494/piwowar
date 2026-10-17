/**
 * Piwowar (Brewcraft) — i18n Translation Engine
 * Type-safe string translations loaded from _source.json
 */

import sourceLocales from './locales/_source.json';

export type TranslationKey = keyof typeof sourceLocales;

const translations: Record<string, string> = sourceLocales;

/**
 * Translates a given key with optional string interpolation (e.g. {{remaining}}).
 */
export function t(
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text = translations[key] || key;

  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
    }
  }

  return text;
}
