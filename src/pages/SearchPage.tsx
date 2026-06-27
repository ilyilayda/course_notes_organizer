import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Layers, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { supabase, type CourseNote, type Flashcard, type QuizQuestion } from '../lib/supabase';

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !query.trim()) return;
    setLoading(true);
    setSearched(true);

    const q = query.toLowerCase();

    const [{ data: n }, { data: f }, { data: qu }] = await Promise.all([
      supabase.from('course_notes').select('*').eq('user_id', user.id),
      supabase.from('flashcards').select('*').eq('user_id', user.id),
      supabase.from('quiz_questions').select('*').eq('user_id', user.id),
    ]);

    const filteredNotes = (n || []).filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.course_name.toLowerCase().includes(q) ||
        (note.original_text || '').toLowerCase().includes(q) ||
        (note.short_summary || '').toLowerCase().includes(q) ||
        (note.tags || []).some((t: string) => t.toLowerCase().includes(q))
    );

    const filteredFlashcards = (f || []).filter(
      (fc) => fc.question.toLowerCase().includes(q) || fc.answer.toLowerCase().includes(q) || (fc.tag || '').toLowerCase().includes(q)
    );

    const filteredQuiz = (qu || []).filter(
      (qItem) => qItem.question.toLowerCase().includes(q) || qItem.correct_answer.toLowerCase().includes(q) || (qItem.tag || '').toLowerCase().includes(q)
    );

    setNotes(filteredNotes);
    setFlashcards(filteredFlashcards);
    setQuizQuestions(filteredQuiz);
    setLoading(false);
  }

  const totalResults = notes.length + flashcards.length + quizQuestions.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Arama</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Notlar, flashcard'lar, quizler ve etiketlerde ara.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSearched(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Aranıyor...' : 'Ara'}
        </button>
      </form>

      {searched && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">{totalResults} sonuç bulundu.</p>

          {notes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Notlar ({notes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {notes.map((note: any) => (
                  <Link
                    key={note.id}
                    to={`/notes/${note.id}`}
                    className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow"
                  >
                    <h3 className="font-semibold truncate">{note.title}</h3>
                    <p className="text-sm text-gray-500">{note.course_name}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags?.slice(0, 3).map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {flashcards.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Flashcards ({flashcards.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {flashcards.map((fc) => (
                  <div
                    key={fc.id}
                    className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  >
                    <p className="font-medium text-sm">{fc.question}</p>
                    <p className="text-sm text-gray-500 mt-1">{fc.answer}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{fc.difficulty}</span>
                      {fc.tag && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">{fc.tag}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {quizQuestions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                Quiz Soruları ({quizQuestions.length})
              </h2>
              <div className="space-y-3">
                {quizQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  >
                    <p className="font-medium text-sm">{q.question}</p>
                    <p className="text-sm text-gray-500 mt-1">Doğru: {q.correct_answer}</p>
                    {q.tag && <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">{q.tag}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Sonuç bulunamadı.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
