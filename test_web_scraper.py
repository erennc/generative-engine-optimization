from web_scraper import WebScraper
from sitemap_generator import SitemapGenerator
from schema_analyzer import SchemaAnalyzer
from seo_analyzer import SEOAnalyzer
from geo_analyzer import GEOAnalyzer
import sys
import argparse
import re
from urllib.parse import quote, urlparse, urlunparse
import json
import os
from datetime import datetime

def encode_url(url):
    """URL'deki Türkçe karakterleri encode eder."""
    parsed = urlparse(url)
    # Path'i encode et
    encoded_path = quote(parsed.path, safe='/:?=&')
    # URL'yi yeniden oluştur
    return urlunparse((
        parsed.scheme,
        parsed.netloc,
        encoded_path,
        parsed.params,
        parsed.query,
        parsed.fragment
    ))

def is_valid_url(url):
    """URL'nin geçerli olup olmadığını kontrol eder."""
    if not url:
        return False
    
    # Basit URL doğrulama
    url_pattern = re.compile(
        r'^https?://'  # http:// veya https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
        r'(?::\d+)?'  # port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return url_pattern.match(url) is not None

def test_yazdir(url, aciklama=""):
    if not is_valid_url(url):
        print("\nHata: Geçersiz URL formatı!")
        print("Örnek format: https://www.example.com")
        return
    
    # URL'yi encode et
    encoded_url = encode_url(url)
    if encoded_url != url:
        print(f"\nBilgi: URL encode edildi:")
        print(f"Orijinal: {url}")
        print(f"Encoded : {encoded_url}")
    
    print(f"\n=== URL Analizi: {aciklama} ===")
    print(f"URL: {encoded_url}")
    
    try:
        scraper = WebScraper()
        sonuclar = scraper.scrape_and_analyze(encoded_url)
        
        print("\nURL Analizi:")
        print(f"- Protokol: {sonuclar['url_analysis']['scheme']}")
        print(f"- Domain: {sonuclar['url_analysis']['domain']}")
        print(f"- Yol: {sonuclar['url_analysis']['path']}")
        
        if sonuclar['success']:
            print("\nİçerik Analizi:")
            print(f"- Başlık: {sonuclar['title']}")
            print(f"- İçerik Uzunluğu: {sonuclar['content_length']} karakter")
            print("\n- İçerikten İlk 200 Karakter:")
            print("-" * 50)
            print(f"{sonuclar['content'][:200]}...")
            print("-" * 50)
        else:
            print(f"\nHata: {sonuclar.get('error', 'Bilinmeyen hata')}")
    except Exception as e:
        print(f"\nHata: İşlem sırasında bir hata oluştu - {str(e)}")

def save_analysis_results(results: dict, analysis_type: str):
    """Analiz sonuçlarını JSON dosyasına kaydeder."""
    # results klasörünü oluştur
    if not os.path.exists('results'):
        os.makedirs('results')
    
    # Dosya adını oluştur
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'results/{analysis_type}_analysis_{timestamp}.json'
    
    # Sonuçları kaydet
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nSonuçlar {filename} dosyasına kaydedildi.")

def analyze_url():
    """URL analizi yapar."""
    url = input("\nAnaliz edilecek URL'yi girin: ")
    
    print("\nAnaliz türünü seçin:")
    print("1. SEO Analizi")
    print("2. GEO Analizi")
    print("3. Her İkisi")
    choice = input("Seçiminiz (1-3): ")
    
    if choice in ['1', '3']:
        print("\nSEO analizi yapılıyor...")
        seo_analyzer = SEOAnalyzer()
        seo_results = seo_analyzer.analyze_url(url)
        if seo_results:
            print("\nSEO Analiz Sonuçları:")
            print(json.dumps(seo_results, indent=2, ensure_ascii=False))
            save_analysis_results(seo_results, 'seo')
    
    if choice in ['2', '3']:
        print("\nGEO analizi yapılıyor...")
        geo_analyzer = GEOAnalyzer()
        geo_results = geo_analyzer.analyze_url(url)
        if geo_results:
            print("\nGEO Analiz Sonuçları:")
            print(json.dumps(geo_results, indent=2, ensure_ascii=False))
            save_analysis_results(geo_results, 'geo')

def test_example_urls():
    """Örnek URL'leri test eder."""
    example_urls = [
        "https://example.com",
        "https://example.org",
        "https://example.net"
    ]
    
    print("\nAnaliz türünü seçin:")
    print("1. SEO Analizi")
    print("2. GEO Analizi")
    print("3. Her İkisi")
    choice = input("Seçiminiz (1-3): ")
    
    seo_analyzer = SEOAnalyzer() if choice in ['1', '3'] else None
    geo_analyzer = GEOAnalyzer() if choice in ['2', '3'] else None
    
    for url in example_urls:
        print(f"\n{url} analiz ediliyor...")
        
        if seo_analyzer:
            print("\nSEO analizi yapılıyor...")
            results = seo_analyzer.analyze_url(url)
            if results:
                save_analysis_results(results, f'seo_example_{url.split("//")[1]}')
        
        if geo_analyzer:
            print("\nGEO analizi yapılıyor...")
            results = geo_analyzer.analyze_url(url)
            if results:
                save_analysis_results(results, f'geo_example_{url.split("//")[1]}')

def main():
    parser = argparse.ArgumentParser(description='Web içeriği analiz aracı')
    parser.add_argument('--url', type=str, help='Analiz edilecek URL')
    parser.add_argument('--aciklama', type=str, default="", help='URL için açıklama')
    
    if len(sys.argv) == 1:
        # Eğer argüman verilmemişse interaktif mod
        while True:
            print("\n=== Web İçeriği Analiz Aracı ===")
            print("1. URL Analizi Yap")
            print("2. Örnek URL'leri Test Et")
            print("3. Sitemap Oluştur")
            print("4. Schema.org Analizi")
            print("5. SEO ve GEO Analizi")
            print("6. Çıkış")
            
            secim = input("\nSeçiminiz (1-6): ").strip()
            
            if secim == "1":
                url = input("URL giriniz (örn: https://www.example.com): ").strip()
                if not url:
                    print("\nHata: URL boş olamaz!")
                    continue
                    
                aciklama = input("Açıklama giriniz (opsiyonel): ").strip()
                test_yazdir(url, aciklama)
            elif secim == "2":
                print("\nÖrnek URL'ler test ediliyor...")
                ornek_urls = [
                    ("https://docs.python.org/3/tutorial/index.html", "Python Resmi Eğitimi"),
                    ("https://realpython.com/python-ai-neural-network", "Real Python - AI Makalesi"),
                    ("https://arxiv.org/abs/2311.09735", "GEO Makalesi"),
                    ("https://örnek.com/türkçe/yol", "Türkçe Karakterli URL")
                ]
                for url, aciklama in ornek_urls:
                    test_yazdir(url, aciklama)
            elif secim == "3":
                url = input("Sitemap oluşturulacak URL'yi giriniz: ").strip()
                if not url:
                    print("\nHata: URL boş olamaz!")
                    continue
                
                if not is_valid_url(url):
                    print("\nHata: Geçersiz URL formatı!")
                    continue
                
                max_urls = input("Maximum taranacak URL sayısı (varsayılan: 100): ").strip()
                max_urls = int(max_urls) if max_urls.isdigit() else 100
                
                print(f"\nSitemap oluşturuluyor... ({url})")
                generator = SitemapGenerator()
                sitemap = generator.create_sitemap(url, max_urls)
                
                if sitemap:
                    # Sitemap'i dosyaya kaydet
                    domain = urlparse(url).netloc
                    filename = f"sitemap_{domain}.xml"
                    
                    with open(filename, "w", encoding="utf-8") as f:
                        f.write(sitemap)
                    
                    print(f"\nSitemap başarıyla oluşturuldu: {filename}")
                    print("\nİlk 500 karakter:")
                    print("-" * 50)
                    print(sitemap[:500])
                    print("-" * 50)
            elif secim == "4":
                url = input("Schema.org analizi yapılacak URL'yi giriniz: ").strip()
                if not url:
                    print("\nHata: URL boş olamaz!")
                    continue
                
                if not is_valid_url(url):
                    print("\nHata: Geçersiz URL formatı!")
                    continue
                
                print(f"\nSchema.org analizi yapılıyor... ({url})")
                analyzer = SchemaAnalyzer()
                results = analyzer.analyze_url(url)
                
                if results:
                    # Sonuçları dosyaya kaydet
                    domain = urlparse(url).netloc
                    filename = f"schema_analysis_{domain}.json"
                    
                    with open(filename, "w", encoding="utf-8") as f:
                        json.dump(results, f, indent=2, ensure_ascii=False)
                    
                    print(f"\nAnaliz sonuçları kaydedildi: {filename}")
                    print("\nÖnerilen Schema.org Yapıları:")
                    print("-" * 50)
                    
                    for suggestion in results['schema_suggestions']:
                        print(f"\nTür: {suggestion['type']}")
                        print(f"Güven Skoru: {suggestion['confidence_score']:.2f}")
                        print("\nGerekli Alanlar:")
                        for field in suggestion['required_fields']:
                            print(f"- {field}")
                        print("\nÖnerilen Alanlar:")
                        for field in suggestion['recommended_fields']:
                            print(f"- {field}")
                        print("-" * 30)
            elif secim == "5":
                analyze_url()
            elif secim == "6":
                print("\nProgram sonlandırılıyor...")
                break
            else:
                print("\nGeçersiz seçim! Lütfen 1-6 arasında bir sayı girin.")
    else:
        # Komut satırı argümanları kullanılıyorsa
        args = parser.parse_args()
        if args.url:
            test_yazdir(args.url, args.aciklama)
        else:
            parser.print_help()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nProgram kullanıcı tarafından sonlandırıldı.")
    except Exception as e:
        print(f"\nBeklenmeyen bir hata oluştu: {str(e)}") 