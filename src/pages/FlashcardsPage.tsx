import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Trash2, CheckCircle, XCircle, Tag, Filter } from 'lucide-react';
import { supabase, type Flashcard, type CourseNote } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterNote, setFilterNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    async function fetchData() {
      const [{ data: f }, { data: n }] = await Promise.all([
        supabase.from('flashcards').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('course_notes').select('*').eq('user_id', uid),
      ]);
      setFlashcards(f || []);
      setNotes(n || []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('flashcards').update({ status }).eq('id', id);
    setFlashcards((prev) => prev.map((fc) => (fc.id === id ? { ...fc, status } : fc)));
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu flashcard\'ı silmek istediğinize emin misiniz?')) return;
    await supabase.from('flashcards').delete().eq('id', id);
    setFlashcards((prev) => prev.filter((fc) => fc.id !== id));
  }

  const filtered = flashcards.filter((fc) => {
    if (filterNote && fc.note_id !== filterNote) return false;
    if (filterStatus && fc.status !== filterStatus) return false;
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
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Tüm flashcard'larınızı görüntüleyin ve yönetin.</p>
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
        >
          <option value="">Tüm Durumlar</option>
          <option value="new">Yeni</option>
          <option value="learned">Öğrenildi</option>
          <option value="review">Tekrar</option>
        </select>
        <button
          onClick={() => { setFilterNote(''); setFilterStatus(''); }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Flashcard bulunamadı.</p>
          <Link to="/upload" className="mt-2 text-blue-600 hover:underline inline-block">Not Yükle</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((fc) => (
            <div
              key={fc.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                    fc.status === 'learned' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' :
                    fc.status === 'review' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {fc.status === 'learned' ? 'Öğrenildi' : fc.status === 'review' ? 'Tekrar' : 'Yeni'}
                  </span>
                  {fc.tag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                      <Tag className="w-3 h-3" />
                      {fc.tag}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(fc.id)}
                  className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="font-medium mb-1">{fc.question}</p>
              <p className="text-sm text-gray-500 mb-4">{fc.answer}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateStatus(fc.id, 'learned')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Öğrenildi
                </button>
                <button
                  onClick={() => updateStatus(fc.id, 'review')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Tekrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
