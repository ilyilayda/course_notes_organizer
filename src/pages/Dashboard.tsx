import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  HelpCircle,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { supabase, type CourseNote, type Flashcard, type QuizQuestion, type StudySession } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { generateStudyRecommendations } from '../lib/aiEngine';

export default function Dashboard() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalNotes = notes.length;
  const totalFlashcards = flashcards.length;
  const totalQuiz = quizQuestions.length;
  const thisWeekSessions = sessions.filter((s) => {
    const d = new Date(s.created_at);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const avgQuizScore = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.quiz_score, 0) / sessions.length) : 0;

  const courseCounts: Record<string, number> = {};
  notes.forEach((n) => { courseCounts[n.course_name] = (courseCounts[n.course_name] || 0) + 1; });
  const mostStudiedCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const recommendations = generateStudyRecommendations(notes, flashcards, quizQuestions, sessions);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Çalışma durumunuzun genel görünümü.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Toplam Not" value={totalNotes} color="blue" />
        <StatCard icon={Layers} label="Flashcard" value={totalFlashcards} color="emerald" />
        <StatCard icon={HelpCircle} label="Quiz Soru" value={totalQuiz} color="amber" />
        <StatCard icon={Clock} label="Bu Hafta Oturum" value={thisWeekSessions.length} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secondary stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Quiz Başarısı</span>
            </div>
            <p className="text-2xl font-bold">{avgQuizScore}%</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">En Çok Çalışılan Ders</span>
            </div>
            <p className="text-2xl font-bold truncate">{mostStudiedCourse}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Son Eklenen Not</span>
            </div>
            <p className="text-lg font-semibold truncate">{notes[0]?.title || '-'}</p>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bugünkü Çalışma Önerisi</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{recommendations[0] || 'Çalışmaya devam edin.'}</p>
          </div>
        </div>

        {/* AI Assistant panel */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">AI Study Assistant</h3>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-blue-50">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                {rec}
              </div>
            ))}
          </div>
          <Link
            to="/assistant"
            className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-white/90 hover:text-white"
          >
            Tüm önerileri gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent notes */}
      {notes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Son Notlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.slice(0, 6).map((note) => (
              <Link
                key={note.id}
                to={`/notes/${note.id}`}
                className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-semibold truncate">{note.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{note.course_name}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {note.tags?.slice(0, 3).map((t) => (
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
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof BookOpen; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
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
