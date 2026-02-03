/**
 * GEO Main Class Tests
 */

import { describe, it, expect } from 'vitest';
import { GEO } from '../geo';

describe('GEO', () => {
  describe('analyze', () => {
    it('should analyze source visibility in response', () => {
      const geo = new GEO();

      const result = geo.analyze({
        source: 'Bu önemli bir kaynak metindir.',
        response: 'Bu önemli bir kaynak metindir. Ek bilgiler de var.',
      });

      expect(result.visibility).toBeGreaterThan(0);
      expect(result.visibility).toBeLessThanOrEqual(100);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.explanation).toBeTruthy();
    });

    it('should return zero visibility for no match', () => {
      const geo = new GEO();

      const result = geo.analyze({
        source: 'Tamamen farklı bir metin.',
        response: 'Hiç alakası olmayan başka bir yanıt.',
      });

      expect(result.visibility).toBeLessThan(50);
      expect(result.matches.length).toBe(0);
    });

    it('should return high visibility for exact match', () => {
      const geo = new GEO();
      const text = 'Bu metin birebir eşleşecek.';

      const result = geo.analyze({
        source: text,
        response: text,
      });

      expect(result.visibility).toBeGreaterThan(70);
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].type).toBe('exact');
    });

    it('should throw error for missing source', () => {
      const geo = new GEO();

      expect(() => {
        geo.analyze({
          source: '',
          response: 'Bir yanıt',
        });
      }).toThrow();
    });

    it('should throw error for missing response', () => {
      const geo = new GEO();

      expect(() => {
        geo.analyze({
          source: 'Bir kaynak',
          response: '',
        });
      }).toThrow();
    });

    it('should include processing time in meta', () => {
      const geo = new GEO();

      const result = geo.analyze({
        source: 'Test kaynak metni.',
        response: 'Test kaynak metni burada kullanılıyor.',
      });

      expect(result.meta.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should count sentences correctly', () => {
      const geo = new GEO();

      const result = geo.analyze({
        source: 'Birinci cümle. İkinci cümle.',
        response: 'Birinci cümle. İkinci cümle. Üçüncü cümle.',
      });

      expect(result.meta.sourceSentenceCount).toBe(2);
      expect(result.meta.responseSentenceCount).toBe(3);
    });
  });

  describe('analyzeMultiple', () => {
    it('should analyze multiple sources', () => {
      const geo = new GEO();

      const result = geo.analyzeMultiple({
        sources: [
          'Birinci kaynak metni.',
          'İkinci kaynak farklı içerik.',
          'Üçüncü kaynak da var.',
        ],
        response: 'Birinci kaynak metni burada. İkinci kaynak da var.',
      });

      expect(result.sources.length).toBe(3);
      expect(result.summary.mostVisible).toBeDefined();
      expect(result.summary.ranking.length).toBe(3);
    });

    it('should rank sources by visibility', () => {
      const geo = new GEO();

      const result = geo.analyzeMultiple({
        sources: [
          'Hiç eşleşmeyecek kaynak.',
          'Bu metin tam olarak kullanılacak.',
        ],
        response: 'Bu metin tam olarak kullanılacak.',
      });

      // İkinci kaynak (index 1) daha görünür olmalı
      expect(result.summary.mostVisible).toBe(1);
    });

    it('should throw error for empty sources', () => {
      const geo = new GEO();

      expect(() => {
        geo.analyzeMultiple({
          sources: [],
          response: 'Bir yanıt',
        });
      }).toThrow();
    });
  });

  describe('quickScore', () => {
    it('should return visibility score directly', () => {
      const geo = new GEO();

      const score = geo.quickScore(
        'Hızlı test metni.',
        'Hızlı test metni kullanıldı.'
      );

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('getInsights', () => {
    it('should generate insights for high visibility', () => {
      const geo = new GEO();
      const text = 'Bu metin yüksek görünürlüğe sahip olacak.';

      const result = geo.analyze({
        source: text,
        response: text,
      });

      const insights = geo.getInsights(result);
      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('configuration', () => {
    it('should accept custom lambdaDecay', () => {
      const geo = new GEO({ lambdaDecay: 5 });

      const result = geo.analyze({
        source: 'Test kaynak.',
        response: 'Test kaynak burada.',
      });

      expect(result).toBeDefined();
    });

    it('should accept custom fuzzyThreshold', () => {
      const geo = new GEO({ fuzzyThreshold: 0.9 });

      const result = geo.analyze({
        source: 'Fuzzy test metni.',
        response: 'Fuzzy test metni değiştirildi.',
      });

      expect(result).toBeDefined();
    });
  });
});
