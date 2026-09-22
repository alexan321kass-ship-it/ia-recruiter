'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { Briefcase, ChevronRight, Search, Loader2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  experience: number;
  company: { id: string; name: string };
}

export default function ExploreJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error al obtener vacantes', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const totalJobs = jobs.length;
  const resultCount = filtered.length;
  const topSkills = Object.entries(
    jobs.reduce((acc, job) => {
      job.skills.forEach((skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.7)] backdrop-blur-xl mb-10">
        <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80 mb-3">Panel de Vacantes</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">Explorar las mejores oportunidades</h1>
            <p className="mt-4 text-slate-400 text-lg sm:text-xl max-w-2xl">Encuentra una vacante que se ajuste a tu perfil y postúlate con tu CV optimizado por IA. Filtra por habilidades y descubre lo más relevante para ti.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
            <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vacantes disponibles</p>
              <p className="mt-3 text-3xl font-semibold text-white">{totalJobs}</p>
              <p className="mt-2 text-sm text-slate-400">Publicaciones abiertas ahora mismo.</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resultados</p>
              <p className="mt-3 text-3xl font-semibold text-cyan-300">{resultCount}</p>
              <p className="mt-2 text-sm text-slate-400">Vacantes coincidentes con tu búsqueda.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr] mb-10">
        <div className="relative rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)]">
          <Search className="absolute left-5 top-5 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, empresa o habilidad..."
            className="w-full pl-12 pr-4 py-4 bg-transparent border border-slate-800 rounded-3xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
          />
          <p className="mt-3 text-sm text-slate-500">Prueba con términos como <span className="text-slate-300">React</span>, <span className="text-slate-300">Node</span> o <span className="text-slate-300">UX</span>.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm uppercase tracking-[0.3em] text-slate-500">Tendencias</h2>
            <span className="text-xs text-slate-400">Basado en tus búsquedas</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {topSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => setSearch(skill)}
                className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-500/30 hover:bg-cyan-500/10"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-cyan-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.75)]">
          <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No se encontraron vacantes</h3>
          <p className="text-slate-400">Intenta con otra búsqueda o vuelve más tarde para ver nuevas publicaciones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((job) => (
            <Link key={job.id} href={`/candidate/jobs/${job.id}`}>
              <div className="group h-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-6 shadow-[0_25px_100px_-60px_rgba(0,0,0,0.8)] transition-all hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_30px_120px_-60px_rgba(6,182,212,0.25)] cursor-pointer">
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{job.company?.name || 'Empresa'}</span>
                      <h3 className="mt-4 text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{job.title}</h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{job.experience} años</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-400 line-clamp-3">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {job.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-200 border border-white/10">{skill}</span>
                    ))}
                    {job.skills.length > 5 && (
                      <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs text-slate-400 border border-white/10">+{job.skills.length - 5} más</span>
                    )}
                  </div>
                  <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between text-sm text-slate-400">
                    <span className="text-slate-400">Ver detalles</span>
                    <ChevronRight className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
