import { supabase } from './supabase';

export const DEMO_NOTE_TEXT = `
Supervised Learning, makine öğrenmesinin temel yaklaşımlarından biridir. Bu yaklaşımda model, etiketli veri üzerinden öğrenir ve yeni veriler için tahmin yapar. Classification kategorik sınıf tahmini yaparken, regression sürekli sayısal değer tahmini yapar.

Train-test split, modelin yeni verilerdeki performansını değerlendirmek için kullanılır. Veri seti eğitim ve test kümelerine ayrılır. Model eğitim verisi üzerinde öğrenir, test verisi üzerinde değerlendirilir.

Overfitting, modelin eğitim verisine fazla uyum sağlayıp yeni verilerde düşük performans göstermesidir. Underfitting ise modelin veriyi yeterince öğrenememesidir.

Model değerlendirme metrikleri arasında accuracy, precision, recall ve F1-score bulunur. Accuracy genel doğruluk oranını gösterir. Precision pozitif tahminlerin ne kadarının doğru olduğunu ölçer. Recall gerçek pozitiflerin ne kadarının doğru tahmin edildiğini gösterir. F1-score precision ve recall'un harmonik ortalamasıdır.

Feature engineering, ham veriden anlamlı özellikler çıkarma sürecidir. Feature selection ise en önemli özellikleri seçme işlemidir. Dimensionality reduction, veri boyutunu azaltmak için kullanılır; PCA bu amaçla sıkça tercih edilen bir yöntemdir.

Neural networks, yapay sinir ağları olarak bilinir ve derin öğrenmenin temelini oluşturur. CNN görüntü işleme, RNN ise sıralı veriler için kullanılır.
`;

export async function seedDemoData(userId: string) {
  const { data: existing } = await supabase
    .from('course_notes')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) return;

  const { data: note } = await supabase.from('course_notes').insert({
    user_id: userId,
    title: 'Supervised Learning Temelleri',
    course_name: 'Makine Öğrenmesi',
    topic: 'Classification ve Regression',
    note_type: 'Ders Notu',
    original_text: DEMO_NOTE_TEXT,
    tags: ['Machine Learning', 'Classification', 'Regression', 'Model Evaluation'],
    short_summary:
      'Bu not, supervised learning yöntemlerinde modelin etiketli veri üzerinden öğrenmesini ve yeni veriler için tahmin yapmasını açıklar. Classification kategorik çıktılar için, regression ise sürekli değer tahmini için kullanılır.',
    detailed_summary:
      'Bu not, supervised learning algoritmalarının temel mantığını, train-test split sürecini ve model değerlendirme metriklerini açıklamaktadır. Özellikle accuracy, precision, recall ve F1-score gibi metriklerin ne zaman kullanılacağı üzerinde durulmuştur. Ayrıca overfitting ve underfitting kavramları, feature engineering ve neural networks hakkında temel bilgiler sunulmuştur.',
    beginner_summary:
      'Supervised learning, bir öğretmenin öğrenciye örnek sorular gösterip çözmesini beklemesine benzer. Model etiketli örneklerden öğrenir ve yeni soruları çözmeye çalışır.',
    key_concepts: ['Supervised Learning', 'Classification', 'Regression', 'Overfitting', 'Underfitting', 'Train-test split', 'F1-score', 'Feature Engineering', 'Neural Networks'],
  }).select().single();

  if (!note) return;

  await supabase.from('flashcards').insert([
    {
      note_id: note.id,
      user_id: userId,
      question: 'Supervised Learning nedir?',
      answer: 'Etiketli veri üzerinden modelin öğrenip yeni veriler için tahmin yapmasıdır.',
      difficulty: 'Kolay',
      tag: 'Machine Learning',
      status: 'new',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'Classification ve regression arasındaki temel fark nedir?',
      answer: 'Classification kategorik sınıf tahmini yaparken, regression sürekli sayısal değer tahmini yapar.',
      difficulty: 'Orta',
      tag: 'Machine Learning',
      status: 'new',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'Overfitting nedir?',
      answer: 'Modelin eğitim verisine fazla uyum sağlayıp yeni verilerde düşük performans göstermesidir.',
      difficulty: 'Orta',
      tag: 'Machine Learning',
      status: 'new',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'Train-test split neden kullanılır?',
      answer: 'Modelin yeni verilerdeki performansını değerlendirmek için.',
      difficulty: 'Kolay',
      tag: 'Machine Learning',
      status: 'new',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'F1-score nedir?',
      answer: 'Precision ve recall metriklerinin harmonik ortalamasıdır.',
      difficulty: 'Zor',
      tag: 'Model Evaluation',
      status: 'new',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'Feature engineering ne işe yarar?',
      answer: 'Ham veriden anlamlı özellikler çıkararak model performansını artırır.',
      difficulty: 'Orta',
      tag: 'Feature Engineering',
      status: 'new',
    },
  ]);

  await supabase.from('quiz_questions').insert([
    {
      note_id: note.id,
      user_id: userId,
      question: 'Aşağıdakilerden hangisi classification problemidir?',
      type: 'multiple_choice',
      options: ['Ev fiyatı tahmini', 'Hastalık var/yok tahmini', 'Sıcaklık tahmini', 'Gelir tahmini'],
      correct_answer: 'Hastalık var/yok tahmini',
      explanation: 'Hastalık var/yok tahmini kategorik bir sınıflandırma problemidir.',
      difficulty: 'Kolay',
      tag: 'Classification',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'Train-test split neden kullanılır?',
      type: 'multiple_choice',
      options: ['Modelin hızını artırmak için', 'Modelin yeni verilerdeki performansını değerlendirmek için', 'Veri boyutunu azaltmak için', 'Eksik verileri doldurmak için'],
      correct_answer: 'Modelin yeni verilerdeki performansını değerlendirmek için',
      explanation: 'Train-test split, modelin genelleme yeteneğini ölçmek için kullanılır.',
      difficulty: 'Kolay',
      tag: 'Model Evaluation',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'Overfitting durumunda model nasıl davranır?',
      type: 'multiple_choice',
      options: ['Eğitim ve test verisinde düşük performans gösterir', 'Eğitim verisinde yüksek, test verisinde düşük performans gösterir', 'Her iki veride de yüksek performans gösterir', 'Model hiç öğrenemez'],
      correct_answer: 'Eğitim verisinde yüksek, test verisinde düşük performans gösterir',
      explanation: 'Overfitting, modelin eğitim verisini ezberlemesine ve yeni verilerde başarısız olmasına neden olur.',
      difficulty: 'Orta',
      tag: 'Machine Learning',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'F1-score hangi iki metriğin harmonik ortalamasıdır?',
      type: 'multiple_choice',
      options: ['Accuracy ve Precision', 'Precision ve Recall', 'Recall ve Accuracy', 'Precision ve Specificity'],
      correct_answer: 'Precision ve Recall',
      explanation: 'F1-score, precision ve recall arasındaki dengeyi ölçer.',
      difficulty: 'Zor',
      tag: 'Model Evaluation',
    },
    {
      note_id: note.id,
      user_id: userId,
      question: 'PCA ne amaçla kullanılır?',
      type: 'multiple_choice',
      options: ['Veri boyutunu azaltmak', 'Veri setini büyütmek', 'Eksik verileri doldurmak', 'Model eğitimini hızlandırmak'],
      correct_answer: 'Veri boyutunu azaltmak',
      explanation: 'PCA (Principal Component Analysis) boyut indirgeme tekniğidir.',
      difficulty: 'Orta',
      tag: 'Feature Engineering',
    },
  ]);
}
