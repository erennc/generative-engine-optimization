import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import re
from urllib.parse import urlparse

class WebScraper:
    def __init__(self):
        """Web içeriği çekme ve analiz etme sınıfı."""
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
    def fetch_content(self, url: str) -> Optional[str]:
        """
        URL'den içeriği çeker.
        
        Args:
            url (str): İçeriği çekilecek web sayfasının URL'i
            
        Returns:
            Optional[str]: Sayfa içeriği veya None (hata durumunda)
        """
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Hata: {url} adresinden içerik çekilemedi - {str(e)}")
            return None
            
    def extract_main_content(self, html_content: str) -> Dict[str, str]:
        """
        HTML içeriğinden ana metni ve başlığı çıkarır.
        
        Args:
            html_content (str): HTML içeriği
            
        Returns:
            Dict[str, str]: Başlık ve içerik
        """
        soup = BeautifulSoup(html_content, 'lxml')
        
        # Başlığı bul
        title = ""
        if soup.title:
            title = soup.title.string
        
        # Gereksiz elementleri temizle
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        
        # Ana içeriği bul (p etiketleri)
        paragraphs = soup.find_all('p')
        content = ' '.join([p.get_text().strip() for p in paragraphs])
        
        # Fazla boşlukları temizle
        content = re.sub(r'\s+', ' ', content).strip()
        
        return {
            "title": title,
            "content": content
        }
    
    def analyze_url(self, url: str) -> Dict[str, str]:
        """
        URL'yi analiz eder.
        
        Args:
            url (str): Analiz edilecek URL
            
        Returns:
            Dict[str, str]: URL bileşenleri
        """
        parsed = urlparse(url)
        return {
            "scheme": parsed.scheme,
            "domain": parsed.netloc,
            "path": parsed.path,
            "params": parsed.params,
            "query": parsed.query
        }
    
    def scrape_and_analyze(self, url: str) -> Dict[str, any]:
        """
        URL'den içerik çeker ve analiz eder.
        
        Args:
            url (str): İçeriği çekilecek URL
            
        Returns:
            Dict[str, any]: Analiz sonuçları
        """
        # URL analizi
        url_analysis = self.analyze_url(url)
        
        # İçeriği çek
        content = self.fetch_content(url)
        if not content:
            return {
                "success": False,
                "url_analysis": url_analysis,
                "error": "İçerik çekilemedi"
            }
        
        # İçeriği analiz et
        extracted = self.extract_main_content(content)
        
        return {
            "success": True,
            "url_analysis": url_analysis,
            "title": extracted["title"],
            "content": extracted["content"],
            "content_length": len(extracted["content"])
        }

# Örnek kullanım
if __name__ == "__main__":
    scraper = WebScraper()
    
    # Test URL'i
    test_url = "https://example.com"
    
    # İçeriği çek ve analiz et
    results = scraper.scrape_and_analyze(test_url)
    print("Analiz Sonuçları:", results) 