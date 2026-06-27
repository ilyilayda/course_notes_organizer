import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Layers, HelpCircle, BookOpen } from 'lucide-react';
import { supabase, type CourseNote, type Flashcard, type QuizQuestion } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function ExportPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    async function fetchData() {
      const [{ data: n }, { data: f }, { data: q }] = await Promise.all([
        supabase.from('course_notes').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('flashcards').select('*').eq('user_id', uid),
        supabase.from('quiz_questions').select('*').eq('user_id', uid),
      ]);
      setNotes(n || []);
      setFlashcards(f || []);
      setQuizQuestions(q || []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);
  const noteFlashcards = flashcards.filter((f) => f.note_id === selectedNoteId);
  const noteQuiz = quizQuestions.filter((q) => q.note_id === selectedNoteId);

  function copyMarkdown() {
    if (!selectedNote) return;
    const md = [
      `# ${selectedNote.title}`,
      ``,
      `**Ders:** ${selectedNote.course_name}`,
      `**Konu:** ${selectedNote.topic || '-'}`,
      `**Tip:** ${selectedNote.note_type}`,
      ``,
      `## Kısa Özet`,
      selectedNote.short_summary || '-',
      ``,
      `## Detaylı Özet`,
      selectedNote.detailed_summary || '-',
      ``,
      `## Anahtar Kavramlar`,
      ...(selectedNote.key_concepts || []).map((c) => `- ${c}`),
      ``,
      `## Topic Tags`,
      ...(selectedNote.tags || []).map((t) => `- ${t}`),
      ``,
      `## Flashcards`,
      ...noteFlashcards.map((fc) => `- **S:** ${fc.question}  **C:** ${fc.answer}`),
      ``,
      `## Quiz Soruları`,
      ...noteQuiz.map((q, i) => `${i + 1}. ${q.question}\n   Doğru: ${q.correct_answer}`),
      ``,
      `## Study Recommendation`,
      `Bu notu tekrar etmek için Study Mode'u kullanabilirsiniz.`,
    ].join('\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadFlashcardsCSV() {
    const data = selectedNoteId ? noteFlashcards : flashcards;
    if (data.length === 0) return;
    const rows = [
      ['Soru', 'Cevap', 'Zorluk', 'Etiket'],
      ...data.map((fc) => [fc.question, fc.answer, fc.difficulty, fc.tag || '']),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadQuizJSON() {
    const data = selectedNoteId ? noteQuiz : quizQuestions;
    if (data.length === 0) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_questions.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadNoteTXT() {
    if (!selectedNote) return;
    const text = [
      `Başlık: ${selectedNote.title}`,
      `Ders: ${selectedNote.course_name}`,
      `Konu: ${selectedNote.topic || '-'}`,
      `Tip: ${selectedNote.note_type}`,
      `Tarih: ${new Date(selectedNote.created_at).toLocaleDateString('tr-TR')}`,
      ``,
      `--- Not Metni ---`,
      selectedNote.original_text || '-',
      ``,
      `--- Kısa Özet ---`,
      selectedNote.short_summary || '-',
      ``,
      `--- Detaylı Özet ---`,
      selectedNote.detailed_summary || '-',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Oluşturulan çıktıları dışa aktarın.</p>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <label className="block text-sm font-medium mb-1.5">Not Seçin (isteğe bağlı)</label>
        <select
          value={selectedNoteId}
          onChange={(e) => setSelectedNoteId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tüm Notlar</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>
      </div>

      {notes.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>Henüz not bulunmuyor.</p>
          <Link to="/upload" className="text-blue-600 hover:underline mt-2 inline-block">Not Yükle</Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={copyMarkdown}
          disabled={!selectedNote}
          className="flex items-center gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow disabled:opacity-50 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">Markdown Özet Kopyala</h3>
            <p className="text-sm text-gray-500">{copied ? 'Kopyalandı!' : 'Panoya kopyala'}</p>
          </div>
        </button>

        <button
          onClick={downloadFlashcardsCSV}
          disabled={(selectedNoteId ? noteFlashcards : flashcards).length === 0}
          className="flex items-center gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow disabled:opacity-50 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold">Flashcard'ları CSV İndir</h3>
            <p className="text-sm text-gray-500">{(selectedNoteId ? noteFlashcards : flashcards).length} kart</p>
          </div>
        </button>

        <button
          onClick={downloadQuizJSON}
          disabled={(selectedNoteId ? noteQuiz : quizQuestions).length === 0}
          className="flex items-center gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow disabled:opacity-50 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold">Quiz'leri JSON İndir</h3>
            <p className="text-sm text-gray-500">{(selectedNoteId ? noteQuiz : quizQuestions).length} soru</p>
          </div>
        </button>

        <button
          onClick={downloadNoteTXT}
          disabled={!selectedNote}
          className="flex items-center gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow disabled:opacity-50 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold">Not Detayını TXT İndir</h3>
            <p className="text-sm text-gray-500">Metin dosyası olarak indir</p>
          </div>
        </button>
      </div>
    </div>
  );
}
