/**
 * compare komutu - Çoklu kaynak karşılaştırması
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { GEO } from '@geo-lib/core';
import { formatCompareResult, formatCompareJson } from '../utils/output.js';

interface CompareOptions {
  sources: string[];
  response: string;
  format: 'pretty' | 'json' | 'minimal';
}

export function compareCommand(options: CompareOptions): void {
  try {
    // Yanıt dosyasını oku
    const responsePath = path.resolve(options.response);

    if (!fs.existsSync(responsePath)) {
      console.error(`❌ Yanıt dosyası bulunamadı: ${responsePath}`);
      process.exit(1);
    }

    const response = fs.readFileSync(responsePath, 'utf-8');

    // Kaynak dosyaları oku
    const sources: string[] = [];
    const sourceNames: string[] = [];

    for (const sourceFile of options.sources) {
      const sourcePath = path.resolve(sourceFile);

      if (!fs.existsSync(sourcePath)) {
        console.error(`❌ Kaynak dosya bulunamadı: ${sourcePath}`);
        process.exit(1);
      }

      sources.push(fs.readFileSync(sourcePath, 'utf-8'));
      sourceNames.push(path.basename(sourceFile));
    }

    // Analiz yap
    const geo = new GEO();
    const result = geo.analyzeMultiple({
      sources,
      response,
    });

    // Sonuçları formatla
    switch (options.format) {
      case 'json':
        console.log(formatCompareJson(result, sourceNames));
        break;
      case 'minimal':
      case 'pretty':
      default:
        console.log(formatCompareResult(result, sourceNames));
        break;
    }
  } catch (error) {
    console.error(
      `❌ Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
    );
    process.exit(1);
  }
}
