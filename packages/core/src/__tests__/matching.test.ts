/**
 * Matching Tests
 */

import { describe, it, expect } from 'vitest';
import { ExactMatcher, containsExact } from '../matching/exact';
import {
  FuzzyMatcher,
  levenshteinDistance,
  jaccardSimilarity,
  ngramSimilarity,
} from '../matching/fuzzy';

describe('ExactMatcher', () => {
  const matcher = new ExactMatcher();

  it('should find exact matches', () => {
    const sources = ['Bu bir test cümlesi.'];
    const responses = ['Bu bir test cümlesi.', 'Başka bir cümle.'];

    const matches = matcher.findMatches(sources, responses);

    expect(matches.length).toBe(1);
    expect(matches[0].type).toBe('exact');
    expect(matches[0].similarity).toBe(1.0);
    expect(matches[0].position).toBe(0);
  });

  it('should find substring matches', () => {
    const sources = ['test cümlesi'];
    const responses = ['Bu bir test cümlesi içeren yanıt.'];

    const matches = matcher.findMatches(sources, responses);

    expect(matches.length).toBe(1);
  });

  it('should be case insensitive by default', () => {
    const sources = ['TEST CÜMLE'];
    const responses = ['test cümle'];

    const matches = matcher.findMatches(sources, responses);

    expect(matches.length).toBe(1);
  });

  it('should return empty for no match', () => {
    const sources = ['farklı metin'];
    const responses = ['alakasız yanıt'];

    const matches = matcher.findMatches(sources, responses);

    expect(matches.length).toBe(0);
  });

  it('should calculate similarity', () => {
    expect(matcher.similarity('aynı metin', 'aynı metin')).toBe(1.0);
    expect(matcher.similarity('farklı', 'tamamen başka')).toBe(0.0);
  });
});

describe('containsExact', () => {
  it('should check substring presence', () => {
    expect(containsExact('test', 'bu bir test')).toBe(true);
    expect(containsExact('yok', 'bu bir test')).toBe(false);
  });

  it('should handle case sensitivity', () => {
    expect(containsExact('TEST', 'bu bir test', false)).toBe(true);
    expect(containsExact('TEST', 'bu bir test', true)).toBe(false);
  });
});

describe('FuzzyMatcher', () => {
  const matcher = new FuzzyMatcher(0.7);

  it('should find fuzzy matches above threshold', () => {
    const sources = ['Bu bir test cümlesidir.'];
    const responses = ['Bu bir test cümlesi.', 'Tamamen farklı.'];

    const matches = matcher.findMatches(sources, responses, { threshold: 0.7 });

    expect(matches.length).toBe(1);
    expect(matches[0].type).toBe('fuzzy');
    expect(matches[0].similarity).toBeGreaterThanOrEqual(0.7);
  });

  it('should return empty for low similarity', () => {
    const sources = ['tamamen farklı bir metin'];
    const responses = ['hiç alakası olmayan yanıt'];

    const matches = matcher.findMatches(sources, responses, { threshold: 0.9 });

    expect(matches.length).toBe(0);
  });

  it('should calculate similarity correctly', () => {
    // Aynı metin
    expect(matcher.similarity('test', 'test')).toBe(1.0);

    // Çok benzer
    expect(matcher.similarity('test', 'tast')).toBeGreaterThan(0.7);

    // Tamamen farklı
    expect(matcher.similarity('abc', 'xyz')).toBeLessThan(0.5);
  });
});

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('test', 'test')).toBe(0);
  });

  it('should count single character changes', () => {
    expect(levenshteinDistance('test', 'tast')).toBe(1); // substitution
    expect(levenshteinDistance('test', 'tests')).toBe(1); // insertion
    expect(levenshteinDistance('test', 'tes')).toBe(1); // deletion
  });

  it('should handle empty strings', () => {
    expect(levenshteinDistance('', 'test')).toBe(4);
    expect(levenshteinDistance('test', '')).toBe(4);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should calculate complex differences', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });
});

describe('jaccardSimilarity', () => {
  it('should return 1.0 for identical texts', () => {
    expect(jaccardSimilarity('aynı kelimeler', 'aynı kelimeler')).toBe(1.0);
  });

  it('should return 0 for no common words', () => {
    expect(jaccardSimilarity('bir iki üç', 'dört beş altı')).toBe(0);
  });

  it('should calculate partial overlap', () => {
    const sim = jaccardSimilarity('bir iki üç', 'bir iki dört');
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });
});

describe('ngramSimilarity', () => {
  it('should return 1.0 for identical texts', () => {
    expect(ngramSimilarity('test metin', 'test metin', 2)).toBe(1.0);
  });

  it('should handle different n values', () => {
    const text1 = 'bu bir test metnidir';
    const text2 = 'bu bir deneme metnidir';

    const bigram = ngramSimilarity(text1, text2, 2);
    const trigram = ngramSimilarity(text1, text2, 3);

    // Her ikisi de 0-1 arasında olmalı
    expect(bigram).toBeGreaterThanOrEqual(0);
    expect(bigram).toBeLessThanOrEqual(1);
    expect(trigram).toBeGreaterThanOrEqual(0);
    expect(trigram).toBeLessThanOrEqual(1);
  });
});
