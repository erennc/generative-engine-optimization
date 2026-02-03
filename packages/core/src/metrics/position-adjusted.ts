/**
 * Position-Adjusted Word Count Metric (Imp'_wc)
 *
 * Konum ağırlıklı görünürlük metriği.
 * Erken pozisyonlardaki eşleşmelere daha yüksek ağırlık verir.
 *
 * Formül: Imp'_wc(c_i, r) = Σ(s ∈ S_c_i) |s| * e^(-pos(s)/λ) / Σ(s ∈ S_r) |s|
 *
 * Referans: Princeton GEO Paper (arXiv:2311.09735)
 */

import type {
  Metric,
  MetricResult,
  MatchResult,
  MetricOptions,
} from '../types';

/** Varsayılan lambda decay değeri */
const DEFAULT_LAMBDA_DECAY = 10;

/**
 * Position-Adjusted Metric
 *
 * AI sistemlerinin "position bias" özelliğini modelleyen metrik.
 * Erken pozisyonlarda cite edilen içerik daha değerli kabul edilir.
 *
 * @example
 * ```ts
 * const metric = new PositionAdjustedMetric();
 * const result = metric.calculate(matches, totalResponseWords, { lambdaDecay: 10 });
 * console.log(result.value); // 0.78 = konum ağırlıklı %78 görünürlük
 * ```
 */
export class PositionAdjustedMetric implements Metric {
  readonly name = 'position_adjusted';
  readonly description = "Konum ağırlıklı görünürlük metriği (Imp'_wc)";

  private readonly lambdaDecay: number;

  constructor(lambdaDecay = DEFAULT_LAMBDA_DECAY) {
    this.lambdaDecay = lambdaDecay;
  }

  /**
   * Metriği hesapla
   *
   * @param matches - Bulunan eşleşmeler
   * @param totalResponseWords - Yanıt metnindeki toplam kelime sayısı
   * @param options - Hesaplama seçenekleri
   * @returns Metrik sonucu (0-1 arası)
   */
  calculate(
    matches: MatchResult[],
    totalResponseWords: number,
    options?: MetricOptions
  ): MetricResult {
    const lambdaDecay = options?.lambdaDecay ?? this.lambdaDecay;

    // Toplam yanıt kelimesi yoksa 0 döndür
    if (totalResponseWords === 0) {
      return {
        name: this.name,
        value: 0,
        rawValue: 0,
        metadata: {
          weightedSum: 0,
          totalWords: totalResponseWords,
          lambdaDecay,
          positionWeights: [],
        },
      };
    }

    // Konum ağırlıklı toplam hesapla
    const positionWeights: Array<{
      position: number;
      wordCount: number;
      weight: number;
      contribution: number;
    }> = [];

    const weightedSum = matches.reduce((sum, match) => {
      // Exponential decay: e^(-position / lambda)
      // Position 0'da weight = 1.0
      // Position arttıkça weight azalır
      const weight = Math.exp(-match.position / lambdaDecay);
      const contribution = match.wordCount * weight;

      positionWeights.push({
        position: match.position,
        wordCount: match.wordCount,
        weight,
        contribution,
      });

      return sum + contribution;
    }, 0);

    // Oran hesapla (0-1 arası)
    const value = weightedSum / totalResponseWords;

    return {
      name: this.name,
      value: Math.min(value, 1),
      rawValue: value,
      metadata: {
        weightedSum,
        totalWords: totalResponseWords,
        lambdaDecay,
        positionWeights,
      },
    };
  }

  /**
   * Sonucu açıkla (eğitici)
   */
  explain(result: MetricResult, matches: MatchResult[]): string {
    const percentage = (result.value * 100).toFixed(1);
    const meta = result.metadata as {
      weightedSum: number;
      totalWords: number;
      lambdaDecay: number;
      positionWeights: Array<{
        position: number;
        weight: number;
        contribution: number;
      }>;
    };

    const lines: string[] = [];

    lines.push(`📍 Position-Adjusted Metric: ${percentage}%`);
    lines.push(`   Lambda decay: ${meta.lambdaDecay}`);

    // Pozisyon analizi
    if (matches.length > 0) {
      const earlyMatches = matches.filter((m) => m.position < 3);
      const lateMatches = matches.filter((m) => m.position >= 3);

      if (earlyMatches.length > 0) {
        lines.push(
          `   ✅ ${earlyMatches.length} eşleşme erken pozisyonlarda (0-2)`
        );
        lines.push(
          '      AI sistemleri erken içeriğe daha fazla ağırlık verir!'
        );
      }

      if (lateMatches.length > 0) {
        lines.push(
          `   ⚠️ ${lateMatches.length} eşleşme geç pozisyonlarda (3+)`
        );
        lines.push('      Bu içerikler daha az ağırlık alıyor.');
      }

      // En yüksek ağırlıklı eşleşmeyi göster
      if (meta.positionWeights.length > 0) {
        const topContributor = meta.positionWeights.reduce((max, pw) =>
          pw.contribution > max.contribution ? pw : max
        );
        lines.push(
          `   🏆 En değerli eşleşme: Pozisyon ${topContributor.position} ` +
            `(ağırlık: ${(topContributor.weight * 100).toFixed(0)}%)`
        );
      }
    }

    // Position bias açıklaması
    lines.push('');
    lines.push('   💡 Position Bias Hakkında:');
    lines.push('      AI sistemleri kaynak metinlerde erken gelen bilgilere');
    lines.push("      daha fazla önem verir. Bu metrik bu bias'ı ölçer.");

    return lines.join('\n');
  }
}

/**
 * Pozisyon ağırlığı hesapla
 *
 * @param position - Cümle pozisyonu (0-indexed)
 * @param lambdaDecay - Decay faktörü
 * @returns 0-1 arası ağırlık
 */
export function calculatePositionWeight(
  position: number,
  lambdaDecay = DEFAULT_LAMBDA_DECAY
): number {
  return Math.exp(-position / lambdaDecay);
}

/**
 * Position-adjusted oran hesapla (utility function)
 *
 * @param matches - (wordCount, position) çiftleri
 * @param totalWords - Toplam kelime sayısı
 * @param lambdaDecay - Decay faktörü
 * @returns 0-1 arası oran
 */
export function calculatePositionAdjustedRatio(
  matches: Array<{ wordCount: number; position: number }>,
  totalWords: number,
  lambdaDecay = DEFAULT_LAMBDA_DECAY
): number {
  if (totalWords === 0) return 0;

  const weightedSum = matches.reduce((sum, match) => {
    const weight = Math.exp(-match.position / lambdaDecay);
    return sum + match.wordCount * weight;
  }, 0);

  return Math.min(weightedSum / totalWords, 1);
}
