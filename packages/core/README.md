# @geo-lib/core

> AI'ın içeriğe nasıl baktığını anlamak için açık kaynak kütüphane

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](#)

## Özellikler

- 🚀 **Zero Dependency** - Hiç harici bağımlılık yok
- 🔒 **Local First** - Tüm hesaplamalar local'de yapılır
- 📊 **GEO Metrikleri** - Word Count & Position-Adjusted metrics
- 🔍 **Akıllı Eşleştirme** - Exact + Fuzzy matching
- 📝 **Açıklamalar** - İnsan okunabilir sonuç açıklamaları
- 🌍 **Çoklu Dil** - Türkçe ve İngilizce desteği

## Kurulum

```bash
npm install @geo-lib/core
# veya
pnpm add @geo-lib/core
# veya
yarn add @geo-lib/core
```

## Hızlı Başlangıç

```typescript
import { GEO } from '@geo-lib/core';

const geo = new GEO();

const result = geo.analyze({
  source: "Einstein'ın görelilik teorisi fizik anlayışımızı değiştirdi.",
  response: "Einstein'ın görelilik teorisi modern fiziğin temelini oluşturur ve fizik anlayışımızı değiştirdi."
});

console.log(result.visibility);    // 72 (0-100 arası skor)
console.log(result.explanation);   // İnsan okunabilir açıklama
console.log(result.matches);       // Bulunan eşleşmeler
```

## API

### `GEO` Class

#### Constructor

```typescript
const geo = new GEO({
  lambdaDecay: 10,        // Position decay faktörü (varsayılan: 10)
  fuzzyThreshold: 0.8,    // Fuzzy eşleşme eşiği (varsayılan: 0.8)
  matchers: ['exact', 'fuzzy'], // Kullanılacak matcher'lar
});
```

#### `analyze(input)`

Tek kaynak analizi yapar.

```typescript
const result = geo.analyze({
  source: "Kaynak metin",
  response: "AI yanıtı",
  query: "Opsiyonel sorgu" // opsiyonel
});
```

**Dönüş:**
```typescript
{
  visibility: number;      // 0-100 arası görünürlük skoru
  metrics: {
    wordCount: MetricResult;
    positionAdjusted: MetricResult;
  };
  matches: MatchResult[];  // Bulunan eşleşmeler
  explanation: string;     // İnsan okunabilir açıklama
  meta: AnalysisMeta;      // İstatistikler
}
```

#### `analyzeMultiple(input)`

Çoklu kaynak karşılaştırması yapar.

```typescript
const result = geo.analyzeMultiple({
  sources: ["Kaynak 1", "Kaynak 2", "Kaynak 3"],
  response: "AI yanıtı"
});

console.log(result.summary.mostVisible);     // En görünür kaynak indexi
console.log(result.summary.ranking);         // Görünürlük sıralaması
```

#### `quickScore(source, response)`

Hızlı görünürlük skoru döndürür.

```typescript
const score = geo.quickScore("Kaynak", "Yanıt");
console.log(score); // 0-100
```

### Utilities

```typescript
import {
  splitIntoSentences,
  countWords,
  tokenize,
  normalizeText,
  levenshteinDistance,
} from '@geo-lib/core';

// Cümlelere böl
const sentences = splitIntoSentences("İlk cümle. İkinci cümle.");

// Kelime say
const count = countWords("Bu beş kelimelik bir cümle");

// Levenshtein mesafesi
const distance = levenshteinDistance("test", "tast");
```

## Metrikler

### Word Count Metric (Imp_wc)

Kaynak metinden yanıta geçen kelimelerin basit oranı.

```
Imp_wc = Eşleşen kelimeler / Toplam yanıt kelimeleri
```

### Position-Adjusted Metric (Imp'_wc)

Konum ağırlıklı görünürlük. Erken pozisyonlara daha fazla ağırlık verir.

```
Imp'_wc = Σ(kelime_sayısı × e^(-pozisyon/λ)) / Toplam kelimeler
```

Bu metrik AI sistemlerinin "position bias" özelliğini modeller.

## Neden GEO?

AI sistemleri (ChatGPT, Perplexity, Gemini) giderek daha fazla bilgi kaynağı olarak kullanılıyor. Bu kütüphane:

1. **Görünürlüğünüzü ölçer** - İçeriğiniz AI yanıtlarında ne kadar yer alıyor?
2. **Position bias'ı analiz eder** - Erken pozisyonlar neden daha değerli?
3. **Eşleşmeleri detaylandırır** - Hangi cümleler cite ediliyor?
4. **Ücretsiz ve açık kaynak** - Hiç maliyet yok, local çalışır

## Lisans

MIT License - Tamamen özgür kullanım.

## Katkıda Bulunun

PR'lar ve issue'lar memnuniyetle karşılanır!

```bash
# Geliştirme
pnpm install
pnpm test
pnpm build
```
