# @geo-lib/cli

> Terminal'den AI görünürlük analizi

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## Kurulum

```bash
npm install -g @geo-lib/cli
# veya
pnpm add -g @geo-lib/cli
# veya
npx @geo-lib/cli
```

## Kullanım

### analyze - Tek kaynak analizi

```bash
geo analyze --source kaynak.txt --response yanit.txt
```

**Seçenekler:**
- `-s, --source <file>` - Kaynak metin dosyası (zorunlu)
- `-r, --response <file>` - AI yanıt dosyası (zorunlu)
- `-f, --format <type>` - Çıktı formatı: `pretty` | `json` | `minimal` (varsayılan: pretty)
- `-q, --query <text>` - Opsiyonel sorgu metni

**Örnek çıktı:**

```
╔══════════════════════════════════════════════════════════════╗
║  GEO Analysis Results                                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Visibility Score:      72/100  ████████████████░░░░          ║
║  Status:               ✅ Yüksek                              ║
║                                                              ║
║  Metrikler:                                                  ║
║    • Word Count:          65.0%                              ║
║    • Position-Adjusted:   78.0%                              ║
║                                                              ║
║  Eşleşmeler: 3                                               ║
║    • 2 birebir eşleşme                                       ║
║    • 1 benzer eşleşme                                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### compare - Çoklu kaynak karşılaştırması

```bash
geo compare --sources kaynak1.txt kaynak2.txt kaynak3.txt --response yanit.txt
```

**Seçenekler:**
- `--sources <files...>` - Kaynak metin dosyaları (zorunlu)
- `-r, --response <file>` - AI yanıt dosyası (zorunlu)
- `-f, --format <type>` - Çıktı formatı: `pretty` | `json` (varsayılan: pretty)

**Örnek çıktı:**

```
╔══════════════════════════════════════════════════════════════╗
║  GEO Compare Results                                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  En Görünür:  kaynak1.txt                                    ║
║  Ortalama:    45.3/100                                       ║
║                                                              ║
║  Sıralama:                                                   ║
║  🥇 1. kaynak1.txt             72/100 ████████████░░░        ║
║  🥈 2. kaynak3.txt             45/100 ███████░░░░░░░░        ║
║  🥉 3. kaynak2.txt             19/100 ███░░░░░░░░░░░░        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### quick - Hızlı skor

```bash
geo quick "Kaynak metin" "AI yanıtı"
```

Dosya yerine doğrudan metin girişi ile hızlı skor alın.

## JSON Çıktı

Tüm komutlarda `--format json` kullanarak JSON çıktısı alabilirsiniz:

```bash
geo analyze --source kaynak.txt --response yanit.txt --format json
```

Bu, sonuçları programatik olarak işlemeniz gerektiğinde kullanışlıdır.

## Lisans

MIT License
