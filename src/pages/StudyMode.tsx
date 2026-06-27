import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  HelpCircle,
  FileText,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  GraduationCap,
  Save,
} from 'lucide-react';
import { supabase, type CourseNote, type Flashcard, type QuizQuestion } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

type StudyTab = 'flashcard' | 'quiz' | 'summary' | 'beginner' | 'review';

export default function StudyMode() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const noteId = searchParams.get('note');
  const initialMode = (searchParams.get('mode') as StudyTab) || 'flashcard';
  const [tab, setTab] = useState<StudyTab>(initialMode);
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(noteId);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionSaved, setSessionSaved] = useState(false);

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
    setStartTime(Date.now());
  }, [user]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const noteFlashcards = useMemo(
    () => (selectedNoteId ? flashcards.filter((f) => f.note_id === selectedNoteId) : flashcards),
    [flashcards, selectedNoteId]
  );
  const noteQuiz = useMemo(
    () => (selectedNoteId ? quizQuestions.filter((q) => q.note_id === selectedNoteId) : quizQuestions),
    [quizQuestions, selectedNoteId]
  );
  const reviewFlashcards = useMemo(() => flashcards.filter((f) => f.status === 'review'), [flashcards]);

  async function saveSession(score: number, cardsStudied: number, weakTopics: string[]) {
    if (!user || sessionSaved) return;
    const duration = Math.round((Date.now() - startTime) / 1000);
    await supabase.from('study_sessions').insert({
      user_id: user.id,
      note_id: selectedNoteId,
      mode: tab,
      duration,
      flashcards_studied: cardsStudied,
      quiz_score: score,
      weak_topics: weakTopics,
    });
    setSessionSaved(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">Çalışmak için not bulunamadı.</p>
        <Link to="/upload" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowRight className="w-4 h-4" />
          Not Yükle
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Study Mode</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Seçtiğiniz not veya ders için çalışın.</p>
        </div>
        <select
          value={selectedNoteId || ''}
          onChange={(e) => { setSelectedNoteId(e.target.value || null); setSessionSaved(false); setStartTime(Date.now()); }}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm"
        >
          <option value="">Tüm Notlar</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>{n.title} ({n.course_name})</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-1 flex-wrap">
        {[
          { key: 'flashcard' as StudyTab, label: 'Flashcard Çalış', icon: Layers },
          { key: 'quiz' as StudyTab, label: 'Quiz Çöz', icon: HelpCircle },
          { key: 'summary' as StudyTab, label: 'Hızlı Özet', icon: FileText },
          { key: 'beginner' as StudyTab, label: 'Beginner Mode', icon: Lightbulb },
          { key: 'review' as StudyTab, label: 'Tekrar Gerekli', icon: RotateCcw },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSessionSaved(false); setStartTime(Date.now()); }}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t.key
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

      <div className="min-h-[300px]">
        {tab === 'flashcard' && (
          <FlashcardStudy
            flashcards={noteFlashcards}
            onComplete={(count) => saveSession(0, count, [])}
          />
        )}
        {tab === 'quiz' && (
          <QuizStudy
            questions={noteQuiz}
            onComplete={(score, weak) => saveSession(score, 0, weak)}
          />
        )}
        {tab === 'summary' && <SummaryStudy note={selectedNote} />}
        {tab === 'beginner' && <BeginnerStudy note={selectedNote} />}
        {tab === 'review' && <ReviewStudy flashcards={reviewFlashcards} />}
      </div>

      {sessionSaved && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl">
          <Save className="w-4 h-4" />
          Çalışma oturumu kaydedildi.
        </div>
      )}
    </div>
  );
}

