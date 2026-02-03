/**
 * Semantic Similarity Metric
 *
 * Anlam bazlı benzerlik metriği.
 * N-gram ve Jaccard similarity kullanarak semantik benzerlik hesaplar.
 * 
 * Not: Full semantic analysis için embedding modelleri gerekir (ileride eklenecek).
 * Şu an n-gram ve kelime bazlı semantic approximation yapıyor.
 */

import type {
  Metric,
  MetricResult,
  MatchResult,
  MetricOptions,
} from '../types';
import { jaccardSimilarity, ngramSimilarity } from '../matching/fuzzy';
import { tokenize } from '../utils/tokenizer';

/** Varsayılan n-gram boyutu */
const DEFAULT_NGRAM_SIZE = 2;

/** Varsayılan semantic threshold */
const DEFAULT_SEMANTIC_THRESHOLD = 0.6;

/**
 * Semantic Similarity Metric
 *
 * Kaynak ve yanıt arasındaki anlam bazlı benzerliği ölçer.
 * N-gram ve kelime overlap kombinasyonu kullanır.
 *
 * @example
 * ```ts
 * const metric = new SemanticMetric();
 * const result = metric.calculate(matches, totalResponseWords, { 
 *   ngramSize: 3,
 *   threshold: 0.7 
 * });
 * console.log(result.value); // 0.83 = %83 semantic similarity
 * ```
 */
export class SemanticMetric implements Metric {
  readonly name = 'semantic_similarity';
  readonly description = 'Anlam bazlı benzerlik metriği (N-gram + Jaccard)';

  private readonly ngramSize: number;
  private readonly threshold: number;

  constructor(
    ngramSize = DEFAULT_NGRAM_SIZE,
    threshold = DEFAULT_SEMANTIC_THRESHOLD
  ) {
    this.ngramSize = ngramSize;
    this.threshold = threshold;
  }

  /**
   * Semantic similarity hesapla
   * 
   * @param matches - Bulunan eşleşmeler (kullanılmıyor, full text comparison için)
   * @param totalResponseWords - Yanıt kelime sayısı
   * @param options - Hesaplama seçenekleri
   */
  calculate(
    matches: MatchResult[],
    totalResponseWords: number,
    options?: MetricOptions & {
      sourceText?: string;
      responseText?: string;
      ngramSize?: number;
      threshold?: number;
    }
  ): MetricResult {
    const sourceText = options?.sourceText || '';
    const responseText = options?.responseText || '';
    
    if (!sourceText || !responseText || totalResponseWords === 0) {
      return {
        name: this.name,
        value: 0,
        rawValue: 0,
        metadata: {
          ngramSimilarity: 0,
          jaccardSimilarity: 0,
          semanticMatches: 0,
          threshold: this.threshold,
        },
      };
    }

    const ngramSize = options?.ngramSize || this.ngramSize;
    const threshold = options?.threshold || this.threshold;

    // N-gram similarity
    const ngramSim = ngramSimilarity(sourceText, responseText, ngramSize);
    
    // Jaccard similarity (kelime bazlı)
    const jaccardSim = jaccardSimilarity(sourceText, responseText);

    // Kombinasyon (ağırlıklı ortalama)
    const combinedSimilarity = (ngramSim * 0.6) + (jaccardSim * 0.4);
    
    // Semantic matches (threshold üstü)
    const semanticMatches = combinedSimilarity >= threshold ? 1 : 0;

    return {
      name: this.name,
      value: Math.min(combinedSimilarity, 1),
      rawValue: combinedSimilarity,
      metadata: {
        ngramSimilarity: ngramSim,
        jaccardSimilarity: jaccardSim,
        semanticMatches,
        threshold,
        ngramSize,
      },
    };
  }

  /**
   * Semantic similarity sonucunu açıkla
   */
  explain(result: MetricResult, matches: MatchResult[]): string {
    const percentage = (result.value * 100).toFixed(1);
    const meta = result.metadata as {
      ngramSimilarity: number;
      jaccardSimilarity: number;
      semanticMatches: number;
      threshold: number;
      ngramSize?: number;
    };

    const lines: string[] = [];

    lines.push(`🧠 Semantic Similarity: ${percentage}%`);
    lines.push(`   N-gram Similarity: ${(meta.ngramSimilarity * 100).toFixed(1)}%`);
    lines.push(`   Jaccard Similarity: ${(meta.jaccardSimilarity * 100).toFixed(1)}%`);

    if (result.value >= 0.8) {
      lines.push('   ✅ Yüksek anlam benzerliği! Kaynak ve yanıt çok uyumlu.');
    } else if (result.value >= 0.6) {
      lines.push('   ⚡ Orta anlam benzerliği. Bazı kavramlar örtüşüyor.');
    } else if (result.value >= 0.3) {
      lines.push('   ⚠️ Düşük anlam benzerliği. Az kavramsal örtüşme.');
    } else {
      lines.push('   ❌ Çok düşük anlam benzerliği. Farklı konulardan.');
    }

    if (meta.semanticMatches > 0) {
      lines.push(`   📝 Threshold (${meta.threshold}) üstünde semantic match bulundu`);
    }

    return lines.join('\n');
  }
}

/**
 * İki metin arasındaki semantic similarity hesapla (utility function)
 *
 * @param text1 - Birinci metin
 * @param text2 - İkinci metin  
 * @param ngramSize - N-gram boyutu
 * @returns 0-1 arası benzerlik skoru
 */
export function calculateSemanticSimilarity(
  text1: string,
  text2: string,
  ngramSize = DEFAULT_NGRAM_SIZE
): number {
  const metric = new SemanticMetric(ngramSize);
  
  const result = metric.calculate([], text2.split(' ').length, {
    sourceText: text1,
    responseText: text2,
  });

  return result.value;
}