/**
 * GEO (Generative Engine Optimization) Main Class
 *
 * AI'ın içeriğe nasıl baktığını anlamak için ana API.
 * Tüm metrikleri, matcher'ları ve analiz araçlarını birleştirir.
 *
 * Zero dependency - completely local execution.
 */

import type {
  GEOConfig,
  AnalyzeInput,
  MultiSourceAnalyzeInput,
  AnalysisResult,
  MultiSourceAnalysisResult,
  MatchResult,
  MetricsResult,
  AnalysisMeta,
  Insight,
  Matcher,
} from './types';

import { WordCountMetric } from './metrics/word-count';

/** Cross-platform time measurement */
const getTimeMs = (): number => Date.now();
import { PositionAdjustedMetric } from './metrics/position-adjusted';
import { ExactMatcher } from './matching/exact';
import { FuzzyMatcher } from './matching/fuzzy';
import { splitIntoSentences } from './utils/sentence-splitter';
import { countWords } from './utils/tokenizer';

/** Varsayılan konfigürasyon */
const DEFAULT_CONFIG: Required<GEOConfig> = {
  lambdaDecay: 10,
  fuzzyThreshold: 0.8,
  matchers: ['exact', 'fuzzy'],
  language: 'auto',
};

/**
 * GEO - Generative Engine Optimization Library
 *
 * Kaynak metinlerin AI yanıtlarındaki görünürlüğünü analiz eder.
 *
 * @example
 * ```ts
 * import { GEO } from '@geo-lib/core';
 *
 * const geo = new GEO();
 *
 * const result = geo.analyze({
 *   source: "Einstein'ın görelilik teorisi...",
 *   response: "AI tarafından üretilen yanıt..."
 * });
 *
 * console.log(result.visibility); // 0-100 arası skor
 * console.log(result.explanation); // İnsan okunabilir açıklama
 * ```
 */
export class GEO {
  private readonly config: Required<GEOConfig>;
  private readonly wordCountMetric: WordCountMetric;
  private readonly positionAdjustedMetric: PositionAdjustedMetric;
  private readonly matchers: Map<string, Matcher>;

  constructor(config: GEOConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Metrikleri initialize et
    this.wordCountMetric = new WordCountMetric();
    this.positionAdjustedMetric = new PositionAdjustedMetric(this.config.lambdaDecay);

    // Matcher'ları initialize et
    this.matchers = new Map();
    this.matchers.set('exact', new ExactMatcher());
    this.matchers.set('fuzzy', new FuzzyMatcher(this.config.fuzzyThreshold));
  }

  /**
   * Tek kaynak analizi
   *
   * Kaynak metnin AI yanıtındaki görünürlüğünü analiz eder.
   *
   * @param input - Analiz girişi (source + response)
   * @returns Detaylı analiz sonucu
   */
  analyze(input: AnalyzeInput): AnalysisResult {
    const startTime = getTimeMs();

    // Input validation
    if (!input.source || !input.response) {
      throw new Error('source ve response parametreleri gerekli');
    }

    // Cümlelere böl
    const sourceSentences = splitIntoSentences(input.source);
    const responseSentences = splitIntoSentences(input.response);

    // Kelime sayıları
    const sourceWordCount = countWords(input.source);
    const responseWordCount = countWords(input.response);

    // Eşleşmeleri bul (tüm aktif matcher'ları kullan)
    const matches = this.findAllMatches(sourceSentences, responseSentences);

    // Metrikleri hesapla
    const metrics = this.calculateMetrics(matches, responseWordCount);

    // Görünürlük skoru hesapla (0-100)
    const visibility = this.calculateVisibilityScore(metrics);

    // Metadata oluştur
    const meta: AnalysisMeta = {
      sourceWordCount,
      responseWordCount,
      sourceSentenceCount: sourceSentences.length,
      responseSentenceCount: responseSentences.length,
      matchedSentenceCount: matches.length,
      processingTime: getTimeMs() - startTime,
    };

    // Açıklama oluştur
    const explanation = this.generateExplanation(visibility, metrics, matches, meta);

    return {
      visibility,
      metrics,
      matches,
      explanation,
      meta,
    };
  }

