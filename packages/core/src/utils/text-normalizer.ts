/**
 * Text Normalizer
 *
 * Metin karşılaştırması için normalizasyon fonksiyonları.
 * Zero dependency - native JavaScript implementation.
 */

/**
 * Metni normalize et (karşılaştırma için)
 *
 * @param text - Normalize edilecek metin
 * @param options - Normalizasyon seçenekleri
 * @returns Normalize edilmiş metin
 */
export function normalizeText(
  text: string,
  options: NormalizeOptions = {}
): string {
  const {
    lowercase = true,
    removeExtraSpaces = true,
    removePunctuation = false,
    removeDiacritics = false,
    trim = true,
  } = options;

  let result = text;

  // Küçük harfe çevir
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Diacritics kaldır (opsiyonel - Türkçe için dikkatli kullan)
  if (removeDiacritics) {
    result = removeDiacriticsFromText(result);
  }

  // Noktalama işaretlerini kaldır
  if (removePunctuation) {
    result = result.replace(/[^\p{L}\p{N}\s]/gu, '');
  }

  // Fazla boşlukları temizle
  if (removeExtraSpaces) {
    result = result.replace(/\s+/g, ' ');
  }

  // Trim
  if (trim) {
    result = result.trim();
  }

  return result;
}

export interface NormalizeOptions {
  /** Küçük harfe çevir (varsayılan: true) */
  lowercase?: boolean;
  /** Fazla boşlukları temizle (varsayılan: true) */
  removeExtraSpaces?: boolean;
  /** Noktalama işaretlerini kaldır (varsayılan: false) */
  removePunctuation?: boolean;
  /** Aksanları kaldır (varsayılan: false) - Türkçe için dikkat! */
  removeDiacritics?: boolean;
  /** Baş ve sondaki boşlukları temizle (varsayılan: true) */
  trim?: boolean;
}

/**
 * Aksanları/diacritics kaldır
 * NOT: Bu Türkçe karakterleri de etkiler (ş->s, ö->o, vb.)
 * Dikkatli kullanın!
 */
function removeDiacriticsFromText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * İki metni karşılaştırma için normalize et
 */
export function normalizeForComparison(text: string): string {
  return normalizeText(text, {
    lowercase: true,
    removeExtraSpaces: true,
    removePunctuation: false,
    trim: true,
  });
}

/**
 * Metni hash'lemek için basit fingerprint oluştur
 * (Hızlı karşılaştırma için)
 */
export function createFingerprint(text: string): string {
  const normalized = normalizeForComparison(text);
  // Basit hash: ilk 3 karakter + uzunluk + son 3 karakter
  const len = normalized.length;
  if (len <= 6) return normalized;
  return `${normalized.slice(0, 3)}${len}${normalized.slice(-3)}`;
}

/**
 * Boş veya sadece whitespace mi kontrol et
 */
export function isBlank(text: string | null | undefined): boolean {
  return !text || text.trim().length === 0;
}

/**
 * HTML tag'lerini temizle
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
}

/**
 * URL'leri metinden çıkar
 */
export function extractUrls(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  return text.match(urlPattern) || [];
}

/**
 * URL'leri metinden kaldır
 */
export function removeUrls(text: string): string {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  return text.replace(urlPattern, '').replace(/\s+/g, ' ').trim();
}
