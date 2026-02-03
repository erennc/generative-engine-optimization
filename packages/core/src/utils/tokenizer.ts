/**
 * Tokenizer
 *
 * Metni kelimelere ayırır ve kelime sayısı hesaplar.
 * Zero dependency - native JavaScript implementation.
 */

// Kelime olmayan karakterler
const NON_WORD_PATTERN = /[^\p{L}\p{N}'-]+/gu;

/**
 * Metni kelimelere ayırır
 *
 * @param text - Tokenize edilecek metin
 * @returns Kelime dizisi
 *
 * @example
 * ```ts
 * const words = tokenize("Merhaba dünya! Nasılsın?");
 * // ["Merhaba", "dünya", "Nasılsın"]
 * ```
 */
export function tokenize(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  return text
    .split(NON_WORD_PATTERN)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

/**
 * Kelime sayısını hesapla
 *
 * @param text - Metin
 * @returns Kelime sayısı
 */
export function countWords(text: string): number {
  return tokenize(text).length;
}

/**
 * Benzersiz kelime sayısını hesapla
 *
 * @param text - Metin
 * @param caseSensitive - Büyük/küçük harf duyarlı mı? (varsayılan: false)
 * @returns Benzersiz kelime sayısı
 */
export function countUniqueWords(text: string, caseSensitive = false): number {
  const words = tokenize(text);
  const normalized = caseSensitive ? words : words.map((w) => w.toLowerCase());
  return new Set(normalized).size;
}

/**
 * Kelime frekansı hesapla
 *
 * @param text - Metin
 * @param caseSensitive - Büyük/küçük harf duyarlı mı?
 * @returns Kelime -> frekans map'i
 */
export function getWordFrequency(
  text: string,
  caseSensitive = false
): Map<string, number> {
  const words = tokenize(text);
  const frequency = new Map<string, number>();

  for (const word of words) {
    const key = caseSensitive ? word : word.toLowerCase();
    frequency.set(key, (frequency.get(key) || 0) + 1);
  }

  return frequency;
}

/**
 * N-gram oluştur
 *
 * @param text - Metin
 * @param n - N-gram boyutu (varsayılan: 2 = bigram)
 * @returns N-gram dizisi
 *
 * @example
 * ```ts
 * const bigrams = getNgrams("bir iki üç dört", 2);
 * // ["bir iki", "iki üç", "üç dört"]
 * ```
 */
export function getNgrams(text: string, n = 2): string[] {
  const words = tokenize(text);
  if (words.length < n) {
    return [];
  }

  const ngrams: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }

  return ngrams;
}

/**
 * Ortalama kelime uzunluğu hesapla
 */
export function averageWordLength(text: string): number {
  const words = tokenize(text);
  if (words.length === 0) return 0;

  const totalLength = words.reduce((sum, word) => sum + word.length, 0);
  return totalLength / words.length;
}