  /**
   * Çoklu kaynak analizi
   *
   * Birden fazla kaynağın AI yanıtındaki görünürlüğünü karşılaştırır.
   *
   * @param input - Çoklu analiz girişi (sources[] + response)
   * @returns Karşılaştırmalı analiz sonucu
   */
  analyzeMultiple(input: MultiSourceAnalyzeInput): MultiSourceAnalysisResult {
    if (!input.sources || input.sources.length === 0) {
      throw new Error('En az bir kaynak gerekli');
    }

    // Her kaynak için analiz yap
    const sourceResults = input.sources.map((source, index) => ({
      index,
      result: this.analyze({
        source,
        response: input.response,
        query: input.query,
      }),
    }));

    // En görünür kaynağı bul
    const sortedByVisibility = [...sourceResults].sort(
      (a, b) => b.result.visibility - a.result.visibility
    );

    // Ortalama görünürlük
    const averageVisibility =
      sourceResults.reduce((sum, sr) => sum + sr.result.visibility, 0) /
      sourceResults.length;

    return {
      sources: sourceResults,
      summary: {
        mostVisible: sortedByVisibility[0].index,
        averageVisibility,
        ranking: sortedByVisibility.map(sr => sr.index),
      },
    };
  }

  /**
   * Hızlı görünürlük skoru (sadece skor döndürür)
   */
  quickScore(source: string, response: string): number {
    const result = this.analyze({ source, response });
    return result.visibility;
  }

