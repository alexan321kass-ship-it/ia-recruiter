'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { UploadCloud, FileText, CheckCircle, Loader2, Search, List as ListIcon, Trash2, Calendar, MapPin, Clock, BrainCircuit, Sparkles } from 'lucide-react';

interface Cv {
  id: string;
  fileUrl: string;
  createdAt: string;
  generalAnalysis?: {
    candidateName?: string;
    role: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    technicalSkills: string[];
    softSkills?: string[];
    experienceYears?: string;
    recommendations: string[];
  };
}

export default function CandidateDashboard() {
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [personalityTest, setPersonalityTest] = useState<any>(null);

  const fetchCvs = async () => {
    try {
      const response = await api.get('/cvs/my-cvs');
      setCvs(response.data);
    } catch (error) {
      console.error('Error al obtener CVs', error);
    }
  };

  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interviews/my-interviews');
      setInterviews(response.data);
    } catch (error) {
      console.error('Error al obtener entrevistas', error);
    }
  };

  const fetchPersonality = async () => {
    try {
      const response = await api.get('/personality/my-test');
      setPersonalityTest(response.data || null);
    } catch (error) {
      console.error('Error al obtener test de personalidad', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta hoja de vida?')) return;
    
    try {
      await api.post(`/cvs/${id}/delete`);
      setCvs(cvs.filter(cv => cv.id !== id));
    } catch (err) {
      alert('Error al eliminar la hoja de vida');
      console.error(err);
    }
  };

  const handleCancelInterview = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta entrevista?')) return;
    
    try {
      await api.post(`/interviews/${id}/delete`);
      setInterviews(prev => prev.filter(int => int.id !== id));
    } catch (err) {
      alert('Error al cancelar la entrevista');
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCvs(), fetchInterviews(), fetchPersonality()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/cvs/upload', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      setFile(null);
      fetchCvs();
    } catch (error) {
      console.error('Error al subir CV', error);
      alert('Error al subir el CV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full bg-grid">
      {/* Header section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10">
        <div className="space-y-3 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Panel del candidato</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Tu perfil listo para postular con confianza.</h1>
          <p className="text-sm text-slate-400 leading-6">
            Subir CV, revisar entrevistas y completar tu test desde un espacio ordenado y uniforme.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-flow-col sm:auto-cols-max">
          <Link
            href="/candidate/applications"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800 transition"
          >
            <ListIcon className="h-4 w-4 text-slate-300" />
            Mis postulaciones
          </Link>
          <Link
            href="/candidate/jobs"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            <Search className="h-4 w-4" />
            Explorar vacantes
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-12 w-12 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 border border-cyan-500/20">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">Simulador de entrevista</p>
              <h3 className="text-xl font-semibold text-white">Prepárate para tu próxima entrevista</h3>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-6 mb-6">
            Practica con preguntas personalizadas basadas en tu CV y recibe feedback directo de la IA para mejorar tus respuestas.</p>
          {cvs.length > 0 ? (
            <Link
              href="/candidate/practice"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.08)] transition hover:bg-slate-100"
            >
              Comenzar Simulación
            </Link>
          ) : (
            <button
              disabled
              title="Sube primero un CV para poder simular"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-500 border border-white/10 cursor-not-allowed"
            >
              Sube un CV para Simular
            </button>
          )}

          <div className="mt-8 rounded-3xl border-t border-white/10 pt-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-12 w-12 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 border border-cyan-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">Test de personalidad</p>
                <h3 className="text-xl font-semibold text-white">Completa tu perfil con tu estilo personal</h3>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-6 mb-6">
              Responde el test y genera un perfil más completo para que los reclutadores te conozcan mejor.
            </p>
            <Link
              href="/candidate/personality"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Hacer test
            </Link>
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-12 w-12 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-300 border border-cyan-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 mb-2">Tu progreso</p>
              <h3 className="text-xl font-semibold text-white">Todo en un solo lugar</h3>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-6 mb-6">
            Visualiza tus CVs, entrevistas y pruebas desde un panel ordenado. Mantén tu perfil listo para nuevas oportunidades.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">CVs listos</p>
              <p className="mt-3 text-2xl font-bold text-white">{cvs.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Entrevistas</p>
              <p className="mt-3 text-2xl font-bold text-white">{interviews.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-4 border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Test de personalidad</p>
              <p className="mt-3 text-2xl font-bold text-white">{personalityTest ? 'Listo' : 'Pendiente'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Interviews section */}
      {interviews.length > 0 && (
        <div className="mb-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-2 text-slate-200">
              <Calendar className="h-5 w-5 text-cyan-300" />
              <h2 className="text-xl font-bold text-white">Entrevistas programadas</h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-300 border border-white/10">
              {interviews.length} evento{interviews.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div key={interview.id} className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 relative group">
                <button
                  onClick={() => handleCancelInterview(interview.id)}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Cancelar Entrevista"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="mb-4 pr-8">
                  <h3 className="text-base font-semibold text-white mb-1">{interview.analysis.job.title}</h3>
                  <p className="text-xs text-slate-400">{interview.analysis.job.company.name}</p>
                </div>
                <div className="space-y-3 text-slate-300 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{new Date(interview.scheduledAt).toLocaleString('es-ES', {
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <a href={interview.location} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline truncate">
                      {interview.location.startsWith('http') ? 'Enlace a la reunión' : interview.location}
                    </a>
                  </div>
                </div>
                {interview.notes && (
                  <div className="mt-5 rounded-2xl bg-slate-900/80 p-4 border border-white/10 text-sm text-slate-400">
                    "{interview.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 sm:p-8 rounded-2xl border border-white/5 h-fit">
            <h2 className="text-lg font-bold text-white mb-5">Subir Hoja de Vida</h2>
            
            <form onSubmit={handleUpload}>
              <div className="border border-dashed border-white/10 hover:border-cyan-500/30 transition-colors rounded-xl p-8 text-center bg-slate-900/50 mb-5 relative group">
                <UploadCloud className="h-10 w-10 text-slate-500 mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-xs text-slate-400 mb-3 font-light">Arrastra tu PDF aquí, o haz clic para buscar</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-slate-900 text-slate-300 hover:text-white rounded-lg cursor-pointer hover:bg-slate-800 transition-colors text-xs font-semibold border border-white/5"
                >
                  Seleccionar Archivo PDF
                </label>
                {file && (
                  <div className="mt-4 flex items-center justify-center text-xs text-cyan-300">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {file.name}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 duration-200"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Analizando Hoja de Vida con IA...
                  </>
                ) : (
                  'Subir y Analizar CV'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-lg font-bold text-white mb-1">Tus Hojas de Vida <span className="text-sm font-normal text-slate-400">({cvs.length})</span></h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-slate-900/60 rounded-2xl"></div>
              <div className="h-32 bg-slate-900/60 rounded-2xl"></div>
            </div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-white/5">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-xs font-light">Aún no has subido ninguna hoja de vida.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {cvs.map((cv) => (
                <div key={cv.id} className="glass p-6 rounded-2xl border border-white/5 flex flex-col group hover:border-white/10 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 border border-white/10">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        {cv.generalAnalysis?.candidateName && (
                          <p className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest mb-0.5">
                            {cv.generalAnalysis.candidateName}
                          </p>
                        )}
                        <p className="text-sm font-bold text-white">
                          {cv.generalAnalysis?.role || 'Documento de CV'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-light">
                          Subido el {new Date(cv.createdAt).toLocaleDateString('es')} a las {new Date(cv.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-[10px] text-cyan-300 font-semibold px-2 py-1 bg-cyan-500/10 rounded-md border border-cyan-500/20">
                        Procesado ✓
                      </div>
                      <button 
                        onClick={() => handleDelete(cv.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar hoja de vida"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {cv.generalAnalysis && (
                    <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Resumen ejecutivo</span>
                        <p className="text-sm text-slate-300 italic mt-2 leading-6 font-light">"{cv.generalAnalysis.summary}"</p>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Habilidades clave</span>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {cv.generalAnalysis.technicalSkills?.slice(0, 7).map((skill: string) => (
                            <span key={skill} className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-300 border border-white/10 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300 block mb-2">Fortalezas</span>
                          <ul className="space-y-2 text-sm text-slate-300 font-light">
                            {cv.generalAnalysis.strengths?.slice(0, 3).map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-cyan-300">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300 block mb-2">Habilidades blandas</span>
                          <ul className="space-y-2 text-sm text-slate-300 font-light">
                            {cv.generalAnalysis.softSkills?.slice(0, 3).map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-cyan-300">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900/30 p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Años de Experiencia</span>
                          <span className="text-xs text-white font-bold">{cv.generalAnalysis.experienceYears || 'No detectado'}</span>
                        </div>
                        <div className="bg-slate-900/30 p-3.5 rounded-xl border border-white/5 flex flex-col justify-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Recomendación IA</span>
                          <span className="text-xs text-slate-300 truncate font-light" title={cv.generalAnalysis.recommendations?.[0]}>
                            {cv.generalAnalysis.recommendations?.[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
