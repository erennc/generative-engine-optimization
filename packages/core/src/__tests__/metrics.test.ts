/**
 * Metrics Tests
 */

import { describe, it, expect } from 'vitest';
import { WordCountMetric, calculateWordCountRatio } from '../metrics/word-count';
import {
  PositionAdjustedMetric,
  calculatePositionWeight,
  calculatePositionAdjustedRatio,
} from '../metrics/position-adjusted';
import type { MatchResult } from '../types';

describe('WordCountMetric', () => {
  const metric = new WordCountMetric();

  it('should calculate word count ratio', () => {
    const matches: MatchResult[] = [
      {
        sourceText: 'üç kelime var',
        matchedText: 'üç kelime var',
        position: 0,
        wordCount: 3,
        similarity: 1.0,
        type: 'exact',
      },
    ];

    const result = metric.calculate(matches, 10);

    expect(result.name).toBe('word_count');
    expect(result.value).toBe(0.3); // 3/10
  });

  it('should return 0 for zero total words', () => {
    const result = metric.calculate([], 0);
    expect(result.value).toBe(0);
  });

  it('should not exceed 1.0', () => {
    const matches: MatchResult[] = [
      {
        sourceText: 'çok fazla kelime',
        matchedText: 'çok fazla kelime',
        position: 0,
        wordCount: 100,
        similarity: 1.0,
        type: 'exact',
      },
    ];

    const result = metric.calculate(matches, 10);
    expect(result.value).toBeLessThanOrEqual(1);
  });

  it('should include metadata', () => {
    const matches: MatchResult[] = [
      {
        sourceText: 'test',
        matchedText: 'test',
        position: 0,
        wordCount: 5,
        similarity: 1.0,
        type: 'exact',
      },
    ];

    const result = metric.calculate(matches, 20);

    expect(result.metadata).toBeDefined();
    expect(result.metadata?.matchedWords).toBe(5);
    expect(result.metadata?.totalWords).toBe(20);
  });

  it('should generate explanation', () => {
    const matches: MatchResult[] = [];
    const result = metric.calculate(matches, 100);
    const explanation = metric.explain(result, matches);

    expect(explanation).toContain('Word Count');
  });
});

describe('PositionAdjustedMetric', () => {
  const metric = new PositionAdjustedMetric(10);

  it('should weight early positions higher', () => {
    const earlyMatch: MatchResult[] = [
      {
        sourceText: 'early',
        matchedText: 'early',
        position: 0,
        wordCount: 10,
        similarity: 1.0,
        type: 'exact',
      },
    ];

    const lateMatch: MatchResult[] = [
      {
        sourceText: 'late',
        matchedText: 'late',
        position: 10,
        wordCount: 10,
        similarity: 1.0,
        type: 'exact',
      },
    ];

    const earlyResult = metric.calculate(earlyMatch, 20);
    const lateResult = metric.calculate(lateMatch, 20);

    expect(earlyResult.value).toBeGreaterThan(lateResult.value);
  });

  it('should return 0 for zero total words', () => {
    const result = metric.calculate([], 0);
    expect(result.value).toBe(0);
  });

  it('should accept custom lambdaDecay', () => {
    const customMetric = new PositionAdjustedMetric(5);
    const matches: MatchResult[] = [
      {
        sourceText: 'test',
        matchedText: 'test',
        position: 5,
        wordCount: 10,
        similarity: 1.0,
        type: 'exact',
      },
    ];

    const result = customMetric.calculate(matches, 20);
    expect(result.metadata?.lambdaDecay).toBe(5);
  });
});

describe('calculatePositionWeight', () => {
  it('should return 1.0 for position 0', () => {
    const weight = calculatePositionWeight(0, 10);
    expect(weight).toBeCloseTo(1.0);
  });

  it('should decrease with position', () => {
    const weight0 = calculatePositionWeight(0, 10);
    const weight5 = calculatePositionWeight(5, 10);
    const weight10 = calculatePositionWeight(10, 10);

    expect(weight0).toBeGreaterThan(weight5);
    expect(weight5).toBeGreaterThan(weight10);
  });

  it('should be affected by lambdaDecay', () => {
    const weightSmallLambda = calculatePositionWeight(5, 5);
    const weightLargeLambda = calculatePositionWeight(5, 20);

    // Büyük lambda = daha yavaş decay
    expect(weightLargeLambda).toBeGreaterThan(weightSmallLambda);
  });
});

describe('calculateWordCountRatio', () => {
  it('should calculate simple ratio', () => {
    expect(calculateWordCountRatio(50, 100)).toBe(0.5);
    expect(calculateWordCountRatio(100, 100)).toBe(1.0);
    expect(calculateWordCountRatio(0, 100)).toBe(0);
  });

  it('should handle zero total', () => {
    expect(calculateWordCountRatio(50, 0)).toBe(0);
  });

  it('should cap at 1.0', () => {
    expect(calculateWordCountRatio(150, 100)).toBe(1.0);
  });
});

describe('calculatePositionAdjustedRatio', () => {
  it('should weight by position', () => {
    const matches = [
      { wordCount: 10, position: 0 },
      { wordCount: 10, position: 5 },
    ];

    const ratio = calculatePositionAdjustedRatio(matches, 40, 10);
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThanOrEqual(1);
  });
});
