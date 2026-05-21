'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Clock, FileText, Download, Loader2, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { generateAnalysisPdf } from '@/utils/generatePdf';

interface Application {
  id: string;
  score: number;
  createdAt: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  job: {
    title: string;
    company: { name: string };
  };
}

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const totalApplications = applications.length;
  const averageMatch = totalApplications
    ? Math.round(applications.reduce((sum, app) => sum + app.score, 0) / totalApplications)
    : 0;
  const bestMatchScore = totalApplications
    ? Math.max(...applications.map((app) => app.score))
    : 0;

  const getStatusLabel = (score: number) => {
    if (score > 80) return { label: 'Excelente', color: 'bg-emerald-500/15 text-emerald-300' };
    if (score > 50) return { label: 'Bueno', color: 'bg-amber-500/15 text-amber-300' };
    return { label: 'Necesita Mejora', color: 'bg-rose-500/15 text-rose-300' };
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/analysis/my-applications');
        setApplications(response.data);
      } catch (error) {
        console.error('Error al obtener aplicaciones', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full bg-grid">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mis Postulaciones</h1>
          <p className="text-slate-400 mt-1 max-w-2xl">Historial de vacantes a las que has aplicado con análisis de IA. Revisa tus matches, fortalezas y recomendaciones desde un dashboard más claro.</p>
        </div>
        <Link href="/candidate" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al Panel
        </Link>
      </div>

      {totalApplications > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Aplicaciones</p>
            <p className="mt-3 text-3xl font-semibold text-white">{totalApplications}</p>
            <p className="mt-2 text-sm text-slate-400">Todas las vacantes enviadas y analizadas por IA.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Match Promedio</p>
            <p className="mt-3 text-3xl font-semibold text-cyan-300">{averageMatch}%</p>
            <p className="mt-2 text-sm text-slate-400">Valoración promedio de tus candidaturas.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)]">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Mejor Match</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-400">{bestMatchScore}%</p>
            <p className="mt-2 text-sm text-slate-400">Tu candidatura más destacada hasta ahora.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-cyan-400" />
        </div>
      ) : applications.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.75)]">
          <div className="mx-auto w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 border border-cyan-500/15">
            <FileText className="h-8 w-8 text-cyan-300" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aún no te has postulado</h3>
          <p className="text-slate-400 mb-6">Explora las vacantes disponibles y aplica con tu CV para ver los resultados de la IA.</p>
          <Link
            href="/candidate/jobs"
            className="inline-flex items-center px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-semibold transition-all shadow-[0_20px_50px_-30px_rgba(6,182,212,0.45)]"
          >
            Explorar Vacantes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="glass p-6 rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.7)] group hover:-translate-y-0.5 hover:border-cyan-500/20 transition-all">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center h-16 w-16 rounded-3xl border border-white/10 bg-slate-900/70 text-center">
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Match</span>
                    <span className={`text-2xl font-black ${
                      app.score > 80 ? 'text-emerald-400' : app.score > 50 ? 'text-amber-300' : 'text-rose-400'
                    }`}>{app.score}%</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors truncate">{app.job.title}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusLabel(app.score).color}`}>{getStatusLabel(app.score).label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-400 mt-3">
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Briefcase className="h-3 w-3" /> {app.job.company.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" /> {new Date(app.createdAt).toLocaleDateString('es')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => generateAnalysisPdf({
                      candidateName: 'Tu Perfil',
                      jobTitle: app.job.title,
                      score: app.score,
                      strengths: app.strengths,
                      weaknesses: app.weaknesses,
                      recommendations: app.recommendations,
                    })}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-2xl border border-white/10 transition-all text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar</span>
                  </button>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-2xl text-sm font-semibold transition-all"
                  >
                    Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 flex flex-col animate-scale-in shadow-[0_35px_120px_-60px_rgba(0,0,0,0.9)]">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/90">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedApp.job.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{selectedApp.job.company.name}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full bg-slate-900/80 px-3 py-1 text-slate-300">Aplicado: {new Date(selectedApp.createdAt).toLocaleDateString('es')}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusLabel(selectedApp.score).color}`}>{getStatusLabel(selectedApp.score).label}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 bg-slate-900/70 hover:bg-slate-900/90 rounded-2xl transition-colors text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Score Section */}
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * selectedApp.score) / 100}
                      className={`${
                        selectedApp.score > 80 ? 'text-cyan-400' :
                        selectedApp.score > 50 ? 'text-cyan-300' : 'text-cyan-500'
                      } transition-all duration-1000 ease-out`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white">{selectedApp.score}%</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Match</span>
                  </div>
                </div>
              </div>

              {/* Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-5 rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center space-x-2 text-cyan-300 mb-4">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Fortalezas</h3>
                  </div>
                  <ul className="space-y-3">
                    {selectedApp.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-300 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center space-x-2 text-rose-300 mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Áreas de Mejora</h3>
                  </div>
                  <ul className="space-y-3">
                    {selectedApp.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-rose-300 mt-0.5">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-6 rounded-3xl border border-cyan-500/10 bg-cyan-500/5 shadow-[0_20px_50px_-35px_rgba(6,182,212,0.2)]">
                <div className="flex items-center space-x-2 text-cyan-300 mb-4">
                  <Info className="h-5 w-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Recomendaciones de IA</h3>
                </div>
                <ul className="space-y-3">
                  {selectedApp.recommendations.map((r, i) => (
                    <li key={i} className="text-sm text-slate-200 flex items-start gap-2 italic">
                      <span className="text-cyan-300 mt-0.5">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-slate-950/90 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-2xl transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
