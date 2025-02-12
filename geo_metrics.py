import numpy as np
import math
import re
from typing import List, Dict, Tuple, Optional

class GEOMetrics:
    def __init__(self, lambda_decay=10):
        """
        GEO metriklerini hesaplamak için sınıf.
        
        Args:
            lambda_decay (int): Konum ağırlıklı metrik için bozulma faktörü
        """
        self.lambda_decay = lambda_decay
        
        # Otoriter dil kalıpları
        self.authority_patterns = [
            r"araştırmalar gösteriyor",
            r"çalışmalar kanıtlıyor",
            r"uzmanlar belirtiyor",
            r"bilimsel veriler",
            r"istatistikler gösteriyor"
        ]
        
        # İstatistik kalıpları
        self.statistic_patterns = [
            r"\d+%",
            r"\d+ (kişi|kullanıcı|insan)",
            r"\d+\.\d+",
            r"\d+ (milyon|milyar)"
        ]
    
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
    
    def analyze_authority_language(self, text: str) -> Dict[str, float]:
        """
        Metindeki otoriter dil kullanımını analiz eder.
        
        Returns:
            Dict[str, float]: Otoriter dil skoru ve bulunan kalıplar
        """
        authority_score = 0
        found_patterns = []
        
        for pattern in self.authority_patterns:
            matches = re.finditer(pattern, text.lower())
            for match in matches:
                authority_score += 1
                found_patterns.append(match.group())
                
        return {
            "authority_score": authority_score,
            "found_patterns": found_patterns
        }
    
    def analyze_statistics(self, text: str) -> Dict[str, float]:
        """
        Metindeki istatistik kullanımını analiz eder.
        
        Returns:
            Dict[str, float]: İstatistik skoru ve bulunan istatistikler
        """
        stats_score = 0
        found_stats = []
        
        for pattern in self.statistic_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                stats_score += 1
                found_stats.append(match.group())
                
        return {
            "statistics_score": stats_score,
            "found_statistics": found_stats
        }
    
    def calculate_subjective_impression(self, text: str) -> float:
        """
        Metnin öznel etki skorunu hesaplar.
        
        Returns:
            float: 0-1 arası öznel etki skoru
        """
        authority_analysis = self.analyze_authority_language(text)
        stats_analysis = self.analyze_statistics(text)
        
        # Öznel etki skorunu hesapla
        authority_weight = 0.4
        stats_weight = 0.6
        
        authority_normalized = min(authority_analysis["authority_score"] / 5, 1.0)
        stats_normalized = min(stats_analysis["statistics_score"] / 5, 1.0)
        
        return (authority_weight * authority_normalized + 
                stats_weight * stats_normalized)
    
    def calculate_metrics(self, source_text: str, response_text: str) -> dict:
        """
        Verilen kaynak ve yanıt metni için tüm metrikleri hesapla
        
        Args:
            source_text (str): Kaynak metin
            response_text (str): UE yanıt metni
            
        Returns:
            dict: Hesaplanan tüm metrikler
        """
        # Temel metrikler
        source_sentences = self.split_into_sentences(source_text)
        response_sentences = self.split_into_sentences(response_text)
        
        source_words = len(source_text.split())
        total_words = len(response_text.split())
        
        sentence_positions = self.find_source_positions(source_sentences, response_sentences)
        
        wc_metric = self.word_count_metric(source_words, total_words)
        pos_metric = self.position_adjusted_metric(sentence_positions, total_words)
        
        # Gelişmiş analizler
        authority_analysis = self.analyze_authority_language(response_text)
        stats_analysis = self.analyze_statistics(response_text)
        subjective_score = self.calculate_subjective_impression(response_text)
        
        return {
            "word_count_metric": wc_metric,
            "position_adjusted_metric": pos_metric,
            "source_positions": sentence_positions,
            "authority_analysis": authority_analysis,
            "statistics_analysis": stats_analysis,
            "subjective_impression_score": subjective_score
        }

# Örnek kullanım
if __name__ == "__main__":
    geo = GEOMetrics()
    
    kaynak = "Yapay zeka çok önemlidir. Gelecekte her yerde olacak."
    yanit = """Araştırmalar gösteriyor ki yapay zeka çok önemlidir. 
              İstatistikler gösteriyor ki 2023'te yapay zeka kullanımı 45% arttı. 
              Uzmanlar belirtiyor ki gelecekte 2.5 milyar insan yapay zeka kullanacak."""
    
    sonuclar = geo.calculate_metrics(kaynak, yanit)
    print("Metrik Sonuçları:", sonuclar) 