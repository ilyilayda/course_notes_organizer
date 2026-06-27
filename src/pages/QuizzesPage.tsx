import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Trash2, Tag, Filter } from 'lucide-react';
import { supabase, type QuizQuestion, type CourseNote } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function QuizzesPage() {
  const { user } = useAuth();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNote, setFilterNote] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    async function fetchData() {
      const [{ data: q }, { data: n }] = await Promise.all([
        supabase.from('quiz_questions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('course_notes').select('*').eq('user_id', uid),
      ]);
      setQuizQuestions(q || []);
      setNotes(n || []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  async function handleDelete(id: string) {
    if (!confirm('Bu quiz sorusunu silmek istediğinize emin misiniz?')) return;
    await supabase.from('quiz_questions').delete().eq('id', id);
    setQuizQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  const allTags = [...new Set(quizQuestions.map((q) => q.tag).filter(Boolean))];

  const filtered = quizQuestions.filter((q) => {
    if (filterNote && q.note_id !== filterNote) return false;
    if (filterTag && q.tag !== filterTag) return false;
    return true;
  });

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
        <h1 className="text-2xl font-bold">Quizler</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Tüm quiz sorularınızı görüntüleyin ve yönetin.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filterNote}
          onChange={(e) => setFilterNote(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
        >
          <option value="">Tüm Notlar</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
        >
          <option value="">Tüm Etiketler</option>
          {allTags.map((t) => (
            <option key={String(t)} value={String(t)}>{String(t)}</option>
          ))}
        </select>
        <button
          onClick={() => { setFilterNote(''); setFilterTag(''); }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Quiz sorusu bulunamadı.</p>
          <Link to="/upload" className="mt-2 text-blue-600 hover:underline inline-block">Not Yükle</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {q.difficulty}
                  </span>
                  {q.tag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                      <Tag className="w-3 h-3" />
                      {q.tag}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="font-medium mb-3">{q.question}</p>
              <div className="space-y-1.5">
                {q.options.map((opt) => (
                  <div
                    key={opt}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      opt === q.correct_answer
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="mt-3 text-xs text-gray-500">{q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
