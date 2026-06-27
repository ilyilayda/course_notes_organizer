import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BookOpen,
  Layers,
  HelpCircle,
  TrendingUp,
  Award,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { supabase, type CourseNote, type Flashcard, type QuizQuestion, type StudySession } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    async function fetchData() {
      const [{ data: n }, { data: f }, { data: q }, { data: s }] = await Promise.all([
        supabase.from('course_notes').select('*').eq('user_id', uid),
        supabase.from('flashcards').select('*').eq('user_id', uid),
        supabase.from('quiz_questions').select('*').eq('user_id', uid),
        supabase.from('study_sessions').select('*').eq('user_id', uid).order('created_at', { ascending: true }),
      ]);
      setNotes(n || []);
      setFlashcards(f || []);
      setQuizQuestions(q || []);
      setSessions(s || []);
      setLoading(false);
    }
    fetchData();
  }, [user]);

  const totalNotes = notes.length;
  const totalFlashcards = flashcards.length;
  const learnedCards = flashcards.filter((f) => f.status === 'learned').length;
  const reviewCards = flashcards.filter((f) => f.status === 'review').length;
  const avgQuizScore = sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.quiz_score, 0) / sessions.length) : 0;

  const courseCounts: Record<string, number> = {};
  notes.forEach((n) => { courseCounts[n.course_name] = (courseCounts[n.course_name] || 0) + 1; });
  const mostStudiedCourse = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const weakTopics = useMemo(() => {
    const topicScores: Record<string, { total: number; correct: number }> = {};
    sessions.forEach((s) => {
      if (s.weak_topics) {
        s.weak_topics.forEach((t) => {
          topicScores[t] = topicScores[t] || { total: 0, correct: 0 };
          topicScores[t].total += 1;
        });
      }
    });
    return Object.entries(topicScores)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3)
      .map(([t]) => t);
  }, [sessions]);

  const courseDistribution = useMemo(
    () => Object.entries(courseCounts).map(([name, value]) => ({ name, value })),
    [courseCounts]
  );

  const quizTrend = useMemo(
    () =>
      sessions.map((s, i) => ({
        name: `Oturum ${i + 1}`,
        score: s.quiz_score,
      })),
    [sessions]
  );

  const flashcardStatus = useMemo(
    () => [
      { name: 'Yeni', value: totalFlashcards - learnedCards - reviewCards },
      { name: 'Öğrenildi', value: learnedCards },
      { name: 'Tekrar', value: reviewCards },
    ],
    [totalFlashcards, learnedCards, reviewCards]
  );

  const weeklyActivity = useMemo(() => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const counts = Array(7).fill(0);
    sessions.forEach((s) => {
      const d = new Date(s.created_at).getDay();
      const idx = d === 0 ? 6 : d - 1;
      counts[idx] += 1;
    });
    return days.map((day, i) => ({ day, count: counts[i] }));
  }, [sessions]);

  const tagDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => {
      (n.tags || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [notes]);

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
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Çalışma verilerinizin analizi.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Toplam Not" value={totalNotes} color="blue" />
        <StatCard icon={Layers} label="Flashcard" value={totalFlashcards} color="emerald" />
        <StatCard icon={HelpCircle} label="Ortalama Quiz Skoru" value={`${avgQuizScore}%`} color="amber" />
        <StatCard icon={Award} label="En Çok Çalışılan Ders" value={mostStudiedCourse} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Ders Bazlı Not Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz trend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Quiz Skor Trendi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flashcard status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Flashcard Öğrenme Durumu</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={flashcardStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {flashcardStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly activity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Haftalık Çalışma Aktivitesi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tag distribution */}
      {tagDistribution.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold mb-4">Topic Tag Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Öğrenildi Kartlar</h3>
          </div>
          <p className="text-2xl font-bold">{learnedCards}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold">Tekrar Gerekli</h3>
          </div>
          <p className="text-2xl font-bold">{reviewCards}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold">En Zayıf Konu</h3>
          </div>
          <p className="text-lg font-bold truncate">{weakTopics[0] || '-'}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof BookOpen; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
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
