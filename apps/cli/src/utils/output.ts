/**
 * Terminal output utilities
 * Pretty formatting for CLI results
 */

import type { AnalysisResult, MultiSourceAnalysisResult } from '@geo-lib/core';

/**
 * Progress bar oluştur
 */
export function createProgressBar(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Visibility badge
 */
function getVisibilityBadge(score: number): string {
  if (score >= 70) return '✅ Yüksek';
  if (score >= 40) return '⚡ Orta';
  if (score >= 10) return '⚠️  Düşük';
  return '❌ Çok Düşük';
}

/**
 * Pretty format - Ana analiz sonucu
 */
export function formatPrettyResult(result: AnalysisResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('╔══════════════════════════════════════════════════════════════╗');
  lines.push('║  GEO Analysis Results                                        ║');
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push('║                                                              ║');

  // Visibility score
  const scoreStr = result.visibility.toString().padStart(3);
  const progressBar = createProgressBar(result.visibility, 20);
  const badge = getVisibilityBadge(result.visibility);
  lines.push(`║  Visibility Score:     ${scoreStr}/100  ${progressBar}  ║`);
  lines.push(`║  Status:               ${badge.padEnd(37)}║`);
  lines.push('║                                                              ║');

  // Metrics
  lines.push('║  ─────────────────────────────────────────────────────────   ║');
  lines.push('║  Metrikler:                                                  ║');
  const wcValue = (result.metrics.wordCount.value * 100).toFixed(1);
  const paValue = (result.metrics.positionAdjusted.value * 100).toFixed(1);
  lines.push(`║    • Word Count:         ${wcValue.padStart(5)}%                            ║`);
  lines.push(`║    • Position-Adjusted:  ${paValue.padStart(5)}%                            ║`);
  lines.push('║                                                              ║');

  // Matches
  lines.push('║  ─────────────────────────────────────────────────────────   ║');
  lines.push(`║  Eşleşmeler: ${result.matches.length.toString().padEnd(48)}║`);

  const exactCount = result.matches.filter(m => m.type === 'exact').length;
  const fuzzyCount = result.matches.filter(m => m.type === 'fuzzy').length;

  if (exactCount > 0) {
    lines.push(`║    • ${exactCount} birebir eşleşme                                      ║`);
  }
  if (fuzzyCount > 0) {
    lines.push(`║    • ${fuzzyCount} benzer eşleşme                                        ║`);
  }

  // Top matches
  if (result.matches.length > 0) {
    lines.push('║                                                              ║');
    lines.push('║  En önemli eşleşmeler:                                       ║');

    const topMatches = result.matches.slice(0, 3);
    for (const match of topMatches) {
      const typeLabel = match.type === 'exact' ? '[Exact]' : '[Fuzzy]';
      const text = truncate(match.sourceText, 30);
      const similarity = match.type === 'fuzzy' ? ` (${Math.round(match.similarity * 100)}%)` : '';
      lines.push(`║    ${typeLabel.padEnd(8)} "${text}"${similarity.padEnd(10)}║`);
    }
  }

  lines.push('║                                                              ║');

  // Stats
  lines.push('║  ─────────────────────────────────────────────────────────   ║');
  lines.push('║  İstatistikler:                                              ║');
  lines.push(`║    • Kaynak: ${result.meta.sourceWordCount} kelime, ${result.meta.sourceSentenceCount} cümle                       ║`);
  lines.push(`║    • Yanıt:  ${result.meta.responseWordCount} kelime, ${result.meta.responseSentenceCount} cümle                       ║`);
  lines.push(`║    • İşlem:  ${result.meta.processingTime.toFixed(2)}ms                                     ║`);
  lines.push('║                                                              ║');
  lines.push('╚══════════════════════════════════════════════════════════════╝');
  lines.push('');

  return lines.join('\n');
}

/**
 * Minimal format
 */
export function formatMinimalResult(result: AnalysisResult): string {
  return `GEO Score: ${result.visibility}/100 | Matches: ${result.matches.length} | WC: ${(result.metrics.wordCount.value * 100).toFixed(1)}% | PA: ${(result.metrics.positionAdjusted.value * 100).toFixed(1)}%`;
}

/**
 * Compare result - Pretty format
 */
export function formatCompareResult(
  result: MultiSourceAnalysisResult,
  sourceNames: string[]
): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('╔══════════════════════════════════════════════════════════════╗');
  lines.push('║  GEO Compare Results                                         ║');
  lines.push('╠══════════════════════════════════════════════════════════════╣');
  lines.push('║                                                              ║');

  // Summary
  const mostVisibleName = sourceNames[result.summary.mostVisible];
  const avgScore = result.summary.averageVisibility.toFixed(1);
  lines.push(`║  En Görünür:  ${truncate(mostVisibleName, 40).padEnd(45)}║`);
  lines.push(`║  Ortalama:    ${avgScore}/100                                       ║`);
  lines.push('║                                                              ║');
  lines.push('║  ─────────────────────────────────────────────────────────   ║');
  lines.push('║  Sıralama:                                                   ║');
  lines.push('║                                                              ║');

  // Ranking
  for (let i = 0; i < result.summary.ranking.length; i++) {
    const idx = result.summary.ranking[i];
    const name = truncate(sourceNames[idx], 25);
    const score = result.sources[idx].result.visibility;
    const bar = createProgressBar(score, 15);
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    lines.push(`║  ${medal} ${(i + 1)}. ${name.padEnd(25)} ${score.toString().padStart(3)}/100 ${bar} ║`);
  }

  lines.push('║                                                              ║');
  lines.push('╚══════════════════════════════════════════════════════════════╝');
  lines.push('');

  return lines.join('\n');
}

/**
 * Compare result - JSON format
 */
export function formatCompareJson(
  result: MultiSourceAnalysisResult,
  sourceNames: string[]
): string {
  const output = {
    summary: {
      mostVisible: {
        index: result.summary.mostVisible,
        name: sourceNames[result.summary.mostVisible],
      },
      averageVisibility: result.summary.averageVisibility,
      ranking: result.summary.ranking.map((idx, rank) => ({
        rank: rank + 1,
        index: idx,
        name: sourceNames[idx],
        visibility: result.sources[idx].result.visibility,
      })),
    },
    sources: result.sources.map((s, i) => ({
      name: sourceNames[i],
      ...s.result,
    })),
  };

  return JSON.stringify(output, null, 2);
}

/**
 * Metin kısalt
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
