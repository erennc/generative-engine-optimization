from web_scraper import WebScraper

def test_yazdir(senaryo_no, url):
    print(f"\n=== Senaryo {senaryo_no} ===")
    print(f"URL: {url}")
    
    scraper = WebScraper()
    sonuclar = scraper.scrape_and_analyze(url)
    
    print("\nURL Analizi:")
    print(f"- Protokol: {sonuclar['url_analysis']['scheme']}")
    print(f"- Domain: {sonuclar['url_analysis']['domain']}")
    print(f"- Yol: {sonuclar['url_analysis']['path']}")
    
    if sonuclar['success']:
        print("\nİçerik Analizi:")
        print(f"- Başlık: {sonuclar['title']}")
        print(f"- İçerik Uzunluğu: {sonuclar['content_length']} karakter")
        print(f"- İçerikten Örnek: {sonuclar['content'][:200]}...")
    else:
        print(f"\nHata: {sonuclar.get('error', 'Bilinmeyen hata')}")

# Test Senaryoları

# Senaryo 1: Basit web sitesi
test_yazdir(1, "https://example.com")

# Senaryo 2: Wikipedia makalesi
test_yazdir(2, "https://tr.wikipedia.org/wiki/Python_(programlama_dili)")

# Senaryo 3: Blog yazısı
test_yazdir(3, "https://medium.com/")

# Senaryo 4: Haber sitesi
test_yazdir(4, "https://www.bbc.com/news") 