function FlashcardStudy({ flashcards, onComplete }: { flashcards: Flashcard[]; onComplete: (count: number) => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [marked, setMarked] = useState<Record<string, 'learned' | 'review'>>({});

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Bu not için flashcard bulunamadı.</p>
      </div>
    );
  }

  if (completed) {
    const learned = Object.values(marked).filter((v) => v === 'learned').length;
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
        <h3 className="text-xl font-bold">Tebrikler!</h3>
        <p className="text-gray-600 dark:text-gray-400">{learned} / {flashcards.length} kart öğrenildi.</p>
        <button
          onClick={() => { setIndex(0); setFlipped(false); setCompleted(false); setMarked({}); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Tekrar Başla
        </button>
      </div>
    );
  }

  const fc = flashcards[index];

  function next(status: 'learned' | 'review') {
    setMarked((prev) => ({ ...prev, [fc.id]: status }));
    if (index + 1 >= flashcards.length) {
      setCompleted(true);
      onComplete(flashcards.length);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Kart {index + 1} / {flashcards.length}</span>
        <span>{Math.round(((index) / flashcards.length) * 100)}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${((index) / flashcards.length) * 100}%` }}
        />
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 min-h-[200px] flex items-center justify-center text-center transition-all hover:shadow-md"
      >
        <div>
          <p className="text-xs text-gray-400 mb-3">{fc.difficulty} {fc.tag ? `• ${fc.tag}` : ''}</p>
          <p className="text-lg font-medium">{flipped ? fc.answer : fc.question}</p>
          <p className="text-xs text-gray-400 mt-4">Kartı çevirmek için tıklayın</p>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => next('review')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Tekrar Gerekli
        </button>
        <button
          onClick={() => next('learned')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Öğrenildi
        </button>
      </div>
    </div>
  );
}

function QuizStudy({ questions, onComplete }: { questions: QuizQuestion[]; onComplete: (score: number, weak: string[]) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Bu not için quiz bulunamadı.</p>
      </div>
    );
  }

  function handleSelect(qid: string, opt: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  }

  function handleSubmit() {
    let correct = 0;
    const weak: string[] = [];
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
      else if (q.tag) weak.push(q.tag);
    });
    setScore(Math.round((correct / questions.length) * 100));
    setSubmitted(true);
    onComplete(Math.round((correct / questions.length) * 100), [...new Set(weak)]);
  }

  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {submitted && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200">
          <p className="font-semibold">Sonuç: {score}% başarı</p>
        </div>
      )}
      {questions.map((q, idx) => (
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

function SummaryStudy({ note }: { note: CourseNote | undefined }) {
  if (!note) {
    return (
      <div className="text-center py-16 text-gray-500">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Lütfen bir not seçin.</p>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Kısa Özet</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{note.short_summary || 'Özet bulunamadı.'}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Detaylı Özet</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{note.detailed_summary || 'Özet bulunamadı.'}</p>
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

function BeginnerStudy({ note }: { note: CourseNote | undefined }) {
  if (!note) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Lütfen bir not seçin.</p>
      </div>
    );
  }
  const summary = note.original_text ? require('../lib/aiEngine').generateSummary(note.original_text) : null;
  const b = summary?.beginner;
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/20">
        <h3 className="font-semibold mb-2">Bu konu ne demek?</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b?.whatIsIt || note.short_summary || '-'}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Basit örnek</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b?.simpleExample || 'Örnek bulunamadı.'}</p>
      </div>
      <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold mb-2">Günlük hayattan benzetme</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{b?.analogy || 'Benzetme bulunamadı.'}</p>
      </div>
    </div>
  );
}

function ReviewStudy({ flashcards }: { flashcards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <RotateCcw className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Tekrar gerekli flashcard bulunamadı.</p>
      </div>
    );
  }

  const fc = flashcards[index];

  function next() {
    if (index + 1 >= flashcards.length) {
      setIndex(0);
      setFlipped(false);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Kart {index + 1} / {flashcards.length}</span>
      </div>
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 min-h-[200px] flex items-center justify-center text-center transition-all hover:shadow-md"
      >
        <div>
          <p className="text-xs text-gray-400 mb-3">{fc.difficulty} {fc.tag ? `• ${fc.tag}` : ''}</p>
          <p className="text-lg font-medium">{flipped ? fc.answer : fc.question}</p>
          <p className="text-xs text-gray-400 mt-4">Kartı çevirmek için tıklayın</p>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={next}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          Sonraki
        </button>
      </div>
    </div>
  );
}
