# GEO Metrikleri ve Web Scraping Kütüphanesi

Bu proje, Üretken Motorlarda (UE) kaynak görünürlüğünü ölçmek için kullanılan metrikleri hesaplayan ve web içeriği analizi yapan bir Python kütüphanesidir.

## Özellikler

### GEO Metrikleri
- Kelime Sayısı Metriği (Word Count Metric) hesaplama
- Konum Ağırlıklı Metrik (Position-Adjusted Metric) hesaplama
- Otoriter dil analizi
- İstatistik kullanımı analizi
- Öznel etki skoru hesaplama

### Web Scraping
- URL analizi ve doğrulama
- Web içeriği çekme ve analiz
- Türkçe karakter desteği
- İnteraktif kullanıcı arayüzü

## Kurulum

1. Gerekli bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

## Kullanım

### GEO Metrikleri

```python
from geo_metrics import GEOMetrics

# GEOMetrics sınıfını başlat
geo = GEOMetrics(lambda_decay=10)

# Örnek metinler
kaynak = "Bu önemli bir kaynak metindir."
yanit = "Bu önemli bir kaynak metindir ve bazı ek bilgiler içerir."

# Metrikleri hesapla
sonuclar = geo.calculate_metrics(kaynak, yanit)
print("Metrik Sonuçları:", sonuclar)
```

### Web Scraping

```python
from web_scraper import WebScraper

# Web scraper'ı başlat
scraper = WebScraper()

# URL'den içerik çek ve analiz et
url = "https://example.com"
sonuclar = scraper.scrape_and_analyze(url)
print("Analiz Sonuçları:", sonuclar)
```

## İnteraktif Kullanım

Web scraper'ı interaktif modda çalıştırmak için:

```bash
python test_web_scraper.py
```

## Testleri Çalıştırma

```bash
python -m unittest test_geo_metrics.py
```

## Formüller

### Kelime Sayısı Metriği
```
Imp_wc(c_i, r) = Σ(s ∈ S_c_i) |s| / Σ(s ∈ S_r) |s|
```

### Konum Ağırlıklı Metrik
```
Imp'_wc(c_i, r) = Σ(s ∈ S_c_i) |s| * e^(-pos(s)/λ) / Σ(s ∈ S_r) |s|
```

## Lisans

MIT 