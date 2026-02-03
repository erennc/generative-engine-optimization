/**
 * Word Count Metric (Imp_wc)
 *
 * Kaynak metnin yanıt içindeki kelime bazlı görünürlüğünü ölçer.
 *
 * Formül: Imp_wc(c_i, r) = Σ(s ∈ S_c_i) |s| / Σ(s ∈ S_r) |s|
 *
 * Referans: Princeton GEO Paper (arXiv:2311.09735)
 */

import type {
  Metric,
  MetricResult,
  MatchResult,
  MetricOptions,
} from '../types';

/**
 * Word Count Metric
 *
 * Kaynak metinden yanıta geçen kelimelerin oranını hesaplar.
 *
 * @example
 * ```ts
 * const metric = new WordCountMetric();
 * const result = metric.calculate(matches, totalResponseWords);
 * console.log(result.value); // 0.65 = %65 görünürlük
 * ```
 */
export class WordCountMetric implements Metric {
  readonly name = 'word_count';
  readonly description = 'Kaynak kelimelerinin yanıt içindeki oranı (Imp_wc)';

  /**
   * Metriği hesapla
   *
   * @param matches - Bulunan eşleşmeler
   * @param totalResponseWords - Yanıt metnindeki toplam kelime sayısı
   * @returns Metrik sonucu (0-1 arası)
   */
  calculate(
    matches: MatchResult[],
    totalResponseWords: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: MetricOptions
  ): MetricResult {
    // Toplam yanıt kelimesi yoksa 0 döndür
    if (totalResponseWords === 0) {
      return {
        name: this.name,
        value: 0,
        rawValue: 0,
        metadata: {
          matchedWords: 0,
          totalWords: totalResponseWords,
          matchCount: 0,
        },
      };
    }

    // Eşleşen kelimelerin toplamı
    const matchedWords = matches.reduce(
      (sum, match) => sum + match.wordCount,
      0
    );

    // Oran hesapla (0-1 arası)
    const value = matchedWords / totalResponseWords;

    return {
      name: this.name,
      value: Math.min(value, 1), // 1'den büyük olamaz
      rawValue: value,
      metadata: {
        matchedWords,
        totalWords: totalResponseWords,
        matchCount: matches.length,
      },
    };
  }

  /**
   * Sonucu açıkla (eğitici)
   */
  explain(result: MetricResult, matches: MatchResult[]): string {
    const percentage = (result.value * 100).toFixed(1);
    const meta = result.metadata as {
      matchedWords: number;
      totalWords: number;
      matchCount: number;
    };

    const lines: string[] = [];

    lines.push(`📊 Word Count Metric: ${percentage}%`);
    lines.push(`   ${meta.matchedWords} / ${meta.totalWords} kelime eşleşti`);

    if (result.value >= 0.7) {
      lines.push(
        '   ✅ Yüksek görünürlük! Kaynak içeriğiniz iyi temsil edilmiş.'
      );
    } else if (result.value >= 0.4) {
      lines.push('   ⚡ Orta görünürlük. Bazı içerikler kullanılmış.');
    } else if (result.value >= 0.1) {
      lines.push('   ⚠️ Düşük görünürlük. Kaynağınız az cite edilmiş.');
    } else {
      lines.push(
        '   ❌ Çok düşük görünürlük. Kaynak içeriğiniz kullanılmamış.'
      );
    }

    if (matches.length > 0) {
      lines.push(`   📝 ${matches.length} cümle/segment eşleşti`);
    }

    return lines.join('\n');
  }
}

/**
 * Basit word count hesaplama (utility function)
 *
 * @param matchedWords - Eşleşen kelime sayısı
 * @param totalWords - Toplam kelime sayısı
 * @returns 0-1 arası oran
 */
export function calculateWordCountRatio(
  matchedWords: number,
  totalWords: number
): number {
  if (totalWords === 0) return 0;
  return Math.min(matchedWords / totalWords, 1);
}
