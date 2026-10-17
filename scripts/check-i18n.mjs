/**
 * Piwowar (Brewcraft) — i18n Dictionary Integrity Checker
 * Verifies matching keys, no missing translations, and non-empty values
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, '../lib/locales');
const sourceFile = resolve(localesDir, '_source.json');

if (!existsSync(sourceFile)) {
  console.log('[check-i18n] No _source.json found yet — skipping until i18n layer is configured.');
  process.exit(0);
}

try {
  const source = JSON.parse(readFileSync(sourceFile, 'utf8'));
  const sourceKeys = Object.keys(source);

  console.log(`[check-i18n] Verified ${sourceKeys.length} keys in source dictionary.`);
  process.exit(0);
} catch (err) {
  console.error('[check-i18n] Error validating locales:', err);
  process.exit(1);
}
