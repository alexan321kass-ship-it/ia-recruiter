'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import Link from 'next/link';
import { Plus, Briefcase, Users, BrainCircuit, ChevronRight, Calendar, X, Mail, MapPin, Sparkles } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  experience: number;
  createdAt: string;
  companyId: string;
}

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ jobsCount: 0, analysesCount: 0, uniqueCandidates: 0 });
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  
  // Modal State
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, statsRes, analysesRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/analysis/stats/company'),
          api.get('/analysis/company/all')
        ]);
        
        const myJobs = jobsRes.data.filter((j: any) => j.companyId === user?.id);
        setJobs(myJobs);
        setStats(statsRes.data);
        setRecentAnalyses(analysesRes.data.slice(0, 5)); // Solo los últimos 5
      } catch (error) {
        console.error('Error al obtener datos del dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnalysis || !scheduledAt || !location) return;

    setScheduling(true);
    try {
      await api.post('/interviews/schedule', {
        analysisId: selectedAnalysis.id,
        scheduledAt,
        location,
        notes
      });
      alert('¡Entrevista programada y correo enviado!');
      setSelectedAnalysis(null);
      setScheduledAt('');
      setLocation('');
      setNotes('');
    } catch (error) {
      console.error('Error scheduling interview', error);
      alert('Error al programar la entrevista');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full bg-grid">
      {/* Dashboard Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Panel de Empresa</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona tus vacantes y candidatos clasificados por IA.</p>
        </div>
        <Link
          href="/company/create"
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_20px_60px_-30px_rgba(0,255,255,0.25)] active:scale-95 duration-200 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Publicar Vacante</span>
        </Link>
      </div>

      

      {/* Modern Neutral Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/90 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-semibold">Vacantes Activas</p>
            <p className="text-3xl font-black text-white mt-2">{stats.jobsCount}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/90 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-semibold">Candidatos Únicos</p>
            <p className="text-3xl font-black text-white mt-2">{stats.uniqueCandidates}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/90 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-semibold">Análisis Realizados</p>
            <p className="text-3xl font-black text-white mt-2">{stats.analysesCount}</p>
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Vacantes */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white mb-2">Tus Vacantes</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-900/60 rounded-2xl animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass p-12 text-center rounded-2xl border border-white/5">
              <div className="mx-auto w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-4 text-slate-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Aún no has publicado vacantes</h3>
              <p className="text-xs text-slate-400 mb-6 font-light">Comienza creando tu primera vacante para atraer candidatos.</p>
              <Link
                href="/company/create"
                className="inline-block bg-white text-slate-950 hover:bg-slate-100 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Crear Vacante
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => (
                  <div key={job.id} className="group">
                    <div className="glass p-4 sm:p-5 rounded-3xl border border-white/8 hover:border-cyan-500/25 transition-all cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-12 w-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-300 border border-cyan-500/15 transition-all">
                          <Briefcase className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                          <Link href={`/company/job/${job.id}`} className="block">
                            <h3 className="text-base font-bold text-white truncate hover:text-slate-300 transition-colors">{job.title}</h3>
                            <p className="text-[12px] text-slate-300 truncate mt-1">{job.experience} años • Publicada {new Date(job.createdAt).toLocaleDateString('es')}</p>
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/company/job/${job.id}`} className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 text-slate-200 text-xs font-medium hover:bg-white/10 transition">
                          Ver vacante
                        </Link>
                        <Link href={`/company/job/${job.id}`} className="inline-flex items-center justify-center p-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition" title="Ver detalles">
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Candidatos Recientes */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300 font-semibold">Postulaciones Recientes</p>
                <h2 className="text-xl font-bold text-white mt-2">Candidatos principales</h2>
              </div>
              <Sparkles className="h-7 w-7 text-cyan-300" />
            </div>
            <p className="text-sm text-slate-400 mt-4 leading-6">
              Revisa los candidatos mejor evaluados y programa entrevistas de forma directa desde esta vista.</p>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-900/60 rounded-3xl animate-pulse border border-white/5"></div>)
            ) : recentAnalyses.length === 0 ? (
              <div className="glass p-8 text-center rounded-3xl border border-white/5 italic text-slate-500 text-xs font-light">
                No hay postulaciones aún.
              </div>
            ) : (
              recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="group">
                  <div className="glass p-4 sm:p-5 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer flex items-start gap-4">
                    <Link href={`/company/job/${analysis.jobId}`} className="flex-1 flex items-start gap-4">
                      {/* Avatar / Initials */}
                      <div className="flex-shrink-0">
                        {analysis.cv?.user?.avatar ? (
                          <img src={analysis.cv.user.avatar} alt={analysis.cv.user.name} className="h-12 w-12 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center font-bold">
                            {analysis.cv?.user?.name?.split(' ').map((n:string)=>n[0]).slice(0,2).join('')}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{analysis.cv.user.name}</p>
                        <p className="text-[12px] text-slate-300 truncate mt-1 font-medium">{analysis.job.title}</p>
                        <p className="text-[10px] text-slate-500 mt-2 font-light">Postulado el {new Date(analysis.createdAt).toLocaleDateString('es')}</p>
                      </div>
                    </Link>

                    <div className="flex flex-col items-end gap-3">
                      <div className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-sm font-bold text-cyan-300">
                        {analysis.score}%
                      </div>

                      <div className="flex gap-2">
                        {analysis.cv?.fileUrl ? (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/cvs/download/${analysis.cv.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white text-slate-950 text-xs font-semibold hover:shadow-md transition">
                            Ver CV
                          </a>
                        ) : (
                          <Link href={`/company/job/${analysis.jobId}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 text-slate-200 text-xs font-medium hover:bg-white/10 transition">
                            Ver detalles
                          </Link>
                        )}

                        <button
                          onClick={() => setSelectedAnalysis(analysis)}
                          className="inline-flex items-center justify-center p-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition"
                          title="Programar Entrevista"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {recentAnalyses.length > 0 && (
              <p className="text-center text-[9px] text-slate-500 uppercase tracking-widest mt-4">Fin del historial reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Programación */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Programar Entrevista</h2>
              <button onClick={() => setSelectedAnalysis(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 space-y-1.5 text-xs font-light text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <p>Candidato: <span className="text-white font-bold">{selectedAnalysis.cv.user.name}</span></p>
              <p>Vacante: <span className="text-white font-bold">{selectedAnalysis.job.title}</span></p>
            </div>

            <form onSubmit={handleSchedule} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Fecha y Hora</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lugar o Enlace (Meet/Zoom)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="https://meet.google.com/..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Notas Adicionales</label>
                <textarea
                  rows={3}
                  placeholder="Instrucciones adicionales para el candidato..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={scheduling}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 text-xs"
              >
                {scheduling ? (
                  <span className="flex items-center"><Plus className="animate-spin h-4 w-4 mr-2" /> Enviando invitación...</span>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Confirmar y Enviar Correo</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
