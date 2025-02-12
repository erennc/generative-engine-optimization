# GEO Metrikleri Hesaplama Kütüphanesi

Bu proje, Üretken Motorlarda (UE) kaynak görünürlüğünü ölçmek için kullanılan metrikleri hesaplayan bir Python kütüphanesidir.

## Özellikler

- Kelime Sayısı Metriği (Word Count Metric) hesaplama
- Konum Ağırlıklı Metrik (Position-Adjusted Metric) hesaplama
- Kapsamlı test suite

## Kurulum

1. Gerekli bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

## Kullanım

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