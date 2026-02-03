/**
 * Semantic Metric Tests
 */

import { describe, it, expect } from 'vitest';
import { SemanticMetric, calculateSemanticSimilarity } from '../metrics/semantic';

describe('SemanticMetric', () => {
  describe('constructor', () => {
    it('should create with default parameters', () => {
      const metric = new SemanticMetric();
      expect(metric.name).toBe('semantic_similarity');
      expect(metric.description).toContain('Anlam bazlı');
    });

    it('should accept custom parameters', () => {
      const metric = new SemanticMetric(3, 0.7);
      expect(metric.name).toBe('semantic_similarity');
    });
  });

  describe('calculate', () => {
    const metric = new SemanticMetric();

    it('should return zero for empty texts', () => {
      const result = metric.calculate([], 0, {
        sourceText: '',
        responseText: '',
      });

      expect(result.value).toBe(0);
      expect(result.metadata).toHaveProperty('ngramSimilarity', 0);
      expect(result.metadata).toHaveProperty('jaccardSimilarity', 0);
    });

    it('should calculate high similarity for identical texts', () => {
      const text = 'Bu önemli bir test metnidir';
      
      const result = metric.calculate([], text.split(' ').length, {
        sourceText: text,
        responseText: text,
      });

      expect(result.value).toBeGreaterThan(0.9);
      expect(result.metadata.ngramSimilarity).toBeGreaterThan(0.9);
      expect(result.metadata.jaccardSimilarity).toBeGreaterThan(0.9);
    });

    it('should calculate medium similarity for related texts', () => {
      const result = metric.calculate([], 10, {
        sourceText: 'Einstein görelilik teorisini geliştirdi',
        responseText: 'Einstein görelilik teorisi ile fizik değişti',
      });

      expect(result.value).toBeGreaterThan(0.4);
      expect(result.value).toBeLessThan(0.9);
      expect(result.metadata.ngramSimilarity).toBeGreaterThan(0);
      expect(result.metadata.jaccardSimilarity).toBeGreaterThan(0);
    });

    it('should calculate low similarity for different texts', () => {
      const result = metric.calculate([], 8, {
        sourceText: 'Kedi evde uyuyor',
        responseText: 'Matematik ödev zor',
      });

      expect(result.value).toBeLessThan(0.3);
    });

    it('should respect custom threshold', () => {
      const highThreshold = 0.9;
      const result = metric.calculate([], 5, {
        sourceText: 'test metin',
        responseText: 'test metin benzer',
        threshold: highThreshold,
      });

      expect(result.metadata.threshold).toBe(highThreshold);
      expect(result.metadata.semanticMatches).toBeDefined();
    });

    it('should use custom ngram size', () => {
      const customNgramSize = 3;
      const result = metric.calculate([], 10, {
        sourceText: 'Bu uzun test metnidir gerçekten',
        responseText: 'Bu uzun test metnidir tamamen',
        ngramSize: customNgramSize,
      });

      expect(result.metadata.ngramSize).toBe(customNgramSize);
      expect(result.value).toBeGreaterThan(0);
    });
  });

  describe('explain', () => {
    const metric = new SemanticMetric();

    it('should provide explanation for high similarity', () => {
      const result = {
        name: 'semantic_similarity',
        value: 0.85,
        rawValue: 0.85,
        metadata: {
          ngramSimilarity: 0.9,
          jaccardSimilarity: 0.8,
          semanticMatches: 1,
          threshold: 0.6,
        },
      };

      const explanation = metric.explain(result, []);
      expect(explanation).toContain('85.0%');
      expect(explanation).toContain('Yüksek anlam benzerliği');
      expect(explanation).toContain('90.0%');
      expect(explanation).toContain('80.0%');
    });

    it('should provide explanation for low similarity', () => {
      const result = {
        name: 'semantic_similarity',
        value: 0.2,
        rawValue: 0.2,
        metadata: {
          ngramSimilarity: 0.1,
          jaccardSimilarity: 0.3,
          semanticMatches: 0,
          threshold: 0.6,
        },
      };

      const explanation = metric.explain(result, []);
      expect(explanation).toContain('20.0%');
      expect(explanation).toContain('Çok düşük anlam benzerliği');
    });
  });
});

describe('calculateSemanticSimilarity', () => {
  it('should calculate similarity between two texts', () => {
    const similarity = calculateSemanticSimilarity(
      'Einstein teorisi fizik',
      'Einstein teorisi bilim'
    );

    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });

  it('should return high similarity for identical texts', () => {
    const text = 'Aynı metin';
    const similarity = calculateSemanticSimilarity(text, text);

    expect(similarity).toBeGreaterThan(0.9);
  });

  it('should use custom ngram size', () => {
    const similarity = calculateSemanticSimilarity(
      'Uzun test metni örneği',
      'Uzun test metni farklı',
      3
    );

    expect(similarity).toBeGreaterThan(0);
    expect(similarity).toBeLessThanOrEqual(1);
  });
});