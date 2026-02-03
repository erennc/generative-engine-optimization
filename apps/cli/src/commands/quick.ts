/**
 * quick komutu - Hızlı görünürlük skoru
 */

import { GEO } from '@geo-lib/core';
import { createProgressBar } from '../utils/output.js';

export function quickCommand(source: string, response: string): void {
  try {
    const geo = new GEO();
    const score = geo.quickScore(source, response);

    console.log();
    console.log('┌─────────────────────────────────────┐');
    console.log('│  GEO Quick Score                    │');
    console.log('├─────────────────────────────────────┤');
    console.log(
      `│  Visibility: ${score.toString().padStart(3)}/100  ${createProgressBar(score, 15)}  │`
    );
    console.log('└─────────────────────────────────────┘');
    console.log();
  } catch (error) {
    console.error(
      `❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    );
    process.exit(1);
  }
}
