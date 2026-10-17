/**
 * Piwowar (Brewcraft) — i18n Anti-AI Slop Forbidden Words Test
 * Verifies that translations do not contain generic AI buzzwords.
 */

import fs from 'fs';
import path from 'path';

const localesDir = path.resolve(__dirname, '../lib/locales');

const FORBIDDEN_WORDS = [
  'delve',
  'unleash',
  'game-changer',
  'gamechanger',
  'magical',
  'revolutionize',
  'supercharge',
  'groundbreaking',
  'seamlessly',
  'testament',
  'beacon'
];

describe('i18n Anti-AI Slop Forbidden Words', () => {
  const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    it(`${file} does not contain AI buzzwords`, () => {
      const content = fs.readFileSync(path.join(localesDir, file), 'utf8').toLowerCase();
      FORBIDDEN_WORDS.forEach(word => {
        expect(content).not.toContain(word);
      });
    });
  });
});
