import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Trash2, Edit3, BookOpen, Tag, Clock, FileText } from 'lucide-react';
import { supabase, type CourseNote } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function SavedNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [loading, setLoading] = useState(true);
  const [, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('course_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNotes(data || []);
        setLoading(false);
      });
  }, [user]);

  const courses = useMemo(() => [...new Set(notes.map((n) => n.course_name))], [notes]);
  const types = useMemo(() => [...new Set(notes.map((n) => n.note_type))], [notes]);
  const allTags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags || []))], [notes]);

  const filtered = useMemo(() => {
    let result = [...notes];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.course_name.toLowerCase().includes(q) ||
          (n.original_text || '').toLowerCase().includes(q) ||
          (n.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (courseFilter) result = result.filter((n) => n.course_name === courseFilter);
    if (typeFilter) result = result.filter((n) => n.note_type === typeFilter);
    if (tagFilter) result = result.filter((n) => (n.tags || []).includes(tagFilter));
    result.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sort === 'newest' ? db - da : da - db;
    });
    return result;
  }, [notes, query, courseFilter, typeFilter, tagFilter, sort]);

  async function handleDelete(id: string) {
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    await supabase.from('course_notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setDeleteId(null);
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
        <h1 className="text-2xl font-bold">Kaydedilen Notlar</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Tüm ders notlarınızı görüntüleyin, arayın ve yönetin.</p>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Başlık, ders, içerik veya etiket ara..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
          >
            <option value="">Tüm Dersler</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
          >
            <option value="">Tüm Tipler</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
          >
            <option value="">Tüm Etiketler</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
          </select>
          <button
            onClick={() => { setQuery(''); setCourseFilter(''); setTypeFilter(''); setTagFilter(''); setSort('newest'); }}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <BookOpen className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-lg font-medium">Not bulunamadı</p>
          <p className="text-sm mt-1">Farklı arama kriterleri deneyin veya yeni not yükleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <Link to={`/notes/${note.id}`} className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-1">
                  {note.title}
                </Link>
                <div className="flex gap-1">
                  <Link
                    to={`/notes/${note.id}/edit`}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    title="Düzenle"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{note.course_name} {note.topic ? `• ${note.topic}` : ''}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {note.tags?.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                    <Tag className="w-3 h-3" />
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {note.note_type}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(note.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                {note.short_summary && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                    Özet var
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
