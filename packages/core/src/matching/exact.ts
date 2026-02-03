/**
 * Exact Matcher
 *
 * Birebir metin eşleştirmesi yapar.
 * Kaynak cümlelerini yanıt içinde tam olarak arar.
 *
 * Zero dependency implementation.
 */

import type { Matcher, MatchResult, MatcherOptions } from '../types';
import { normalizeForComparison } from '../utils/text-normalizer';
import { countWords } from '../utils/tokenizer';

/**
 * Exact Matcher
 *
 * Kaynak metinleri yanıt içinde birebir arar.
 * Case-insensitive ve whitespace-tolerant.
 *
 * @example
 * ```ts
 * const matcher = new ExactMatcher();
 * const matches = matcher.findMatches(sourceSentences, responseSentences);
 * ```
 */
export class ExactMatcher implements Matcher {
  readonly type = 'exact' as const;

  /**
   * Kaynak cümleleri yanıt cümleleri içinde ara
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
    const caseSensitive = options?.caseSensitive ?? false;
    const matches: MatchResult[] = [];

    // Her kaynak cümle için yanıt içinde ara
    for (const source of sourceSentences) {
      const normalizedSource = caseSensitive
        ? source.trim()
        : normalizeForComparison(source);

      // Yanıt cümlelerinde ara
      for (let position = 0; position < responseSentences.length; position++) {
        const response = responseSentences[position];
        const normalizedResponse = caseSensitive
          ? response.trim()
          : normalizeForComparison(response);

        // Tam eşleşme veya içerme kontrolü
        if (
          normalizedResponse === normalizedSource ||
          normalizedResponse.includes(normalizedSource)
        ) {
          matches.push({
            sourceText: source,
            matchedText: response,
            position,
            wordCount: countWords(source),
            similarity: 1.0, // Exact match = %100 benzerlik
            type: 'exact',
          });
          break; // İlk eşleşmede dur
        }
      }
    }

    return matches;
  }

  /**
   * İki metin arasındaki benzerliği hesapla
   * Exact matcher için: eşleşirse 1.0, eşleşmezse 0.0
   */
  similarity(text1: string, text2: string): number {
    const norm1 = normalizeForComparison(text1);
    const norm2 = normalizeForComparison(text2);

    if (norm1 === norm2) return 1.0;
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 1.0;
    return 0.0;
  }
}

/**
 * Basit substring kontrolü (utility function)
 *
 * @param source - Aranan metin
 * @param target - İçinde aranacak metin
 * @param caseSensitive - Büyük/küçük harf duyarlı mı?
 * @returns Bulundu mu?
 */
export function containsExact(
  source: string,
  target: string,
  caseSensitive = false
): boolean {
  if (caseSensitive) {
    return target.includes(source);
  }
  return normalizeForComparison(target).includes(normalizeForComparison(source));
}

/**
 * Tüm exact eşleşmeleri bul (pozisyonlarıyla)
 *
 * @param source - Aranan metin
 * @param target - İçinde aranacak metin
 * @returns Eşleşme pozisyonları
 */
export function findAllExactMatches(
  source: string,
  target: string
): number[] {
  const normalizedSource = normalizeForComparison(source);
  const normalizedTarget = normalizeForComparison(target);

  const positions: number[] = [];
  let pos = 0;

  while ((pos = normalizedTarget.indexOf(normalizedSource, pos)) !== -1) {
    positions.push(pos);
    pos += normalizedSource.length;
  }

  return positions;
}
