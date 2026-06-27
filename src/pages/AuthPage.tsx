import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../lib/authContext';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register') {
      if (!fullName.trim()) {
        setError('Ad Soyad alanı zorunludur.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır.');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName);
      if (err) setError(err.message || 'Kayıt olurken bir hata oluştu.');
      else navigate('/dashboard');
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError('E-posta veya şifre hatalı.');
      else navigate('/dashboard');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Course Notes AI</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Ders materyallerini akıllı çalışma kaynaklarına dönüştür.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-5">
            {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Ad Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ornek@edu.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            {mode === 'login' ? (
              <>
                Hesabın yok mu?{' '}
                <Link to="/register" className="text-blue-600 font-medium hover:underline">
                  Kayıt ol
                </Link>
              </>
            ) : (
              <>
                Zaten hesabın var mı?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">
                  Giriş yap
                </Link>
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Demo olarak devam et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
