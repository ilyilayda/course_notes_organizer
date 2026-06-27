# AI-Powered Course Notes Organizer

## Türkçe Açıklama

AI-Powered Course Notes Organizer, öğrencilerin ders notlarını, PDF dosyalarını veya düz metinlerini yükleyerek otomatik şekilde özet, flashcard, quiz ve konu etiketleri oluşturmasını sağlayan yapay zeka destekli bir course notes organizer uygulamasıdır.

Kullanıcı yüklediği notları kaydedebilir, arayabilir, derslere göre organize edebilir ve study mode ile tekrar yapabilir. Uygulama tamamen Türkçe arayüze sahiptir.

## English Description

An AI-powered course notes organizer that generates summaries, flashcards, quizzes, searchable topic-based study materials, and personalized study recommendations from uploaded notes and PDFs.

## Özellikler / Features

- **Note Upload**: PDF, TXT veya manuel metin ile not yükleme
- **Summary Generation**: Otomatik kısa, detaylı, madde madde ve sınav öncesi özetler
- **Flashcard Generator**: Not içeriğinden otomatik flashcard setleri
- **Quiz Generator**: Çoktan seçmeli quiz soruları oluşturma
- **Topic Tags**: İçerikten konu etiketleri otomatik çıkarma
- **Search System**: Notlar, flashcard'lar ve quizlerde güçlü arama
- **Saved Notes Dashboard**: Notları ders, konu, etiket ve tipe göre filtreleme
- **Study Mode**: Flashcard çalışma, quiz çözme, hızlı özet, beginner mode
- **Beginner Mode**: Konuyu hiç bilmeyen birine anlatır gibi açıklama
- **AI Study Assistant**: Kişiselleştirilmiş çalışma önerileri
- **Study Analytics**: Quiz skor trendi, flashcard durumu, haftalık aktivite grafikleri
- **Export**: Markdown özet kopyalama, CSV flashcard indirme, JSON quiz indirme, TXT not indirme
- **Dark/Light Mode**: Tema desteği
- **Login/Register**: Supabase auth ile güvenli giriş

## Kullanılan Teknolojiler

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Recharts (grafikler)
- Supabase (veritabanı, auth, RLS)
- Lucide React (ikonlar)

## Kurulum

```bash
npm install
npm run dev
```

## Kullanım

1. Uygulamayı açın ve kayıt olun / giriş yapın.
2. "Not Yükle" sayfasından ders notunuzu ekleyin.
3. Sistem otomatik olarak özet, flashcard ve quiz üretir.
4. "Kaydedilen Notlar" sayfasından notlarınıza göz atın.
5. Her notun detay sayfasında özetleri, flashcard'ları ve quizleri görüntüleyin.
6. "Study Mode" ile tekrar çalışın.
7. "Analytics" sayfasında çalışma verilerinizi inceleyin.

## AI Summary / Flashcard / Quiz Generation

Gerçek AI API entegrasyonu yerine kural tabanlı bir analiz motoru kullanılmaktadır:

- **Summary**: Metindeki en uzun ve anlamlı cümlelerden özet çıkarır.
- **Flashcards**: "nedir", "kullanılır", "önemlidir", "fark" gibi ifadelerden soru-cevap üretir.
- **Quiz**: Anahtar kavramlardan çoktan seçmeli sorular oluşturur.
- **Topic Tags**: Anahtar kelime eşleşmelerine göre etiket üretir.

## Search & Study Mode

Arama; not başlığı, ders adı, içerik, özet, flashcard soruları, quiz soruları ve etiketlerde çalışır.
Study Mode; flashcard, quiz, hızlı özet, beginner mode ve tekrar gerekli kartlar modlarını içerir.

## Export Seçenekleri

- Markdown özet kopyalama
- Flashcard'ları CSV olarak indirme
- Quiz'leri JSON olarak indirme
- Not detayını TXT olarak indirme

## CV Açıklaması

"Created an AI-powered course notes organizer that generates summaries, flashcards, quizzes, searchable topic-based study materials, and personalized study recommendations from uploaded notes and PDFs."
