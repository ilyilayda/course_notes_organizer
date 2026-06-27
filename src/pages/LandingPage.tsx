import { Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  Layers,
  HelpCircle,
  Tag,
  Search,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const features = [
  { icon: Upload, title: 'Note Upload', desc: 'PDF, TXT veya manuel metin ile notlarınızı yükleyin.' },
  { icon: FileText, title: 'Summary Generation', desc: 'Otomatik kısa ve detaylı özetler oluşturun.' },
  { icon: Layers, title: 'Flashcards', desc: 'Notlarınızdan otomatik flashcard setleri üretin.' },
  { icon: HelpCircle, title: 'Quiz Generator', desc: 'Konuları pekiştiren quiz soruları oluşturun.' },
  { icon: Tag, title: 'Topic Tags', desc: 'İçerikten konu etiketleri otomatik çıkarın.' },
  { icon: Search, title: 'Search', desc: 'Notlar, flashcard ve quizlerde güçlü arama.' },
  { icon: BookOpen, title: 'Saved Notes', desc: 'Tüm ders notlarınızı organize edin.' },
  { icon: GraduationCap, title: 'Study Mode', desc: 'Etkili tekrar için çalışma moduna geçin.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Course Notes Organizer
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Ders Notlarını Akıllıca <br className="hidden md:block" />
          <span className="text-blue-600 dark:text-blue-400">Organize Et</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Ders notlarını yükle, otomatik özetler, flashcard’lar ve quizlerle daha verimli çalış.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Not Yüklemeye Başla
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Demo Çalışma Alanını Gör
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Özellikler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="rounded-3xl bg-blue-600 text-white px-8 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Hemen Başla</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Ders materyallerini akıllı çalışma kaynaklarına dönüştür. Kayıt ol ve ilk notunu yükle.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors"
          >
            Ücretsiz Kaydol
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
        AI-Powered Course Notes Organizer
      </footer>
    </div>
  );
}
