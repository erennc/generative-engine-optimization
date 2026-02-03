/**
 * @geo-lib/core
 *
 * Generative Engine Optimization (GEO) Core Library
 *
 * AI'ın içeriğe nasıl baktığını anlamak için açık kaynak kütüphane.
 * Zero dependency - tamamen local çalışır.
 *
 * @packageDocumentation
 *
 * @example
 * ```ts
 * import { GEO } from '@geo-lib/core';
 *
 * const geo = new GEO();
 *
 * const result = geo.analyze({
 *   source: "Kaynak metin...",
 *   response: "AI yanıtı..."
 * });
 *
 * console.log(result.visibility); // 0-100 arası skor
 * console.log(result.explanation); // İnsan okunabilir açıklama
 * ```
 */

// ============================================================================
// Main Class
// ============================================================================

export { GEO, default } from './geo';

// ============================================================================
// Metrics
// ============================================================================

export {
  WordCountMetric,
  calculateWordCountRatio,
} from './metrics/word-count';

export {
  PositionAdjustedMetric,
  calculatePositionWeight,
  calculatePositionAdjustedRatio,
} from './metrics/position-adjusted';

// ============================================================================
// Matching
// ============================================================================

export {
  ExactMatcher,
  containsExact,
  findAllExactMatches,
} from './matching/exact';

export {
  FuzzyMatcher,
  levenshteinDistance,
  jaccardSimilarity,
  ngramSimilarity,
  combinedSimilarity,
} from './matching/fuzzy';

// ============================================================================
// Utilities
// ============================================================================

export {
  splitIntoSentences,
  countSentences,
  splitIntoParagraphsAndSentences,
} from './utils/sentence-splitter';

export {
  tokenize,
  countWords,
  countUniqueWords,
  getWordFrequency,
  getNgrams,
  averageWordLength,
} from './utils/tokenizer';

export {
  normalizeText,
  normalizeForComparison,
  createFingerprint,
  isBlank,
  stripHtml,
  extractUrls,
  removeUrls,
  type NormalizeOptions,
} from './utils/text-normalizer';

// ============================================================================
// Types
// ============================================================================

export type {
  // Config
  GEOConfig,
  MatcherType,

  // Input
  AnalyzeInput,
  MultiSourceAnalyzeInput,

  // Output
  AnalysisResult,
  MultiSourceAnalysisResult,
  MetricsResult,
  AnalysisMeta,

  // Match
  MatchResult,
  SentencePosition,
  Matcher,
  MatcherOptions,

  // Metric
  MetricResult,
  Metric,
  MetricOptions,

  // Insight
  Insight,
  InsightType,
} from './types';
