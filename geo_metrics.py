import numpy as np
import math
import re

class GEOMetrics:
    def __init__(self, lambda_decay=10):
        """
        GEO metriklerini hesaplamak için sınıf.
        
        Args:
            lambda_decay (int): Konum ağırlıklı metrik için bozulma faktörü
        """
        self.lambda_decay = lambda_decay
    
    def split_into_sentences(self, text: str) -> list:
        """
        Metni cümlelere böler.
        
        Args:
            text (str): Bölünecek metin
            
        Returns:
            list: Cümle listesi
        """
        # Basit cümle bölme (nokta, ünlem, soru işareti)
        sentences = re.split('[.!?]', text)
        # Boş cümleleri temizle
        return [s.strip() for s in sentences if s.strip()]
    
    def find_source_positions(self, source_sentences: list, response_sentences: list) -> list:
        """
        Kaynak cümlelerin yanıt metnindeki pozisyonlarını bulur.
        
        Args:
            source_sentences (list): Kaynak cümleler
            response_sentences (list): Yanıt cümleleri
            
        Returns:
            list: [(kelime_sayısı, pozisyon)] formatında liste
        """
        positions = []
        for source in source_sentences:
            source_words = len(source.split())
            # Her kaynak cümle için yanıt metninde ara
            for i, response in enumerate(response_sentences, 1):
                if source.lower() in response.lower():
                    positions.append((source_words, i))
                    break
        return positions
    
    def word_count_metric(self, source_words: int, total_words: int) -> float:
        """
        Kelime Sayısı Metriği (Word Count Metric) hesaplama
        
        Args:
            source_words (int): Kaynak metinden alıntılanan kelime sayısı
            total_words (int): Toplam yanıt kelime sayısı
            
        Returns:
            float: Imp_wc metrik değeri
        """
        if total_words == 0:
            return 0
        return source_words / total_words
    
    def position_adjusted_metric(self, sentences: list, total_words: int) -> float:
        """
        Konum Ağırlıklı Metrik (Position-Adjusted Metric) hesaplama
        
        Args:
            sentences (list): Her bir cümle için (kelime_sayısı, pozisyon) tuple'larından oluşan liste
            total_words (int): Toplam yanıt kelime sayısı
            
        Returns:
            float: Imp'_wc metrik değeri
        """
        if total_words == 0:
            return 0
            
        weighted_sum = 0
        for word_count, position in sentences:
            weight = math.exp(-position / self.lambda_decay)
            weighted_sum += word_count * weight
            
        return weighted_sum / total_words
    
    def calculate_metrics(self, source_text: str, response_text: str) -> dict:
        """
        Verilen kaynak ve yanıt metni için tüm metrikleri hesapla
        
        Args:
            source_text (str): Kaynak metin
            response_text (str): UE yanıt metni
            
        Returns:
            dict: Hesaplanan metrikler
        """
        # Metinleri cümlelere böl
        source_sentences = self.split_into_sentences(source_text)
        response_sentences = self.split_into_sentences(response_text)
        
        # Toplam kelime sayıları
        source_words = len(source_text.split())
        total_words = len(response_text.split())
        
        # Kaynak cümlelerin pozisyonlarını bul
        sentence_positions = self.find_source_positions(source_sentences, response_sentences)
        
        # Metrikleri hesapla
        wc_metric = self.word_count_metric(source_words, total_words)
        pos_metric = self.position_adjusted_metric(sentence_positions, total_words)
        
        return {
            "word_count_metric": wc_metric,
            "position_adjusted_metric": pos_metric,
            "source_positions": sentence_positions  # Debug için pozisyon bilgisi
        }

# Örnek kullanım
if __name__ == "__main__":
    geo = GEOMetrics()
    
    kaynak = "Bu önemli bir kaynak metindir. İkinci cümle de önemlidir!"
    yanit = "Bu önemli bir kaynak metindir. Başka bilgiler var. İkinci cümle de önemlidir!"
    
    sonuclar = geo.calculate_metrics(kaynak, yanit)
    print("Metrik Sonuçları:", sonuclar) 