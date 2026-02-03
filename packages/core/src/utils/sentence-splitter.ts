/**
 * Sentence Splitter
 *
 * Metni cümlelere böler. Kısaltmaları ve özel durumları handle eder.
 * Zero dependency - native JavaScript implementation.
 */

// Yaygın kısaltmalar (Türkçe ve İngilizce)
const ABBREVIATIONS = new Set([
  // İngilizce
  'mr',
  'mrs',
  'ms',
  'dr',
  'prof',
  'sr',
  'jr',
  'vs',
  'etc',
  'inc',
  'ltd',
  'co',
  'corp',
  'st',
  'ave',
  'blvd',
  'dept',
  'est',
  'fig',
  'govt',
  'no',
  'vol',
  // Türkçe
  'dr',
  'prof',
  'doç',
  'yrd',
  'öğr',
  'gör',
  'av',
  'muh',
  'müh',
  'arş',
  'cad',
  'sok',
  'mah',
  'apt',
  'kat',
  'no',
  'tel',
  'fax',
  'pk',
  'tr',
  'vb',
  'vd',
  'vs',
  'bkz',
  'çev',
  'ed',
  'yay',
  'cilt',
  'sayı',
  's',
]);

// Sayı + nokta pattern'i (örn: "3.14", "1.", "2.")
const NUMBER_DOT_PATTERN = /^\d+\.$/;

/**
 * Metni cümlelere böler
 *
 * @param text - Bölünecek metin
 * @returns Cümle dizisi
 *
 * @example
 * ```ts
 * const sentences = splitIntoSentences("Dr. Ahmet geldi. Nasılsın?");
 * // ["Dr. Ahmet geldi.", "Nasılsın?"]
 * ```
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  // Cümle sınırlarını bul
  const sentences: string[] = [];
  let currentSentence = '';
  let i = 0;

  while (i < trimmed.length) {
    const char = trimmed[i];
    currentSentence += char;

    // Potansiyel cümle sonu karakterleri
    if (char === '.' || char === '!' || char === '?') {
      // Sonraki karakter boşluk veya metin sonu mu kontrol et
      const nextChar = trimmed[i + 1];
      const isEndOfText = i === trimmed.length - 1;
      const isFollowedBySpace =
        nextChar === ' ' || nextChar === '\n' || nextChar === '\t';
      const isFollowedByUppercase = nextChar && /[A-ZÇĞİÖŞÜА-Я]/.test(nextChar);

      if (char === '.' && !isEndOfText) {
        // Nokta için özel kontroller
        const wordBeforeDot = getWordBeforeDot(currentSentence);

        // Kısaltma kontrolü
        if (ABBREVIATIONS.has(wordBeforeDot.toLowerCase())) {
          i++;
          continue;
        }

        // Sayı kontrolü (örn: "3.14" veya liste numarası "1.")
        if (NUMBER_DOT_PATTERN.test(wordBeforeDot + '.')) {
          // Eğer sonraki karakter de sayıysa, ondalık sayıdır
          if (nextChar && /\d/.test(nextChar)) {
            i++;
            continue;
          }
        }

        // Üç nokta kontrolü (...)
        if (trimmed[i + 1] === '.' && trimmed[i + 2] === '.') {
          currentSentence += '..';
          i += 3;
          continue;
        }
      }

      // Cümle sonu olarak kabul et
      if (isEndOfText || isFollowedBySpace || isFollowedByUppercase) {
        const trimmedSentence = currentSentence.trim();
        if (trimmedSentence) {
          sentences.push(trimmedSentence);
        }
        currentSentence = '';
      }
    }

    i++;
  }

  // Kalan metni ekle
  const remaining = currentSentence.trim();
  if (remaining) {
    sentences.push(remaining);
  }

  return sentences;
}

/**
 * Cümle sonundaki noktadan önceki kelimeyi al
 */
function getWordBeforeDot(sentence: string): string {
  // Son noktayı çıkar
  const withoutDot = sentence.slice(0, -1).trim();
  // Son kelimeyi al
  const words = withoutDot.split(/\s+/);
  return words[words.length - 1] || '';
}

/**
 * Cümle sayısını hesapla
 */
export function countSentences(text: string): number {
  return splitIntoSentences(text).length;
}

/**
 * Metni paragraf ve cümlelere böl
 */
export function splitIntoParagraphsAndSentences(text: string): string[][] {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs
    .map((p) => splitIntoSentences(p))
    .filter((p) => p.length > 0);
}
