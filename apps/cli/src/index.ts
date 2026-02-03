/**
 * GEO CLI - Terminal'den AI görünürlük analizi
 *
 * @example
 * ```bash
 * geo analyze --source kaynak.txt --response yanit.txt
 * geo compare --sources kaynak1.txt kaynak2.txt --response yanit.txt
 * geo quick "Kaynak metin" "AI yanıtı"
 * ```
 */

import { Command } from 'commander';
import { analyzeCommand } from './commands/analyze.js';
import { compareCommand } from './commands/compare.js';
import { quickCommand } from './commands/quick.js';

const program = new Command();

program
  .name('geo')
  .description('GEO CLI - AI görünürlük analizi için terminal aracı')
  .version('0.1.0');

// analyze komutu
program
  .command('analyze')
  .description('Kaynak metnin AI yanıtındaki görünürlüğünü analiz et')
  .requiredOption('-s, --source <file>', 'Kaynak metin dosyası')
  .requiredOption('-r, --response <file>', 'AI yanıt dosyası')
  .option('-f, --format <type>', 'Çıktı formatı (pretty|json|minimal)', 'pretty')
  .option('-q, --query <text>', 'Opsiyonel sorgu metni')
  .action(analyzeCommand);

// compare komutu
program
  .command('compare')
  .description('Birden fazla kaynağı karşılaştır')
  .requiredOption('--sources <files...>', 'Kaynak metin dosyaları')
  .requiredOption('-r, --response <file>', 'AI yanıt dosyası')
  .option('-f, --format <type>', 'Çıktı formatı (pretty|json|minimal)', 'pretty')
  .action(compareCommand);

// quick komutu
program
  .command('quick <source> <response>')
  .description('Hızlı görünürlük skoru (dosya yerine metin)')
  .action(quickCommand);

program.parse();
