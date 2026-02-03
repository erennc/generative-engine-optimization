from geo_metrics import GEOMetrics

def test_yazdir(senaryo_no, kaynak, yanit):
    print(f"\n=== Senaryo {senaryo_no} ===")
    print(f"Kaynak: {kaynak}")
    print(f"Yanıt: {yanit}")
    
    geo = GEOMetrics(lambda_decay=10)
    sonuclar = geo.calculate_metrics(kaynak, yanit)
    
    print("\nSonuçlar:")
    print(f"Kelime Sayısı Metriği: {sonuclar['word_count_metric']:.3f}")
    print(f"Konum Ağırlıklı Metrik: {sonuclar['position_adjusted_metric']:.3f}")
    print(f"Kaynak Pozisyonları: {sonuclar['source_positions']}")

# Test Senaryoları
# Senaryo 1: Basit eşleşme
test_yazdir(1,
    "Python programlama dili çok kullanışlıdır.",
    "Python programlama dili çok kullanışlıdır. Ayrıca öğrenmesi de kolaydır."
)

# Senaryo 2: Çoklu cümle
test_yazdir(2,
    "Python harikadır. Çok yetenekli bir dildir.",
    "Programlama önemlidir. Python harikadır. Başka diller de var. Çok yetenekli bir dildir."
)

# Senaryo 3: Kısmi eşleşme
test_yazdir(3,
    "Yapay zeka çok önemlidir. Gelecekte her yerde olacak.",
    "Yapay zeka çok önemlidir. Teknoloji gelişiyor. Gelecekte farklı şeyler olacak."
)

# Senaryo 4: Farklı sıralama
test_yazdir(4,
    "İlk cümle budur. Son cümle de budur.",
    "Son cümle de budur. Ortada başka bir şey var. İlk cümle budur."
)

# Senaryo 5: Türkçe karakterler
test_yazdir(5,
    "Şükrü Şükrü'ye şükür etti. Çiçekçi çiçekleri çok sevdi.",
    "Şükrü Şükrü'ye şükür etti. Başka bir şey oldu. Çiçekçi çiçekleri çok sevdi."
) 