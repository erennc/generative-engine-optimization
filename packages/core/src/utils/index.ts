/**
 * Utils module exports
 */

export {
  splitIntoSentences,
  countSentences,
  splitIntoParagraphsAndSentences,
} from './sentence-splitter';

export {
  tokenize,
  countWords,
  countUniqueWords,
  getWordFrequency,
  getNgrams,
  averageWordLength,
} from './tokenizer';

export {
  normalizeText,
  normalizeForComparison,
  createFingerprint,
  isBlank,
  stripHtml,
  extractUrls,
  removeUrls,
  type NormalizeOptions,
} from './text-normalizer';
