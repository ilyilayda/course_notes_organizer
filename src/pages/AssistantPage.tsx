import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, HelpCircle, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { supabase, type CourseNote, type Flashcard, type QuizQuestion, type StudySession } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { generateStudyRecommendations } from '../lib/aiEngine';

export default function AssistantPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    async function fetchData() {
      const [{ data: n }, { data: f }, { data: q }, { data: s }] = await Promise.all([
        supabase.from('course_notes').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
        supabase.from('flashcards').select('*').eq('user_id', uid),
        supabase.from('quiz_questions').select('*').eq('user_id', uid),
        supabase.from('study_sessions').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      ]);
      setNotes(n || []);
      setFlashcards(f || []);
      setQuizQuestions(q || []);
      setSessions(s || []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const recommendations = generateStudyRecommendations(notes, flashcards, quizQuestions, sessions);

  const reviewCards = flashcards.filter((f) => f.status === 'review');
  const notesWithoutQuiz = notes.filter((n) => !quizQuestions.some((q) => q.note_id === n.id));
  const courseCounts: Record<string, number> = {};
  notes.forEach((n) => { courseCounts[n.course_name] = (courseCounts[n.course_name] || 0) + 1; });
  const mostStudiedCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const avgQuizScore = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.quiz_score, 0) / sessions.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">AI Study Assistant</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Notlarınıza, quiz sonuçlarınıza ve flashcard durumunuza göre kişiselleştirilmiş öneriler.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard icon={Layers} label="Tekrar Gerekli Kart" value={reviewCards.length} color="red" />
        <InsightCard icon={HelpCircle} label="Quiz'siz Not" value={notesWithoutQuiz.length} color="amber" />
        <InsightCard icon={TrendingUp} label="Ortalama Quiz Skoru" value={`${avgQuizScore}%`} color="emerald" />
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Çalışma Önerileri</h2>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-blue-50 bg-white/10 rounded-xl px-4 py-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              {rec}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notesWithoutQuiz.length > 0 && (
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold">Quiz Oluşturulmamış Notlar</h3>
            </div>
            <div className="space-y-2">
              {notesWithoutQuiz.slice(0, 5).map((n) => (
                <Link
                  key={n.id}
                  to={`/notes/${n.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium truncate">{n.title}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {reviewCards.length > 0 && (
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Tekrar Gerekli Flashcard'lar</h3>
            </div>
            <div className="space-y-2">
              {reviewCards.slice(0, 5).map((fc) => (
                <Link
                  key={fc.id}
                  to={`/study?note=${fc.note_id}&mode=review`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium truncate">{fc.question}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
            <Link
              to="/study?mode=review"
              className="inline-flex items-center gap-1 text-sm text-blue-600 mt-3 hover:underline"
            >
              Tümünü çalış
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">En Çok Çalışılan Ders</h3>
          </div>
          <p className="text-lg font-bold">{mostStudiedCourse}</p>
          <p className="text-sm text-gray-500 mt-1">Bu derste {courseCounts[mostStudiedCourse] || 0} not kaydedildi.</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold">Zayıf Olunan Konular</h3>
          </div>
          {sessions.some((s) => s.quiz_score < 50) ? (
            <div className="space-y-2">
              {sessions
                .filter((s) => s.quiz_score < 50 && s.weak_topics)
                .flatMap((s) => s.weak_topics || [])
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .slice(0, 5)
                .map((topic) => (
                  <div key={topic} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {topic}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Henüz zayıf konu tespit edilmedi.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, color }: { icon: typeof Layers; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  };
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
