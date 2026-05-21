"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { LogOut, User, BrainCircuit } from 'lucide-react';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-[0_25px_50px_-20px_rgba(0,0,0,0.45)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between h-full py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/60 px-4 py-2 text-white transition hover:border-cyan-400/30 hover:bg-slate-900/90">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/15">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">IA Recruiter</p>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {isAuthenticated ? (
              <> 
                <Link
                  href={user?.role === 'COMPANY' ? '/company' : '/candidate'}
                  className="inline-flex items-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/15"
                >
                  Panel
                </Link>

                <div className="hidden sm:flex h-10 w-px bg-slate-700" />

                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{user?.name}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">{user?.role === 'COMPANY' ? 'Empresa' : 'Candidato'}</span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-white/10 text-cyan-300">
                    <User className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="text-slate-200 hover:text-white px-4 py-2 rounded-2xl text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 shadow-[0_15px_35px_-25px_rgba(56,189,248,0.8)]"
                >
                  Regístrate
                </Link>
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
