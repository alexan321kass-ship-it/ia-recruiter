'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Clock,
  Loader2,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Send,
  Download,
} from 'lucide-react';
import { generateAnalysisPdf } from '@/utils/generatePdf';

interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  experience: number;
  company: { name: string };
}

interface Cv {
  id: string;
  fileUrl: string;
  createdAt: string;
}

export default function JobApplyPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [selectedCv, setSelectedCv] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, cvsRes] = await Promise.all([
          api.get(`/jobs/${id}`),
          api.get('/cvs/my-cvs'),
        ]);
        setJob(jobRes.data);
        setCvs(cvsRes.data);
        if (cvsRes.data.length > 0) {
          setSelectedCv(cvsRes.data[0].id);
        }
      } catch (err) {
        console.error('Error al obtener datos', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleApply = async () => {
    if (!selectedCv) return;
    setApplying(true);
    setError('');
    try {
      const response = await api.post('/analysis', {
        jobId: id,
        cvId: selectedCv,
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al postularse. Inténtalo de nuevo.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-20 text-white">Vacante no encontrada</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
      <Link
        href="/candidate/jobs"
        className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a Vacantes</span>
      </Link>

      <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_35px_100px_-55px_rgba(0,0,0,0.75)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 border border-cyan-500/20">
                  <Briefcase className="h-4 w-4" /> {job.company?.name || 'Empresa'}
                </span>
                <h1 className="mt-4 text-4xl font-extrabold text-white tracking-tight">{job.title}</h1>
                <p className="mt-3 max-w-2xl text-slate-400 text-lg leading-8">Esta vacante está diseñada para personas con experiencia en tecnologías clave y ganas de trabajar en proyectos que impactan.</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-4 text-center border border-white/10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Experiencia</p>
                <p className="mt-3 text-3xl font-semibold text-white">{job.experience}+ años</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-3">Descripción</h2>
                <p className="text-slate-300 leading-7">{job.description}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-3">Habilidades clave</h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {!result ? (
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_35px_100px_-55px_rgba(0,0,0,0.75)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Postular</p>
                  <h2 className="text-2xl font-bold text-white">Envía tu aplicación con IA</h2>
                </div>
              </div>

              {cvs.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center">
                  <p className="text-slate-400 mb-4">Necesitas subir una hoja de vida antes de postularte.</p>
                  <Link
                    href="/candidate"
                    className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Ir a subir tu CV →
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 mb-6">Selecciona el CV que quieres usar en esta postulación. La IA comparará tu perfil con esta vacante y te mostrará resultados claros.</p>

                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    {cvs.map((cv) => (
                      <label
                        key={cv.id}
                        className={`group relative rounded-3xl border p-5 transition-all cursor-pointer ${
                          selectedCv === cv.id
                            ? 'border-cyan-400/40 bg-cyan-500/10 shadow-[0_20px_60px_-45px_rgba(6,182,212,0.35)]'
                            : 'border-white/10 bg-slate-900/80 hover:border-cyan-500/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cv"
                          value={cv.id}
                          checked={selectedCv === cv.id}
                          onChange={() => setSelectedCv(cv.id)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">CV guardado</p>
                            <p className="text-xs text-slate-400 mt-1">Subido el {new Date(cv.createdAt).toLocaleDateString('es')}</p>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 ${selectedCv === cv.id ? 'border-cyan-300 bg-cyan-300' : 'border-slate-600'}`} />
                        </div>
                        <div className="mt-4 text-xs text-slate-500">Este CV se usará para generar tu análisis y recomendaciones.</div>
                      </label>
                    ))}
                  </div>

                  {error && (
                    <div className="mb-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleApply}
                    disabled={!selectedCv || applying}
                    className="w-full inline-flex items-center justify-center gap-3 rounded-3xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5" />
                        Analizando tu CV...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="h-5 w-5" />
                        Postularme con Análisis de IA
                      </>
                    )}
                  </button>
                </>
              )}
            </section>
          ) : (
            <section className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_35px_100px_-55px_rgba(0,0,0,0.75)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-t-3xl" />
              <div className="relative pt-4 text-center mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Resultado</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Tu postulación fue enviada</h2>
                <p className="mt-2 text-slate-400">Mira cómo tu CV encaja con la vacante y qué puedes mejorar.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_1fr] mb-6">
                <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">Puntaje</p>
                  <div className="flex items-center justify-center">
                    <div className="relative h-36 w-36">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-900" />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={`${result.score * 3.52} 352`}
                          className={result.score > 80 ? 'text-emerald-400' : result.score > 50 ? 'text-amber-400' : 'text-rose-400'}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl font-bold text-white">{result.score}</span>
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Match</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-900/80 p-5 border border-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">Estado</p>
                  <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    result.score > 80 ? 'bg-emerald-500/10 text-emerald-300' : result.score > 50 ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300'
                  }`}>{result.score > 80 ? 'Excelente ajuste' : result.score > 50 ? 'Buen ajuste' : 'Puede mejorar'}</span>
                  <p className="mt-4 text-slate-400">Usa este informe para ajustar tu CV y destacar tus fortalezas.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-300 mb-3">
                    <TrendingUp className="h-4 w-4" /> Fortalezas
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-200">
                    {result.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-1 h-3.5 w-3.5 text-emerald-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl bg-rose-500/10 border border-rose-500/20 p-5">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-rose-300 mb-3">
                    <TrendingDown className="h-4 w-4" /> Áreas a mejorar
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-200">
                    {result.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-400" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.recommendations?.length > 0 && (
                <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3">Recomendaciones de la IA</h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    {result.recommendations.map((r: string, i: number) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => generateAnalysisPdf({
                    candidateName: 'Tu Perfil',
                    jobTitle: job.title,
                    score: result.score,
                    strengths: result.strengths,
                    weaknesses: result.weaknesses,
                    recommendations: result.recommendations,
                  })}
                  className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/90 px-6 py-3 text-sm font-semibold text-white border border-white/10 transition hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  Descargar Reporte PDF
                </button>
                <Link
                  href="/candidate/jobs"
                  className="text-cyan-300 hover:text-cyan-200 text-sm font-medium"
                >
                  ← Explorar más vacantes
                </Link>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.7)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">Detalles rápidos</p>
            <div className="space-y-4 text-sm text-slate-400">
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900/80 p-4">
                <span className="text-slate-300">Empresa</span>
                <span className="font-semibold text-white">{job.company?.name || 'Empresa'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900/80 p-4">
                <span className="text-slate-300">Experiencia</span>
                <span className="font-semibold text-white">{job.experience}+ años</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900/80 p-4">
                <span className="text-slate-300">Skills</span>
                <span className="font-semibold text-white">{job.skills.length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.7)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">Sugerencia rápida</p>
            <div className="space-y-3 text-slate-400 text-sm leading-6">
              <p>Usa un CV con experiencia relevante y asegúrate de destacar las tecnologías clave listadas.</p>
              <p>Cuanto más alineado esté tu CV con los requisitos, mayor será el puntaje de la IA.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
