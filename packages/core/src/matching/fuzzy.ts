/**
 * Fuzzy Matcher
 *
 * Benzer metin eşleştirmesi yapar (Levenshtein distance).
 * Küçük yazım farklılıkları ve değişiklikleri tolere eder.
 *
 * Zero dependency - native JavaScript implementation.
 */

import type { Matcher, MatchResult, MatcherOptions } from '../types';
import { normalizeForComparison } from '../utils/text-normalizer';
import { countWords } from '../utils/tokenizer';

/** Varsayılan benzerlik eşiği */
const DEFAULT_THRESHOLD = 0.8;

/**
 * Fuzzy Matcher
 *
 * Levenshtein distance kullanarak benzer metinleri eşleştirir.
 * Paraphrase ve küçük değişiklikleri yakalar.
 *
 * @example
 * ```ts
 * const matcher = new FuzzyMatcher();
 * const matches = matcher.findMatches(sourceSentences, responseSentences, {
 *   threshold: 0.85
 * });
 * ```
 */
export class FuzzyMatcher implements Matcher {
  readonly type = 'fuzzy' as const;

  private readonly defaultThreshold: number;

  constructor(defaultThreshold = DEFAULT_THRESHOLD) {
    this.defaultThreshold = defaultThreshold;
  }

  /**
   * Kaynak cümleleri yanıt cümleleri içinde fuzzy ara
   *
   * @param sourceSentences - Kaynak cümleler
   * @param responseSentences - Yanıt cümleleri
   * @param options - Eşleştirme seçenekleri
   * @returns Eşleşme sonuçları
   */
  findMatches(
    sourceSentences: string[],
    responseSentences: string[],
    options?: MatcherOptions
  ): MatchResult[] {
    const threshold = options?.threshold ?? this.defaultThreshold;
    const matches: MatchResult[] = [];

    // Her kaynak cümle için en iyi eşleşmeyi bul
    for (const source of sourceSentences) {
      let bestMatch: {
        response: string;
        position: number;
        similarity: number;
      } | null = null;

      // Yanıt cümlelerinde ara
      for (let position = 0; position < responseSentences.length; position++) {
        const response = responseSentences[position];
        const sim = this.similarity(source, response);

        // Eşik üzerinde ve şu ana kadarki en iyi mi?
        if (sim >= threshold && (!bestMatch || sim > bestMatch.similarity)) {
          bestMatch = { response, position, similarity: sim };
        }
      }

      // En iyi eşleşmeyi ekle
      if (bestMatch) {
        matches.push({
          sourceText: source,
          matchedText: bestMatch.response,
          position: bestMatch.position,
          wordCount: countWords(source),
          similarity: bestMatch.similarity,
          type: 'fuzzy',
        });
      }
    }

    return matches;
  }

  /**
   * İki metin arasındaki benzerliği hesapla (Levenshtein-based)
   *
   * @param text1 - İlk metin
   * @param text2 - İkinci metin
   * @returns 0-1 arası benzerlik skoru
   */
  similarity(text1: string, text2: string): number {
    const norm1 = normalizeForComparison(text1);
    const norm2 = normalizeForComparison(text2);

    // Aynı metin
    if (norm1 === norm2) return 1.0;

    // Boş metin kontrolü
    if (norm1.length === 0 || norm2.length === 0) {
      return 0.0;
    }

    // Levenshtein distance hesapla
    const distance = levenshteinDistance(norm1, norm2);
    const maxLen = Math.max(norm1.length, norm2.length);

    // Distance'ı similarity'ye çevir (0-1)
    return 1 - distance / maxLen;
  }
}

/**
 * Levenshtein Distance hesapla
 *
 * İki string arasındaki minimum edit sayısı (insert, delete, replace).
 * Wagner-Fischer algorithm - O(mn) time, O(min(m,n)) space.
 *
 * @param a - İlk string
 * @param b - İkinci string
 * @returns Edit distance
 */
export function levenshteinDistance(a: string, b: string): number {
  // Uzun stringi ikinci parametre yap (space optimization)
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const m = a.length;
  const n = b.length;

  // Tek satırlık DP array (space optimization)
  let prev = new Array<number>(m + 1);
  let curr = new Array<number>(m + 1);

  // İlk satırı initialize et
  for (let i = 0; i <= m; i++) {
    prev[i] = i;
  }

  // DP hesaplama
  for (let j = 1; j <= n; j++) {
    curr[0] = j;

    for (let i = 1; i <= m; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,      // deletion
        curr[i - 1] + 1,  // insertion
        prev[i - 1] + cost // substitution
      );
    }

    // Swap arrays
    [prev, curr] = [curr, prev];
  }

  return prev[m];
}

/**
 * Jaccard benzerliği hesapla (word-level)
 *
 * @param text1 - İlk metin
 * @param text2 - İkinci metin
 * @returns 0-1 arası benzerlik
 */
export function jaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizeForComparison(text1).split(/\s+/));
  const words2 = new Set(normalizeForComparison(text2).split(/\s+/));

  // Kesişim
  const intersection = new Set([...words1].filter(w => words2.has(w)));

  // Birleşim
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * N-gram benzerliği hesapla
 *
 * @param text1 - İlk metin
 * @param text2 - İkinci metin
 * @param n - N-gram boyutu (varsayılan: 2)
 * @returns 0-1 arası benzerlik
 */
export function ngramSimilarity(text1: string, text2: string, n = 2): number {
  const ngrams1 = getNgrams(normalizeForComparison(text1), n);
  const ngrams2 = getNgrams(normalizeForComparison(text2), n);

  if (ngrams1.length === 0 && ngrams2.length === 0) return 1.0;
  if (ngrams1.length === 0 || ngrams2.length === 0) return 0.0;

  const set1 = new Set(ngrams1);
  const set2 = new Set(ngrams2);

  const intersection = [...set1].filter(ng => set2.has(ng)).length;
  const union = new Set([...set1, ...set2]).size;

  return intersection / union;
}

/**
 * Karakter n-gramları oluştur
 */
function getNgrams(text: string, n: number): string[] {
  if (text.length < n) return [];
  const ngrams: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    ngrams.push(text.slice(i, i + n));
  }
  return ngrams;
}

/**
 * Kombine benzerlik (Levenshtein + Jaccard)
 *
 * @param text1 - İlk metin
 * @param text2 - İkinci metin
 * @param levenshteinWeight - Levenshtein ağırlığı (varsayılan: 0.6)
 * @returns 0-1 arası benzerlik
 */
export function combinedSimilarity(
  text1: string,
  text2: string,
  levenshteinWeight = 0.6
): number {
  const norm1 = normalizeForComparison(text1);
  const norm2 = normalizeForComparison(text2);

  const levSim = 1 - levenshteinDistance(norm1, norm2) / Math.max(norm1.length, norm2.length, 1);
  const jacSim = jaccardSimilarity(text1, text2);

  return levSim * levenshteinWeight + jacSim * (1 - levenshteinWeight);
}
