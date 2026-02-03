/**
 * GEO Library Core Types
 *
 * AI'ın içeriğe nasıl baktığını anlamak için tip tanımlamaları
 */

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * GEO kütüphanesi konfigürasyonu
 */
export interface GEOConfig {
  /** Position-adjusted metrik için decay faktörü (varsayılan: 10) */
  lambdaDecay?: number;
  /** Fuzzy matching için minimum benzerlik eşiği (0-1, varsayılan: 0.8) */
  fuzzyThreshold?: number;
  /** Kullanılacak matcher türleri */
  matchers?: MatcherType[];
  /** Dil ayarları */
  language?: 'tr' | 'en' | 'auto';
}

export type MatcherType = 'exact' | 'fuzzy' | 'semantic';

// ============================================================================
// Input Types
// ============================================================================

/**
 * Analiz için giriş parametreleri
 */
export interface AnalyzeInput {
  /** Kaynak metin (örn: blog yazısı, makale) */
  source: string;
  /** AI'ın ürettiği yanıt metni */
  response: string;
  /** Opsiyonel: Sorgu/query metni */
  query?: string;
}

/**
 * Çoklu kaynak analizi için giriş
 */
export interface MultiSourceAnalyzeInput {
  /** Kaynak metinler listesi */
  sources: string[];
  /** AI'ın ürettiği yanıt metni */
  response: string;
  /** Opsiyonel: Sorgu/query metni */
  query?: string;
}

// ============================================================================
// Match Types
// ============================================================================

/**
 * Tek bir eşleşme sonucu
 */
export interface MatchResult {
  /** Kaynak metindeki eşleşen metin */
  sourceText: string;
  /** Yanıt metnindeki eşleşen metin */
  matchedText: string;
  /** Eşleşmenin yanıt içindeki cümle pozisyonu (0-indexed) */
  position: number;
  /** Kelime sayısı */
  wordCount: number;
  /** Benzerlik skoru (0-1, exact match için 1.0) */
  similarity: number;
  /** Eşleşme türü */
  type: MatcherType;
}

/**
 * Cümle pozisyon bilgisi (internal use)
 */
export interface SentencePosition {
  /** Cümle metni */
  text: string;
  /** Kelime sayısı */
  wordCount: number;
  /** Pozisyon (0-indexed) */
  position: number;
}

// ============================================================================
// Metric Types
// ============================================================================

/**
 * Tek bir metrik sonucu
 */
export interface MetricResult {
  /** Metrik adı */
  name: string;
  /** Metrik değeri (0-1 arası normalize) */
  value: number;
  /** Opsiyonel: Ham değer */
  rawValue?: number;
  /** Opsiyonel: Ek metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Tüm metriklerin sonucu
 */
export interface MetricsResult {
  /** Word Count Metric (Imp_wc) */
  wordCount: MetricResult;
  /** Position-Adjusted Word Count Metric (Imp'_wc) */
  positionAdjusted: MetricResult;
}

// ============================================================================
// Analysis Result Types
// ============================================================================

/**
 * Tek kaynak analiz sonucu
 */
export interface AnalysisResult {
  /** Genel görünürlük skoru (0-100) */
  visibility: number;
  /** Detaylı metrik sonuçları */
  metrics: MetricsResult;
  /** Bulunan eşleşmeler */
  matches: MatchResult[];
  /** İnsan okunabilir açıklama */
  explanation: string;
  /** Analiz metadata */
  meta: AnalysisMeta;
}

/**
 * Çoklu kaynak analiz sonucu
 */
export interface MultiSourceAnalysisResult {
  /** Kaynak bazlı sonuçlar */
  sources: Array<{
    index: number;
    result: AnalysisResult;
  }>;
  /** Karşılaştırmalı özet */
  summary: {
    /** En görünür kaynak indexi */
    mostVisible: number;
    /** Toplam görünürlük ortalaması */
    averageVisibility: number;
    /** Kaynak görünürlük sıralaması */
    ranking: number[];
  };
}

/**
 * Analiz metadata
 */
export interface AnalysisMeta {
  /** Kaynak kelime sayısı */
  sourceWordCount: number;
  /** Yanıt kelime sayısı */
  responseWordCount: number;
  /** Kaynak cümle sayısı */
  sourceSentenceCount: number;
  /** Yanıt cümle sayısı */
  responseSentenceCount: number;
  /** Eşleşen cümle sayısı */
  matchedSentenceCount: number;
  /** Analiz süresi (ms) */
  processingTime: number;
}

// ============================================================================
// Insight Types
// ============================================================================

/**
 * Analiz içgörüsü
 */
export interface Insight {
  /** İçgörü türü */
  type: InsightType;
  /** Kısa mesaj */
  message: string;
  /** Detaylı açıklama */
  details?: string;
  /** Öneri (varsa) */
  suggestion?: string;
}

export type InsightType =
  | 'position_bias' // Erken pozisyon avantajı
  | 'high_visibility' // Yüksek görünürlük
  | 'low_visibility' // Düşük görünürlük
  | 'exact_match' // Birebir alıntı
  | 'partial_match' // Kısmi eşleşme
  | 'no_match'; // Eşleşme yok

// ============================================================================
// Matcher Interface
// ============================================================================

/**
 * Matcher arayüzü - tüm matcher'ların implement etmesi gereken
 */
export interface Matcher {
  /** Matcher türü */
  readonly type: MatcherType;

  /**
   * Kaynak cümleleri yanıt cümleleri içinde ara
   */
  findMatches(
    sourceSentences: string[],
    responseSentences: string[],
    options?: MatcherOptions
  ): MatchResult[];

  /**
   * İki metin arasındaki benzerliği hesapla
   */
  similarity(text1: string, text2: string): number;
}

export interface MatcherOptions {
  /** Minimum benzerlik eşiği (0-1) */
  threshold?: number;
  /** Case-sensitive mi? */
  caseSensitive?: boolean;
}

// ============================================================================
// Metric Interface
// ============================================================================

/**
 * Metric arayüzü - tüm metriklerin implement etmesi gereken
 */
export interface Metric {
  /** Metrik adı */
  readonly name: string;
  /** Metrik açıklaması */
  readonly description: string;

  /**
   * Metriği hesapla
   */
  calculate(
    matches: MatchResult[],
    totalResponseWords: number,
    options?: MetricOptions
  ): MetricResult;

  /**
   * Sonucu açıkla
   */
  explain(result: MetricResult, matches: MatchResult[]): string;
}

export interface MetricOptions {
  /** Lambda decay faktörü (position-adjusted için) */
  lambdaDecay?: number;
}
