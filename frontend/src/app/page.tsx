'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ArrowRight, BrainCircuit, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.12),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(38,194,255,0.08),_transparent_18%)]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/95 to-transparent pointer-events-none" />

      <div className="relative z-10 px-4 py-24 sm:px-6 lg:px-8">
        <section className="mx-auto flex flex-col items-center justify-center text-center max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 mb-8">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Reclutamiento con IA para decisiones más inteligentes
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight mb-6">
            Encuentra al <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-slate-100 to-indigo-300">candidato ideal</span> en segundos.
          </h1>

          <p className="max-w-3xl text-base sm:text-lg text-slate-300 leading-8 mb-10">
            Analizamos currículums en PDF al instante y ofrecemos una evaluación objetiva para que tu equipo contrate con confianza.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_70px_-40px_rgba(56,189,248,0.8)] transition duration-200 hover:brightness-110"
            >
              Regístrate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-white/10"
            >
              Iniciar sesión
            </Link>
          </div>
        </section>

        <section className="mt-20 max-w-7xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)] transition hover:-translate-y-1 hover:border-cyan-400/20">
            <div className="mb-6 h-12 w-12 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-300">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Lectura inteligente de CVs</h3>
            <p className="text-slate-300 text-sm leading-6">Extrae experiencia, habilidades y nivel de estudios de PDFs automáticamente.</p>
          </div>
          <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)] transition hover:-translate-y-1 hover:border-indigo-400/20">
            <div className="mb-6 h-12 w-12 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-300">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Puntuación precisa</h3>
            <p className="text-slate-300 text-sm leading-6">Evalúa compatibilidad entre candidato y vacante con un puntaje claro y rápido.</p>
          </div>
          <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)] transition hover:-translate-y-1 hover:border-slate-300/20">
            <div className="mb-6 h-12 w-12 rounded-3xl bg-slate-500/10 flex items-center justify-center text-slate-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Evaluación imparcial</h3>
            <p className="text-slate-300 text-sm leading-6">La IA se enfoca solo en datos y competencias demostradas, no en sesgos.</p>
          </div>
        </section>

        <section className="mt-20 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-sm uppercase tracking-[0.80em] text-cyan-300 mb-3">Cómo funciona</h2>
              <p className="mt-3 text-slate-300 text-sm leading-6">Te explicamos qué ocurre en cada paso para que el proceso sea transparente y rápido.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm font-semibold text-cyan-300 mb-3">1. Carga</p>
                <p className="text-sm text-slate-300 leading-6">Sube tu CV en PDF y la plataforma lo procesa automáticamente.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm font-semibold text-cyan-300 mb-3">2. Análisis</p>
                <p className="text-sm text-slate-300 leading-6">La IA extrae experiencia, habilidades y datos relevantes para tu perfil.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <p className="text-sm font-semibold text-cyan-300 mb-3">3. Resultados</p>
                <p className="text-sm text-slate-300 leading-6">Obtienes un reporte claro con compatibilidad y recomendaciones.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
