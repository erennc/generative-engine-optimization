/**
 * Utils Tests
 */

import { describe, it, expect } from 'vitest';
import {
  splitIntoSentences,
  countSentences,
} from '../utils/sentence-splitter';
import {
  tokenize,
  countWords,
  countUniqueWords,
  getWordFrequency,
  getNgrams,
} from '../utils/tokenizer';
import {
  normalizeText,
  normalizeForComparison,
  isBlank,
  stripHtml,
} from '../utils/text-normalizer';

describe('splitIntoSentences', () => {
  it('should split by period', () => {
    const sentences = splitIntoSentences('Birinci cümle. İkinci cümle.');
    expect(sentences).toEqual(['Birinci cümle.', 'İkinci cümle.']);
  });

  it('should split by question mark', () => {
    const sentences = splitIntoSentences('Bu ne? Bu da ne?');
    expect(sentences).toEqual(['Bu ne?', 'Bu da ne?']);
  });

  it('should split by exclamation', () => {
    const sentences = splitIntoSentences('Merhaba! Nasılsın!');
    expect(sentences).toEqual(['Merhaba!', 'Nasılsın!']);
  });

  it('should handle mixed punctuation', () => {
    const sentences = splitIntoSentences('Bu bir cümle. Bu soru mu? Evet!');
    expect(sentences.length).toBe(3);
  });

  it('should handle abbreviations', () => {
    const sentences = splitIntoSentences('Dr. Ahmet geldi. Merhaba.');
    expect(sentences.length).toBe(2);
  });

  it('should return empty array for empty input', () => {
    expect(splitIntoSentences('')).toEqual([]);
    expect(splitIntoSentences('   ')).toEqual([]);
  });

  it('should handle single sentence without punctuation', () => {
    const sentences = splitIntoSentences('Nokta olmayan cümle');
    expect(sentences).toEqual(['Nokta olmayan cümle']);
  });
});

describe('countSentences', () => {
  it('should count sentences correctly', () => {
    expect(countSentences('Bir. İki. Üç.')).toBe(3);
    expect(countSentences('Tek cümle')).toBe(1);
    expect(countSentences('')).toBe(0);
  });
});

describe('tokenize', () => {
  it('should split into words', () => {
    const words = tokenize('Bu bir test cümlesidir');
    expect(words).toEqual(['Bu', 'bir', 'test', 'cümlesidir']);
  });

  it('should remove punctuation', () => {
    const words = tokenize('Merhaba, dünya! Nasılsın?');
    expect(words).toEqual(['Merhaba', 'dünya', 'Nasılsın']);
  });

  it('should handle Turkish characters', () => {
    const words = tokenize('Türkçe özel karakterler: ğüşıöç');
    expect(words).toContain('ğüşıöç');
  });

  it('should return empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('countWords', () => {
  it('should count words correctly', () => {
    expect(countWords('bir iki üç')).toBe(3);
    expect(countWords('tek')).toBe(1);
    expect(countWords('')).toBe(0);
  });
});

describe('countUniqueWords', () => {
  it('should count unique words', () => {
    expect(countUniqueWords('bir bir iki')).toBe(2);
    expect(countUniqueWords('a b c')).toBe(3);
  });

  it('should handle case sensitivity', () => {
    expect(countUniqueWords('Test test TEST', false)).toBe(1);
    expect(countUniqueWords('Test test TEST', true)).toBe(3);
  });
});

describe('getWordFrequency', () => {
  it('should count word frequencies', () => {
    const freq = getWordFrequency('bir bir iki iki iki üç');
    expect(freq.get('bir')).toBe(2);
    expect(freq.get('iki')).toBe(3);
    expect(freq.get('üç')).toBe(1);
  });
});

describe('getNgrams', () => {
  it('should generate bigrams', () => {
    const bigrams = getNgrams('bir iki üç dört', 2);
    expect(bigrams).toEqual(['bir iki', 'iki üç', 'üç dört']);
  });

  it('should generate trigrams', () => {
    const trigrams = getNgrams('bir iki üç dört', 3);
    expect(trigrams).toEqual(['bir iki üç', 'iki üç dört']);
  });

  it('should return empty for short text', () => {
    expect(getNgrams('tek', 2)).toEqual([]);
  });
});

describe('normalizeText', () => {
  it('should lowercase by default', () => {
    expect(normalizeText('TEST')).toBe('test');
  });

  it('should remove extra spaces', () => {
    expect(normalizeText('çok   fazla    boşluk')).toBe('çok fazla boşluk');
  });

  it('should trim', () => {
    expect(normalizeText('  metin  ')).toBe('metin');
  });

  it('should optionally remove punctuation', () => {
    expect(normalizeText('test!', { removePunctuation: true })).toBe('test');
  });
});

describe('normalizeForComparison', () => {
  it('should normalize for comparison', () => {
    const a = normalizeForComparison('  TEST  Metin  ');
    const b = normalizeForComparison('test metin');
    expect(a).toBe(b);
  });
});

describe('isBlank', () => {
  it('should detect blank strings', () => {
    expect(isBlank('')).toBe(true);
    expect(isBlank('   ')).toBe(true);
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank('text')).toBe(false);
  });
});

describe('stripHtml', () => {
  it('should remove HTML tags', () => {
    expect(stripHtml('<p>Test</p>')).toBe('Test');
    expect(stripHtml('<b>Bold</b> text')).toBe('Bold text');
  });
});
