import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import re
from collections import Counter
from urllib.parse import urlparse
import json
import numpy as np
from content_analyzer import ContentAnalyzer

class SEOAnalyzer:
    def __init__(self):
        """SEO analiz sınıfı."""
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Content analyzer'ı başlat
        self.content_analyzer = ContentAnalyzer()
        
        # SEO önemli elementler
        self.seo_elements = {
            'title': {'selector': 'title', 'weight': 1.0},
            'h1': {'selector': 'h1', 'weight': 0.8},
            'h2': {'selector': 'h2', 'weight': 0.6},
            'h3': {'selector': 'h3', 'weight': 0.4},
            'meta_description': {'selector': 'meta[name="description"]', 'weight': 0.9},
            'meta_keywords': {'selector': 'meta[name="keywords"]', 'weight': 0.7}
        }
    
    def fetch_content(self, url: str) -> Optional[str]:
        """URL'den içeriği çeker."""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            # Önce content-type header'ından karakter setini al
            content_type = response.headers.get('content-type', '').lower()
            if 'charset=' in content_type:
                encoding = content_type.split('charset=')[-1]
            else:
                # Content-type'da charset yoksa, meta tag'den bul
                encoding = None
                content = response.content
                if b'charset=' in content.lower():
                    match = re.search(b'charset=["\']?([^"\'>]+)', content.lower())
                    if match:
                        encoding = match.group(1).decode()
            
            # Eğer hala encoding bulunamadıysa, yaygın Türkçe encodingleri dene
            if not encoding:
                encodings = ['utf-8', 'iso-8859-9', 'windows-1254']
                for enc in encodings:
                    try:
                        return response.content.decode(enc)
                    except UnicodeDecodeError:
                        continue
            
            # Bulunan encoding ile decode et
            return response.content.decode(encoding or 'utf-8', errors='replace')
            
        except Exception as e:
            print(f"Hata: {url} adresinden içerik çekilemedi - {str(e)}")
            return None
    
    def analyze_keyword_density(self, text: str, top_n: int = 10) -> Dict[str, float]:
        """Anahtar kelime yoğunluğunu analiz eder."""
        # Stop words (Türkçe)
        stop_words = {'ve', 'veya', 'bir', 'bu', 'şu', 'için', 'ile', 'da', 'de', 'mi', 'den', 'dan'}
        
        # Kelimeleri ayır ve temizle
        words = re.findall(r'\w+', text.lower())
        words = [w for w in words if w not in stop_words and len(w) > 2]
        
        # Kelime sayımı
        word_counts = Counter(words)
        total_words = len(words)
        
        # Yoğunluk hesapla
        densities = {word: count/total_words for word, count in word_counts.most_common(top_n)}
        return densities
    
    def analyze_heading_structure(self, soup: BeautifulSoup) -> Dict[str, List[str]]:
        """Başlık yapısını analiz eder."""
        headings = {}
        for i in range(1, 7):
            tags = soup.find_all(f'h{i}')
            if tags:
                headings[f'h{i}'] = [tag.get_text().strip() for tag in tags]
        return headings
    
    def analyze_meta_tags(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Meta etiketlerini analiz eder."""
        meta_tags = {}
        
        # Title
        if soup.title:
            meta_tags['title'] = soup.title.string.strip()
        
        # Meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            meta_tags['description'] = meta_desc.get('content', '').strip()
        
        # Meta keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords:
            meta_tags['keywords'] = meta_keywords.get('content', '').strip()
        
        # Open Graph tags
        og_tags = soup.find_all('meta', property=re.compile(r'^og:'))
        for tag in og_tags:
            key = tag.get('property', '')[3:]
            meta_tags[f'og_{key}'] = tag.get('content', '').strip()
        
        return meta_tags
    
    def calculate_content_quality_score(self, text: str) -> Dict[str, float]:
        """İçerik kalitesini hesaplar."""
        # Kelime sayısı
        words = len(text.split())
        
        # Ortalama cümle uzunluğu
        sentences = re.split(r'[.!?]+', text)
        avg_sentence_length = np.mean([len(s.split()) for s in sentences if s.strip()])
        
        # Paragraf sayısı
        paragraphs = len(re.split(r'\n\s*\n', text))
        
        # Kalite skorları
        scores = {
            'length_score': min(words / 1000, 1.0),  # 1000+ kelime ideal
            'readability_score': 1.0 - min(abs(avg_sentence_length - 15) / 15, 1.0),  # 15 kelimelik cümleler ideal
            'structure_score': min(paragraphs / 10, 1.0)  # 10+ paragraf ideal
        }
        
        # Genel skor
        scores['overall_score'] = np.mean(list(scores.values()))
        
        return scores
    
    def analyze_url(self, url: str) -> Optional[Dict]:
        """URL'yi analiz eder ve sonuçları döndürür."""
        try:
            # İçeriği çek
            html_content = self.fetch_content(url)
            if not html_content:
                return None
            
            # BeautifulSoup ile parse et
            soup = BeautifulSoup(html_content, 'lxml')
            text_content = soup.get_text()
            
            # SEO analizlerini yap
            results = {
                'url': url,
                'meta_tags': self.analyze_meta_tags(soup),
                'heading_structure': self.analyze_heading_structure(soup),
                'keyword_density': self.analyze_keyword_density(text_content),
                'content_quality': self.calculate_content_quality_score(text_content),
                
                # İçerik analizleri
                'readability': self.content_analyzer.analyze_readability(text_content),
                'sentiment': self.content_analyzer.analyze_sentiment(text_content),
                'topic_coherence': self.content_analyzer.analyze_topic_coherence(text_content),
                'content_structure': self.content_analyzer.analyze_content_structure(text_content),
                'content_depth': self.content_analyzer.analyze_content_depth(text_content)
            }
            
            # Önerileri oluştur
            results['recommendations'] = self.generate_seo_recommendations(results)
            
            return results
            
        except Exception as e:
            print(f"Hata: SEO analizi yapılamadı - {str(e)}")
            return None
    
    def generate_seo_recommendations(self, analysis_results: Dict) -> List[Dict]:
        """SEO önerileri oluşturur."""
        recommendations = []
        
        # Meta tag önerileri
        meta_tags = analysis_results['meta_tags']
        if 'title' not in meta_tags or len(meta_tags['title']) < 30:
            recommendations.append({
                'type': 'meta_tags',
                'element': 'title',
                'severity': 'high',
                'message': 'Title etiketi 30-60 karakter arasında olmalıdır.'
            })
        
        if 'description' not in meta_tags or len(meta_tags['description']) < 120:
            recommendations.append({
                'type': 'meta_tags',
                'element': 'description',
                'severity': 'high',
                'message': 'Meta description 120-160 karakter arasında olmalıdır.'
            })
        
        # Başlık yapısı önerileri
        headings = analysis_results['heading_structure']
        if 'h1' not in headings or len(headings['h1']) != 1:
            recommendations.append({
                'type': 'headings',
                'element': 'h1',
                'severity': 'high',
                'message': 'Sayfada tam olarak bir adet H1 etiketi olmalıdır.'
            })
        
        # İçerik kalitesi önerileri
        quality_scores = analysis_results['content_quality']
        if quality_scores['length_score'] < 0.5:
            recommendations.append({
                'type': 'content',
                'element': 'length',
                'severity': 'medium',
                'message': 'İçerik en az 500 kelime olmalıdır.'
            })
        
        # Okunabilirlik önerileri
        readability = analysis_results['readability']
        if readability['atesmanScore'] < 50:
            recommendations.append({
                'type': 'readability',
                'element': 'text',
                'severity': 'medium',
                'message': f'İçerik okunabilirliği düşük (Skor: {readability["atesmanScore"]:.1f}). ' +
                         'Daha kısa cümleler ve daha basit kelimeler kullanın.'
            })
        
        # Konu tutarlılığı önerileri
        coherence = analysis_results['topic_coherence']
        if coherence['overall_coherence'] < 0.5:
            recommendations.append({
                'type': 'coherence',
                'element': 'content',
                'severity': 'medium',
                'message': 'Paragraflar arası geçişler zayıf. Konu akışını iyileştirin.'
            })
        
        return recommendations

# Örnek kullanım
if __name__ == "__main__":
    analyzer = SEOAnalyzer()
    url = "https://example.com"
    results = analyzer.analyze_url(url)
    
    if results:
        print("\nSEO Analiz Sonuçları:")
        print(json.dumps(results, indent=2, ensure_ascii=False)) 