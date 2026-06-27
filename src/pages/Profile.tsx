import { useState, useEffect } from 'react';
import { Save, User, Mail, BookOpen, Target, Clock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/useTheme';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [targetCourses, setTargetCourses] = useState('');
  const [dailyGoal, setDailyGoal] = useState(30);
  const [weeklyGoal, setWeeklyGoal] = useState(150);
  const [preferredMode, setPreferredMode] = useState('flashcard');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDepartment(profile.department || '');
      setTargetCourses((profile.target_courses || []).join(', '));
      setDailyGoal(profile.daily_study_goal || 30);
      setWeeklyGoal(profile.weekly_study_goal || 150);
      setPreferredMode(profile.preferred_study_mode || 'flashcard');
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const courses = targetCourses.split(',').map((c) => c.trim()).filter(Boolean);
    await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        department: department.trim() || null,
        target_courses: courses,
        daily_study_goal: dailyGoal,
        weekly_study_goal: weeklyGoal,
        preferred_study_mode: preferredMode,
        theme_preference: theme,
      })
      .eq('user_id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Hesap bilgilerinizi ve tercihlerinizi yönetin.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="font-semibold">Kişisel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bölüm</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Bilgisayar Mühendisliği"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Hedef Dersler (virgülle ayırın)</label>
              <input
                type="text"
                value={targetCourses}
                onChange={(e) => setTargetCourses(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Makine Öğrenmesi, Veri Madenciliği..."
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="font-semibold">Çalışma Hedefleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Günlük Çalışma Hedefi (dakika)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  min={5}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Haftalık Çalışma Hedefi (dakika)</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  min={10}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tercih Edilen Çalışma Modu</label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="flashcard">Flashcard</option>
                <option value="quiz">Quiz</option>
                <option value="summary">Özet</option>
                <option value="beginner">Beginner Mode</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tema Tercihi</label>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Karanlık Mod' : 'Aydınlık Mod'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">Bilgiler kaydedildi!</span>
          )}
        </div>
      </form>
    </div>
  );
}
