/**
 * Piwowar (Brewcraft) — i18n Locales Symmetry & Integrity Test
 * Verifies that all 35 studio languages have 100% key and parameter symmetry.
 */

import fs from 'fs';
import path from 'path';

const localesDir = path.resolve(__dirname, '../lib/locales');
const sourceFile = path.resolve(localesDir, '_source.json');

const EXPECTED_LANGUAGES = [
  'pl', 'en', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr',
  'lt', 'lv', 'et', 'uk', 'es', 'es-419', 'pt', 'pt-BR', 'de', 'fr',
  'it', 'nl', 'sv', 'da', 'nb', 'fi', 'tr', 'el', 'id', 'ms',
  'vi', 'ru', 'ja', 'ko', 'zh-Hant'
];

describe('i18n 35 Locales Symmetry & Integrity', () => {
  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  const sourceKeys = Object.keys(source).sort();

  it('contains exactly 35 language files plus _source.json', () => {
    EXPECTED_LANGUAGES.forEach(lang => {
      const filePath = path.join(localesDir, `${lang}.json`);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  EXPECTED_LANGUAGES.forEach(lang => {
    describe(`Locale: ${lang}`, () => {
      const filePath = path.join(localesDir, `${lang}.json`);
      const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      it('has all keys from _source.json', () => {
        const dictKeys = Object.keys(dict).sort();
        expect(dictKeys.length).toBe(sourceKeys.length);
        expect(dictKeys).toEqual(sourceKeys);
      });

      it('maintains parameter symmetry for interpolation', () => {
        sourceKeys.forEach(key => {
          const srcVal = String(source[key] ?? '');
          const dstVal = String(dict[key] ?? '');

          const srcParams = (srcVal.match(/\{[a-zA-Z0-9_]+\}/g) || []).sort();
          const dstParams = (dstVal.match(/\{[a-zA-Z0-9_]+\}/g) || []).sort();

          expect(dstParams).toEqual(srcParams);
        });
      });

      if (lang !== 'pl') {
        it('does not contain untranslated Polish characters indicative of copy-paste leaks', () => {
          // Polish specific diacritics: ą, ć, ę, ł, ń, ó, ś, ź, ż
          // Note: German/French/Czech have their own diacritics, but Polish 'ł', 'ą', 'ę', 'ć', 'ź', 'ż' should not leak into non-Slavic languages
          if (['en', 'de', 'fr', 'it', 'nl', 'sv', 'da', 'nb', 'fi', 'tr', 'id', 'ms', 'vi', 'ja', 'ko', 'zh-Hant', 'es', 'pt'].includes(lang)) {
            const forbiddenPolishChars = /[ąćęłńśźżĄĆĘŁŃŚŹŻ]/;
            sourceKeys.forEach(key => {
              if (key === 'app_name') return; // "Piwowar (Brewcraft)" retains brand name
              const val = dict[key];
              expect(val).not.toMatch(forbiddenPolishChars);
            });
          }
        });
      }
    });
  });
});
