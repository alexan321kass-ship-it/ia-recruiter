'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase, GraduationCap, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CANDIDATE' | 'COMPANY'>('CANDIDATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      login(response.data.user, response.data.access_token);
      
      if (response.data.user.role === 'COMPANY') {
        router.push('/company');
      } else {
        router.push('/candidate');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07101f] px-4 py-10">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-surface-900/95 p-10 shadow-[0_35px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 mb-8 text-center">
          <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-primary-500 to-cyan-400" />
          <h1 className="text-3xl font-semibold text-white mb-2">Crear cuenta</h1>
          <p className="text-sm text-gray-400">Regístrate y comienza a gestionar tu reclutamiento.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Tipo de cuenta</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={role === 'CANDIDATE'}
                onClick={() => setRole('CANDIDATE')}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left hover:scale-[1.01] ${role === 'CANDIDATE' ? 'border-cyan-500 bg-cyan-500/6 ring-1 ring-cyan-500/30' : 'border-white/5 bg-slate-900/40'}`}
              >
                <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${role === 'CANDIDATE' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : 'bg-white/3 text-slate-300 border border-white/5'}`}>
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Candidato</p>
                </div>
              </button>

              <button
                type="button"
                aria-pressed={role === 'COMPANY'}
                onClick={() => setRole('COMPANY')}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left hover:scale-[1.01] ${role === 'COMPANY' ? 'border-cyan-500 bg-cyan-500/6 ring-1 ring-cyan-500/30' : 'border-white/5 bg-slate-900/40'}`}
              >
                <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${role === 'COMPANY' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : 'bg-white/3 text-slate-300 border border-white/5'}`}>
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Empresa</p>
                </div>
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre Completo
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <User className="h-5 w-5" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-3xl border border-white/10 bg-surface-900 px-4 py-3 pl-12 text-white shadow-sm outline-none transition duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                placeholder={role === 'COMPANY' ? 'Nombre de la Empresa' : 'Juan Pérez'}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-3xl border border-white/10 bg-surface-900 px-4 py-3 pl-12 text-white shadow-sm outline-none transition duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-3xl border border-white/10 bg-surface-900 px-4 py-3 pl-12 text-white shadow-sm outline-none transition duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-to-r from-primary-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-20px_rgba(99,102,241,0.7)] transition duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Crear Cuenta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
