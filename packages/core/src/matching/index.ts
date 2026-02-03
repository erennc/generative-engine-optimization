/**
 * Matching module exports
 */

export {
  ExactMatcher,
  containsExact,
  findAllExactMatches,
} from './exact';

export {
  FuzzyMatcher,
  levenshteinDistance,
  jaccardSimilarity,
  ngramSimilarity,
  combinedSimilarity,
} from './fuzzy';
