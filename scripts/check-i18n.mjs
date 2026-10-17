/**
 * Piwowar (Brewcraft) — i18n Dictionary Integrity Checker
 * Verifies matching keys, no missing translations, and parameter symmetry across all 35 studio languages.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, '../lib/locales');
const sourceFile = resolve(localesDir, '_source.json');

const EXPECTED_LANGUAGES = [
  'pl', 'en', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr',
  'lt', 'lv', 'et', 'uk', 'es', 'es-419', 'pt', 'pt-BR', 'de', 'fr',
  'it', 'nl', 'sv', 'da', 'nb', 'fi', 'tr', 'el', 'id', 'ms',
  'vi', 'ru', 'ja', 'ko', 'zh-Hant'
];

if (!existsSync(sourceFile)) {
  console.error('[check-i18n] Error: _source.json not found!');
  process.exit(1);
}

try {
  const source = JSON.parse(readFileSync(sourceFile, 'utf8'));
  const sourceKeys = Object.keys(source).sort();

  console.log(`[check-i18n] Source dictionary: ${sourceKeys.length} keys.`);

  let hasError = false;

  for (const lang of EXPECTED_LANGUAGES) {
    const langFile = resolve(localesDir, `${lang}.json`);
    if (!existsSync(langFile)) {
      console.error(`[check-i18n] Missing dictionary for language: ${lang}`);
      hasError = true;
      continue;
    }

    const dict = JSON.parse(readFileSync(langFile, 'utf8'));
    const dictKeys = Object.keys(dict).sort();

    // Check key count and equality
    const missingKeys = sourceKeys.filter(k => !(k in dict));
    if (missingKeys.length > 0) {
      console.error(`[check-i18n] ${lang}.json is missing ${missingKeys.length} keys: ${missingKeys.slice(0, 5).join(', ')}...`);
      hasError = true;
    }

    // Check parameter symmetry
    for (const key of sourceKeys) {
      const srcVal = String(source[key] ?? '');
      const dstVal = String(dict[key] ?? '');

      const srcParams = (srcVal.match(/\{[a-zA-Z0-9_]+\}/g) || []).sort();
      const dstParams = (dstVal.match(/\{[a-zA-Z0-9_]+\}/g) || []).sort();

      if (srcParams.join(',') !== dstParams.join(',')) {
        console.error(`[check-i18n] Parameter mismatch in ${lang}.json key '${key}': source [${srcParams}] vs dest [${dstParams}]`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    console.error('[check-i18n] i18n validation FAILED.');
    process.exit(1);
  }

  console.log(`[check-i18n] ALL 35 DICTIONARIES VALIDATED SUCCESSFULLY (${EXPECTED_LANGUAGES.length} files, ${sourceKeys.length} keys each).`);
  process.exit(0);
} catch (err) {
  console.error('[check-i18n] Error validating locales:', err);
  process.exit(1);
}
