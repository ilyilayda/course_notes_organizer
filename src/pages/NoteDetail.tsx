import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  HelpCircle,
  GraduationCap,
  Tag,
  Clock,
  FileText,
  Edit3,
  RefreshCw,
  Copy,
  CheckCircle,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import { supabase, type CourseNote, type Flashcard, type QuizQuestion } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { generateSummary, generateFlashcards, generateQuizQuestions } from '../lib/aiEngine';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState<CourseNote | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz' | 'beginner'>('summary');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    async function fetchData() {
      const [{ data: n }, { data: f }, { data: q }] = await Promise.all([
        supabase.from('course_notes').select('*').eq('id', id).maybeSingle(),
        supabase.from('flashcards').select('*').eq('note_id', id),
        supabase.from('quiz_questions').select('*').eq('note_id', id),
      ]);
      setNote(n);
      setFlashcards(f || []);
      setQuizQuestions(q || []);
      setLoading(false);
    }
    fetchData();
  }, [id, user]);

  async function handleReanalyze() {
    if (!note || !id) return;
    const text = note.original_text || '';
    if (!text.trim()) {
      alert('Yeniden analiz için not metni gereklidir.');
      return;
    }
    setLoading(true);

    const summary = generateSummary(text);
    await supabase.from('course_notes').update({
      short_summary: summary.short,
      detailed_summary: summary.detailed,
      beginner_summary: summary.beginner.whatIsIt,
      key_concepts: summary.keyConcepts,
    }).eq('id', id);

    const newFlashcards = generateFlashcards(text, id, user!.id);
    if (newFlashcards.length > 0) {
      await supabase.from('flashcards').delete().eq('note_id', id);
      await supabase.from('flashcards').insert(newFlashcards);
    }

    const newQuiz = generateQuizQuestions(text, id, user!.id);
    if (newQuiz.length > 0) {
      await supabase.from('quiz_questions').delete().eq('note_id', id);
      await supabase.from('quiz_questions').insert(newQuiz);
    }

    const [{ data: n }, { data: f }, { data: q }] = await Promise.all([
      supabase.from('course_notes').select('*').eq('id', id).maybeSingle(),
      supabase.from('flashcards').select('*').eq('note_id', id),
      supabase.from('quiz_questions').select('*').eq('note_id', id),
    ]);
    setNote(n);
    setFlashcards(f || []);
    setQuizQuestions(q || []);
    setLoading(false);
  }

  function copyMarkdown() {
    if (!note) return;
    const md = [
      `# ${note.title}`,
      `**Ders:** ${note.course_name}`,
      `**Konu:** ${note.topic || '-'}`,
      ``,
      `## Kısa Özet`,
      note.short_summary || '-',
      ``,
      `## Detaylı Özet`,
      note.detailed_summary || '-',
      ``,
      `## Anahtar Kavramlar`,
      ...(note.key_concepts || []).map((c) => `- ${c}`),
      ``,
      `## Topic Tags`,
      ...(note.tags || []).map((t) => `- ${t}`),
      ``,
      `## Flashcards`,
      ...flashcards.map((fc) => `- **S:** ${fc.question}  **C:** ${fc.answer}`),
      ``,
      `## Quiz Soruları`,
      ...quizQuestions.map((q, i) => `${i + 1}. ${q.question}\\nDoğru: ${q.correct_answer}`),
    ].join('\\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <AlertCircle className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-lg font-medium">Not bulunamadı</p>
        <Link to="/notes" className="mt-4 text-blue-600 hover:underline">Notlara dön</Link>
      </div>
    );
  }

  const tabs = [
    { key: 'summary' as const, label: 'Özet', icon: FileText },
    { key: 'flashcards' as const, label: 'Flashcards', icon: Layers },
    { key: 'quiz' as const, label: 'Quiz', icon: HelpCircle },
    { key: 'beginner' as const, label: 'Beginner Mode', icon: Lightbulb },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{note.title}</h1>
          <p className="text-sm text-gray-500">{note.course_name} {note.topic ? `• ${note.topic}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/notes/${note.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Düzenle
          </Link>
          <button
            onClick={handleReanalyze}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yeniden Analiz Et
          </button>
          <button
            onClick={copyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı' : 'Markdown Kopyala'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {note.note_type}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {new Date(note.created_at).toLocaleDateString('tr-TR')}
        </span>
        <span className="inline-flex items-center gap-1">
          <Layers className="w-4 h-4" />
          {flashcards.length} flashcard
        </span>
        <span className="inline-flex items-center gap-1">
          <HelpCircle className="w-4 h-4" />
          {quizQuestions.length} quiz
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {note.tags?.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
            <Tag className="w-3 h-3" />
            {t}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === t.key
                  ? 'text-blue-700 dark:text-blue-300 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[200px]">
        {activeTab === 'summary' && <SummaryTab note={note} />}
        {activeTab === 'flashcards' && <FlashcardsTab flashcards={flashcards} />}
        {activeTab === 'quiz' && <QuizTab quizQuestions={quizQuestions} />}
        {activeTab === 'beginner' && <BeginnerTab note={note} />}
      </div>

      <div className="flex gap-3 pt-4">
        <Link
          to={`/study?note=${note.id}&mode=flashcard`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
          Study Mode'a Geç
        </Link>
      </div>
    </div>
  );
}

function SummaryTab({ note }: { note: CourseNote }) {
  if (!note.short_summary && !note.detailed_summary) {
    return (
      <div className="text-gray-500 text-center py-10">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Henüz özet oluşturulmadı. Yeniden analiz edebilirsiniz.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Kısa Özet</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{note.short_summary}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Detaylı Özet</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{note.detailed_summary}</p>
      </div>
      {note.key_concepts && note.key_concepts.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-2">Anahtar Kavramlar</h3>
          <div className="flex flex-wrap gap-2">
            {note.key_concepts.map((c) => (
              <span key={c} className="px-3 py-1 rounded-full text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FlashcardsTab({ flashcards }: { flashcards: Flashcard[] }) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  if (flashcards.length === 0) {
    return (
      <div className="text-gray-500 text-center py-10">
        <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Henüz flashcard oluşturulmadı.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {flashcards.map((fc) => (
        <div
          key={fc.id}
          onClick={() => setFlipped((prev) => ({ ...prev, [fc.id]: !prev[fc.id] }))}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-all min-h-[140px] flex items-center justify-center text-center"
        >
          <div>
            <p className="text-xs text-gray-400 mb-2">{fc.difficulty} {fc.tag ? `• ${fc.tag}` : ''}</p>
            <p className="font-medium">
              {flipped[fc.id] ? fc.answer : fc.question}
            </p>
            <p className="text-xs text-gray-400 mt-3">Kartı çevirmek için tıklayın</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuizTab({ quizQuestions }: { quizQuestions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (quizQuestions.length === 0) {
    return (
      <div className="text-gray-500 text-center py-10">
        <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Henüz quiz oluşturulmadı.</p>
      </div>
    );
  }

  function handleSelect(qid: string, opt: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  }

  function handleSubmit() {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  }

  const allAnswered = quizQuestions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6">
      {submitted && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200">
          <p className="font-semibold">Sonuç: {score} / {quizQuestions.length} doğru</p>
        </div>
      )}
      {quizQuestions.map((q, idx) => (
        <div key={q.id} className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium">{idx + 1}</span>
            <span className="text-xs text-gray-400">{q.difficulty} {q.tag ? `• ${q.tag}` : ''}</span>
          </div>
          <p className="font-medium mb-4">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt;
              const isCorrect = opt === q.correct_answer;
              const showCorrect = submitted && isCorrect;
              const showWrong = submitted && selected && !isCorrect;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(q.id, opt)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                    showCorrect
                      ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                      : showWrong
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                      : selected
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="mt-3 text-xs text-gray-500">{q.explanation}</p>
          )}
        </div>
      ))}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Quiz'i Bitir
        </button>
      )}
    </div>
  );
}

function BeginnerTab({ note }: { note: CourseNote }) {
  const summary = generateSummary(note.original_text || '');
  const b = summary.beginner;
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/20">
        <h3 className="font-semibold mb-2">Bu konu ne demek?</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b.whatIsIt}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Neden önemli?</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b.whyImportant}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Basit örnek</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b.simpleExample}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Günlük hayattan benzetme</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b.analogy}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">En önemli 3 nokta</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
          {b.topThreePoints.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
        <h3 className="font-semibold mb-2">Sınav için bilmen gereken kısa özet</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b.examShort}</p>
      </div>
    </div>
  );
}
