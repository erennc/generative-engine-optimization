import unittest
from geo_metrics import GEOMetrics

class TestGEOMetrics(unittest.TestCase):
    def setUp(self):
        self.geo = GEOMetrics(lambda_decay=10)
    
    def test_word_count_metric(self):
        # Test 1: Basit durum
        self.assertAlmostEqual(
            self.geo.word_count_metric(5, 10),
            0.5
        )
        
        # Test 2: Sıfır toplam kelime
        self.assertEqual(
            self.geo.word_count_metric(5, 0),
            0
        )
        
        # Test 3: Tam eşleşme
        self.assertEqual(
            self.geo.word_count_metric(10, 10),
            1.0
        )
    
    def test_position_adjusted_metric(self):
        # Test 1: Tek cümle, ilk pozisyon
        sentences = [(10, 1)]  # 10 kelime, 1. pozisyon
        self.assertAlmostEqual(
            self.geo.position_adjusted_metric(sentences, 20),
            0.45241870901797976,  # Güncellenen beklenen değer
            places=7
        )
        
        # Test 2: Boş yanıt
        self.assertEqual(
            self.geo.position_adjusted_metric(sentences, 0),
            0
        )
    
    def test_calculate_metrics(self):
        kaynak = "Bu test bir örnektir."
        yanit = "Bu test bir örnektir ve başka kelimeler de içerir."
        
        sonuclar = self.geo.calculate_metrics(kaynak, yanit)
        
        self.assertIn("word_count_metric", sonuclar)
        self.assertIn("position_adjusted_metric", sonuclar)
        self.assertTrue(0 <= sonuclar["word_count_metric"] <= 1)
        self.assertTrue(0 <= sonuclar["position_adjusted_metric"] <= 1)

if __name__ == "__main__":
    unittest.main() 