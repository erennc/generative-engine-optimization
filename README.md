# GEO Library

> Generative Engine Optimization - AI'ın içeriğe nasıl baktığını anlamak için açık kaynak kütüphane

[![npm version](https://img.shields.io/npm/v/@geo-lib/core.svg)](https://www.npmjs.com/package/@geo-lib/core)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](#)
[![CI Status](https://img.shields.io/github/actions/workflow/status/erennc/generative-engine-optimization/ci.yml?branch=main)](https://github.com/erennc/generative-engine-optimization/actions)

## GEO Nedir?

**Generative Engine Optimization (GEO)**, içeriklerinizin AI sistemlerinde (ChatGPT, Perplexity, Gemini, Claude vb.) nasıl göründüğünü analiz etmenizi sağlar.

- 🔍 **Görünürlük Analizi** - Kaynağınız AI yanıtlarında ne kadar yer alıyor?
- 📊 **Position Bias** - Erken pozisyonlar neden daha değerli?
- 🎯 **Eşleşme Detayları** - Hangi cümleler cite ediliyor?
- 🆓 **Ücretsiz & Local** - Zero dependency, tamamen local çalışır

## Kurulum

### Library

```bash
npm install @geo-lib/core
# veya
pnpm add @geo-lib/core
```

### CLI Tool

```bash
npm install -g @geo-lib/cli
# veya
npx @geo-lib/cli --help
```

## Hızlı Başlangıç

```typescript
import { GEO } from '@geo-lib/core';

const geo = new GEO();

const result = geo.analyze({
  source: "Einstein'ın görelilik teorisi fizik anlayışımızı değiştirdi.",
  response: "Einstein'ın görelilik teorisi modern fiziğin temelini oluşturur..."
});

console.log(result.visibility);    // 72 (0-100 arası skor)
console.log(result.explanation);   // Detaylı açıklama
console.log(result.matches);       // Bulunan eşleşmeler
```

### CLI Kullanımı

```bash
# Hızlı analiz
geo quick "Kaynak metin" "AI yanıtı"

# Dosyalarla analiz
geo analyze --source kaynak.txt --response yanit.txt

# Çoklu kaynak karşılaştırma  
geo compare --sources kaynak1.txt kaynak2.txt --response yanit.txt
```

## Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Word Count Metric** | Kaynak kelimelerinin yanıt içindeki oranı |
| **Position-Adjusted Metric** | Konum ağırlıklı görünürlük skoru |
| **Exact Matching** | Birebir metin eşleştirme |
| **Fuzzy Matching** | Benzer metin bulma (Levenshtein) |
| **Multi-source Analysis** | Çoklu kaynak karşılaştırma |
| **Human-readable Explanations** | Türkçe/İngilizce açıklamalar |

## Proje Yapısı

```
geo-lib/
├── packages/
│   └── core/              # @geo-lib/core - Ana kütüphane
├── apps/
│   └── cli/               # CLI aracı (yakında)
├── examples/              # Örnek kullanımlar
├── docs/                  # Dokümantasyon
└── archive/
    └── python/            # Orijinal Python implementasyonu
```

## Metrikler

### Word Count Metric (Imp_wc)
```
Imp_wc = Eşleşen kelimeler / Toplam yanıt kelimeleri
```

### Position-Adjusted Metric (Imp'_wc)
```
Imp'_wc = Σ(kelime_sayısı × e^(-pozisyon/λ)) / Toplam kelimeler
```

Bu metrik AI sistemlerinin "position bias" özelliğini modeller - erken pozisyonlardaki bilgiler daha fazla ağırlık alır.

## Gelişmiş Kullanım

### Çoklu Kaynak Analizi

```typescript
const result = geo.analyzeMultiple({
  sources: [
    "Birinci kaynak metin",
    "İkinci kaynak metin",
    "Üçüncü kaynak metin"
  ],
  response: "AI'ın verdiği uzun yanıt metni..."
});

// En görünür kaynağı bul
const bestSource = result.results.sort((a, b) => b.visibility - a.visibility)[0];
console.log(`En görünür: ${bestSource.visibility}%`);
```

### Özel Konfigürasyon

```typescript
const geo = new GEO({
  lambdaDecay: 5,           // Position decay factor (default: 10)
  fuzzyThreshold: 0.9,      // Fuzzy matching sensitivity (default: 0.8)
  matchers: ['exact'],      // Sadece exact matching kullan
  language: 'tr'            // Dil ayarı (tr/en/auto)
});
```

### Batch Processing

```typescript
const sources = ['metin1', 'metin2', 'metin3'];
const responses = ['yanıt1', 'yanıt2', 'yanıt3'];

const results = sources.map((source, i) => 
  geo.analyze({ source, response: responses[i] })
);

// Ortalama görünürlük
const avgVisibility = results.reduce((sum, r) => sum + r.visibility, 0) / results.length;
```

## Geliştirme

```bash
# Bağımlılıkları yükle
pnpm install

# Testleri çalıştır
pnpm test

# Build
pnpm build
```

## Referanslar

- [GEO: Generative Engine Optimization (Princeton)](https://arxiv.org/abs/2311.09735)
- [GEO-optim/GEO](https://github.com/GEO-optim/GEO)

## Lisans

MIT License - Tamamen özgür kullanım.

## Katkıda Bulunun

PR'lar ve issue'lar memnuniyetle karşılanır!
