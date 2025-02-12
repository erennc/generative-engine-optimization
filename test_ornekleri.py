from geo_metrics import GEOMetrics

def test_yazdir(senaryo_no, kaynak, yanit):
    print(f"\n=== Senaryo {senaryo_no} ===")
    print(f"Kaynak: {kaynak}")
    print(f"Yanıt: {yanit}")
    
    geo = GEOMetrics(lambda_decay=10)
    sonuclar = geo.calculate_metrics(kaynak, yanit)
    
    print("\nTemel Metrikler:")
    print(f"- Kelime Sayısı Metriği: {sonuclar['word_count_metric']:.3f}")
    print(f"- Konum Ağırlıklı Metrik: {sonuclar['position_adjusted_metric']:.3f}")
    
    print("\nOtoriter Dil Analizi:")
    print(f"- Otorite Skoru: {sonuclar['authority_analysis']['authority_score']}")
    print(f"- Bulunan Kalıplar: {sonuclar['authority_analysis']['found_patterns']}")
    
    print("\nİstatistik Analizi:")
    print(f"- İstatistik Skoru: {sonuclar['statistics_analysis']['statistics_score']}")
    print(f"- Bulunan İstatistikler: {sonuclar['statistics_analysis']['found_statistics']}")
    
    print(f"\nÖznel Etki Skoru: {sonuclar['subjective_impression_score']:.3f}")

# Test Senaryoları

# Senaryo 1: Temel metin
test_yazdir(1,
    "Python programlama dili çok kullanışlıdır.",
    "Python programlama dili çok kullanışlıdır. Ayrıca öğrenmesi de kolaydır."
)

# Senaryo 2: Otoriter dil kullanımı
test_yazdir(2,
    "Yapay zeka önemlidir.",
    """Araştırmalar gösteriyor ki yapay zeka çok önemlidir. 
       Uzmanlar belirtiyor ki gelecekte her alanda kullanılacak."""
)

# Senaryo 3: İstatistik kullanımı
test_yazdir(3,
    "Yazılım sektörü büyüyor.",
    """İstatistikler gösteriyor ki yazılım sektörü 2023'te 35% büyüdü.
       Dünya genelinde 2.5 milyon yazılımcı bulunuyor."""
)

# Senaryo 4: Karma kullanım
test_yazdir(4,
    "Teknoloji hayatımızı değiştiriyor.",
    """Bilimsel veriler gösteriyor ki teknoloji hayatımızı değiştiriyor.
       2023'te teknoloji kullanımı 45% arttı.
       Uzmanlar belirtiyor ki 3.2 milyar insan aktif teknoloji kullanıcısı."""
)

# Senaryo 5: Optimizasyon örneği
test_yazdir(5,
    "E-ticaret önemlidir.",
    """Araştırmalar gösteriyor ki e-ticaret çok önemlidir.
       İstatistikler gösteriyor ki 2023'te online alışveriş 55% arttı.
       Uzmanlar belirtiyor ki gelecekte 4.5 milyar insan online alışveriş yapacak.
       Bilimsel veriler, e-ticaretin ekonominin temel taşı olduğunu kanıtlıyor."""
) 