  /**
   * İçgörüler oluştur
   */
  getInsights(result: AnalysisResult): Insight[] {
    const insights: Insight[] = [];

    // Visibility insights
    if (result.visibility >= 70) {
      insights.push({
        type: 'high_visibility',
        message: 'Yüksek görünürlük!',
        details: 'Kaynak içeriğiniz AI yanıtında iyi temsil edilmiş.',
      });
    } else if (result.visibility <= 20) {
      insights.push({
        type: 'low_visibility',
        message: 'Düşük görünürlük',
        details: 'Kaynak içeriğiniz AI yanıtında az yer almış.',
        suggestion: 'İçeriğinize unique bilgiler, istatistikler veya alıntılar ekleyin.',
      });
    }

    // Position bias insights
    const earlyMatches = result.matches.filter(m => m.position < 3);
    if (earlyMatches.length > 0) {
      insights.push({
        type: 'position_bias',
        message: 'Erken pozisyon avantajı',
        details: `${earlyMatches.length} eşleşme yanıtın başında yer alıyor.`,
      });
    }

    // Match type insights
    const exactMatches = result.matches.filter(m => m.type === 'exact');
    if (exactMatches.length > 0) {
      insights.push({
        type: 'exact_match',
        message: 'Birebir alıntılar bulundu',
        details: `${exactMatches.length} cümle doğrudan cite edilmiş.`,
      });
    }

    return insights;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Tüm aktif matcher'ları kullanarak eşleşmeleri bul
   */
  private findAllMatches(
    sourceSentences: string[],
    responseSentences: string[]
  ): MatchResult[] {
    const allMatches: MatchResult[] = [];
    const matchedSources = new Set<string>();

    // Her matcher türü için eşleşmeleri bul
    for (const matcherType of this.config.matchers) {
      const matcher = this.matchers.get(matcherType);
      if (!matcher) continue;

      const matches = matcher.findMatches(sourceSentences, responseSentences, {
        threshold: this.config.fuzzyThreshold,
      });

      // Duplicate kontrolü - aynı source için sadece en iyi eşleşmeyi al
      for (const match of matches) {
        if (!matchedSources.has(match.sourceText)) {
          allMatches.push(match);
          matchedSources.add(match.sourceText);
        }
      }
    }

    // Pozisyona göre sırala
    return allMatches.sort((a, b) => a.position - b.position);
  }

  /**
   * Metrikleri hesapla
   */
  private calculateMetrics(
    matches: MatchResult[],
    totalResponseWords: number
  ): MetricsResult {
    const wordCount = this.wordCountMetric.calculate(matches, totalResponseWords);
    const positionAdjusted = this.positionAdjustedMetric.calculate(
      matches,
      totalResponseWords,
      { lambdaDecay: this.config.lambdaDecay }
    );

    return {
      wordCount,
      positionAdjusted,
    };
  }

  /**
   * Görünürlük skorunu hesapla (0-100)
   *
   * Word Count ve Position-Adjusted metriklerinin ağırlıklı ortalaması.
   */
  private calculateVisibilityScore(metrics: MetricsResult): number {
    // Ağırlıklar: Position-adjusted'a biraz daha fazla ağırlık
    const wcWeight = 0.4;
    const paWeight = 0.6;

    const weightedScore =
      metrics.wordCount.value * wcWeight +
      metrics.positionAdjusted.value * paWeight;

    // 0-100 arası normalize et
    return Math.round(weightedScore * 100);
  }

  /**
   * İnsan okunabilir açıklama oluştur
   */
  private generateExplanation(
    visibility: number,
    metrics: MetricsResult,
    matches: MatchResult[],
    meta: AnalysisMeta
  ): string {
    const lines: string[] = [];

    // Genel skor
    lines.push(`📊 GEO Visibility Score: ${visibility}/100`);
    lines.push('');

    // Özet
    if (visibility >= 70) {
      lines.push('✅ Yüksek görünürlük! Kaynak içeriğiniz AI yanıtında iyi temsil edilmiş.');
    } else if (visibility >= 40) {
      lines.push('⚡ Orta görünürlük. Bazı içerikleriniz kullanılmış.');
    } else if (visibility >= 10) {
      lines.push('⚠️ Düşük görünürlük. Kaynağınız az cite edilmiş.');
    } else {
      lines.push('❌ Çok düşük görünürlük. Kaynak içeriğiniz neredeyse hiç kullanılmamış.');
    }

    lines.push('');

    // Detaylar
    lines.push('📈 Metrikler:');
    lines.push(`   • Word Count: ${(metrics.wordCount.value * 100).toFixed(1)}%`);
    lines.push(`   • Position-Adjusted: ${(metrics.positionAdjusted.value * 100).toFixed(1)}%`);
    lines.push('');

    // Eşleşmeler
    lines.push(`🔍 Eşleşmeler: ${matches.length} cümle`);

    if (matches.length > 0) {
      const exactCount = matches.filter(m => m.type === 'exact').length;
      const fuzzyCount = matches.filter(m => m.type === 'fuzzy').length;

      if (exactCount > 0) lines.push(`   • ${exactCount} birebir eşleşme`);
      if (fuzzyCount > 0) lines.push(`   • ${fuzzyCount} benzer eşleşme`);

      // Pozisyon analizi
      const avgPosition =
        matches.reduce((sum, m) => sum + m.position, 0) / matches.length;
      lines.push(`   • Ortalama pozisyon: ${avgPosition.toFixed(1)}`);
    }

    lines.push('');

    // İstatistikler
    lines.push('📝 İstatistikler:');
    lines.push(`   • Kaynak: ${meta.sourceWordCount} kelime, ${meta.sourceSentenceCount} cümle`);
    lines.push(`   • Yanıt: ${meta.responseWordCount} kelime, ${meta.responseSentenceCount} cümle`);
    lines.push(`   • İşlem süresi: ${meta.processingTime.toFixed(2)}ms`);

    return lines.join('\n');
  }
}

/**
 * Default export - kolaylık için
 */
export default GEO;
