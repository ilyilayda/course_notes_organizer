import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { generateSummary, generateFlashcards, generateQuizQuestions, extractTags } from '../lib/aiEngine';

const noteTypes = ['Ders Notu', 'Makale', 'Slayt', 'Ödev Notu', 'Sınav Hazırlık', 'Diğer'];

export default function UploadNote() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [topic, setTopic] = useState('');
  const [noteType, setNoteType] = useState('Ders Notu');
  const [originalText, setOriginalText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  function processFile(file: File) {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      setError('Yalnızca PDF ve TXT dosyaları kabul edilir.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Maksimum dosya boyutu 5 MB.');
      return;
    }
    setFileName(file.name);
    setError('');
    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = String(ev.target?.result || '');
        setOriginalText(text);
      };
      reader.readAsText(file);
    } else {
      setError('PDF metni otomatik çıkarılamadı. Lütfen not metnini manuel olarak ekleyin veya demo analiz modunu kullanın.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title.trim() || !courseName.trim()) {
      setError('Başlık ve ders adı zorunludur.');
      return;
    }
    if (!originalText.trim() && !fileName) {
      setError('Not metni veya dosya yükleyin.');
      return;
    }
    setLoading(true);

    const tags = [...new Set([...extractTags(originalText), ...tagsInput.split(',').map((t) => t.trim()).filter(Boolean)])];

    const summary = generateSummary(originalText);

    const { data: noteData, error: noteError } = await supabase.from('course_notes').insert({
      user_id: user!.id,
      title: title.trim(),
      course_name: courseName.trim(),
      topic: topic.trim() || null,
      note_type: noteType,
      original_text: originalText.trim() || null,
      file_name: fileName,
      tags,
      short_summary: summary.short,
      detailed_summary: summary.detailed,
      beginner_summary: summary.beginner.whatIsIt,
      key_concepts: summary.keyConcepts,
    }).select().single();

    if (noteError || !noteData) {
      setError('Not kaydedilirken bir hata oluştu.');
      setLoading(false);
      return;
    }

    const flashcards = generateFlashcards(originalText, noteData.id, user!.id);
    if (flashcards.length > 0) {
      await supabase.from('flashcards').insert(flashcards);
    }

    const quizQuestions = generateQuizQuestions(originalText, noteData.id, user!.id);
    if (quizQuestions.length > 0) {
      await supabase.from('quiz_questions').insert(quizQuestions);
    }

    setSuccess('Not başarıyla yüklendi ve analiz edildi.');
    setLoading(false);
    setTimeout(() => navigate(`/notes/${noteData.id}`), 1200);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Not Yükle</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Ders notlarınızı yükleyin, AI analiz etsin.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            PDF veya TXT dosyasını sürükleyip bırakın
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors">
            <FileText className="w-4 h-4" />
            Dosya Seç
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
            />
          </label>
          {fileName && (
            <p className="mt-3 text-sm text-emerald-600 flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {fileName}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">Maksimum 5 MB</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Not Başlığı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Supervised Learning Temelleri"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Ders Adı *</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Makine Öğrenmesi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Konu</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Classification ve Regression"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Not Tipi</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {noteTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Not Metni</label>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            rows={8}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Not metnini buraya yapıştırın..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Etiketler (virgülle ayırın)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Machine Learning, Classification..."
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Kaydet ve Analiz Et
        </button>
      </form>
    </div>
  );
}
