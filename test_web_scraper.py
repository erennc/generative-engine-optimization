from web_scraper import WebScraper
import sys
import argparse
import re
from urllib.parse import quote, urlparse, urlunparse

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
            print("3. Çıkış")
            
            secim = input("\nSeçiminiz (1-3): ").strip()
            
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
                print("\nProgram sonlandırılıyor...")
                break
            else:
                print("\nGeçersiz seçim! Lütfen 1-3 arasında bir sayı girin.")
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