/**
 * analyze komutu - Tek kaynak analizi
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { GEO } from '@geo-lib/core';
import { formatPrettyResult, formatMinimalResult } from '../utils/output.js';

interface AnalyzeOptions {
  source: string;
  response: string;
  format: 'pretty' | 'json' | 'minimal';
  query?: string;
}

export function analyzeCommand(options: AnalyzeOptions): void {
  try {
    // Dosyaları oku
    const sourcePath = path.resolve(options.source);
    const responsePath = path.resolve(options.response);

    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Kaynak dosya bulunamadı: ${sourcePath}`);
      process.exit(1);
    }

    if (!fs.existsSync(responsePath)) {
      console.error(`❌ Yanıt dosyası bulunamadı: ${responsePath}`);
      process.exit(1);
    }

    const source = fs.readFileSync(sourcePath, 'utf-8');
    const response = fs.readFileSync(responsePath, 'utf-8');

    // Analiz yap
    const geo = new GEO();
    const result = geo.analyze({
      source,
      response,
      query: options.query,
    });

    // Sonuçları formatla
    switch (options.format) {
      case 'json':
        console.log(JSON.stringify(result, null, 2));
        break;
      case 'minimal':
        console.log(formatMinimalResult(result));
        break;
      case 'pretty':
      default:
        console.log(formatPrettyResult(result));
        break;
    }
  } catch (error) {
    console.error(
      `❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    );
    process.exit(1);
  }
}
