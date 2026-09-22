'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import Link from 'next/link';
import { ArrowLeft, Star, TrendingUp, TrendingDown, CheckCircle2, User as UserIcon, Download, Search, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { generateAnalysisPdf } from '@/utils/generatePdf';
import React from 'react';

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState(0);

  // Recruiter custom questions per analysis
  const [recruiterQuestions, setRecruiterQuestions] = useState<Record<string, any[]>>({});
  const [generatingQuestions, setGeneratingQuestions] = useState<Record<string, boolean>>({});

  const fetchJobDetails = async () => {
    try {
      const [jobRes, analysisRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/analysis/job/${id}`)
      ]);
      setJob(jobRes.data);
      setAnalyses(analysisRes.data);
    } catch (error) {
      console.error('Error al obtener detalles', error);
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    if (id) fetchJobDetails();
  }, [id]);

  const loadRecruiterQuestions = async (analysisId: string) => {
    setGeneratingQuestions(prev => ({ ...prev, [analysisId]: true }));
    try {
      const response = await api.get(`/analysis/recruiter-questions/${analysisId}`);
      if (response.data && response.data.questions) {
        setRecruiterQuestions(prev => ({ ...prev, [analysisId]: response.data.questions }));
      }
    } catch (error) {
      console.error('Error al generar preguntas para reclutador:', error);
    } finally {
      setGeneratingQuestions(prev => ({ ...prev, [analysisId]: false }));
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-slate-600" /></div>;
  if (!job) return <div className="text-center py-20 text-white font-light">Vacante no encontrada</div>;

  const filteredAnalyses = analyses.filter(a =>
    a.score >= minScore &&
    a.cv.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteCandidate = async (analysisId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar a este candidato? Esta acción no se puede deshacer y también eliminará las entrevistas programadas.')) return;
    try {
      await api.post(`/analysis/${analysisId}/delete`);
      setAnalyses(prev => prev.filter(a => a.id !== analysisId));
    } catch (error) {
      console.error('Error al eliminar candidato:', error);
      alert('Error al eliminar candidato');
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full bg-grid">
      <Link href="/company" className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors w-fit text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Panel</span>
      </Link>

      {/* Job Info block */}
      <div className="glass p-6 sm:p-8 rounded-2xl border border-white/5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{job.title}</h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed font-light">{job.description}</p>
          </div>
          <div className="flex gap-2 flex-wrap max-w-xs justify-start md:justify-end">
            {job.skills.map((skill: string) => (
              <span key={skill} className="px-3 py-1 bg-slate-900 border border-white/5 text-[10px] rounded-md font-semibold text-slate-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Ranking layout header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-cyan-300" />
          <span>Ranking de Candidatos por IA</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar candidato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value={0}>Todos los puntajes</option>
            <option value={80}>Excelente (+80%)</option>
            <option value={60}>Bueno (+60%)</option>
            <option value={40}>Aceptable (+40%)</option>
            <option value={20}>Malo (+20%)</option>
          </select>
        </div>
      </div>

      {/* List of Analyzed Candidates */}
      {filteredAnalyses.length === 0 ? (
        <div className="glass p-16 text-center rounded-2xl border border-white/5">
          <h3 className="text-sm font-bold text-white mb-1">No se encontraron candidatos</h3>
          <p className="text-xs text-slate-400 font-light">Prueba ajustando los filtros o espera a nuevas postulaciones.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAnalyses.map((analysis, index) => (
            <div key={analysis.id} className="glass p-6 sm:p-8 rounded-2xl border border-white/5 relative overflow-hidden group">
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-cyan-500/10 text-cyan-300 border-b border-l border-cyan-500/25 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                  Mejor Coincidencia
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Visual HUD Score Gauge */}
                <div className="flex flex-col items-center justify-center min-w-[120px] w-full md:w-auto p-5 bg-slate-900/60 rounded-2xl border border-white/5 shrink-0">
                  <div className="relative">
                    <svg className="w-20 h-20 transform -rotate-90 hud-gauge">
                      <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        stroke="currentColor" 
                        strokeWidth="6" 
                        fill="transparent" 
                          strokeDasharray={`${analysis.score * 2.13} 213`} 
                          className={analysis.score > 80 ? "text-emerald-400" : analysis.score > 60 ? "text-cyan-400" : "text-slate-500"} 
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-black text-white">
                      {analysis.score}%
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-3.5 font-black uppercase tracking-wider">Compatibilidad</span>
                </div>

                {/* Candidate Content Body */}
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{analysis.cv.user.name}</h3>
                        <p className="text-xs text-slate-400 font-light">{analysis.cv.user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => generateAnalysisPdf({
                        candidateName: analysis.cv.user.name,
                        jobTitle: job.title,
                        score: analysis.score,
                        strengths: analysis.strengths,
                        weaknesses: analysis.weaknesses,
                        recommendations: analysis.recommendations,
                      })}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all"
                      title="Descargar Reporte PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(analysis.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-white/5 transition-all ml-2"
                      title="Eliminar candidato"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-xl">
                      <h4 className="flex items-center text-xs font-bold text-emerald-400 mb-2.5">
                        <TrendingUp className="h-4 w-4 mr-2" /> Fortalezas
                      </h4>
                      <ul className="text-xs text-slate-300 space-y-1.5 font-light">
                        {analysis.strengths.slice(0, 3).map((s: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 mr-2 text-emerald-400 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl">
                      <h4 className="flex items-center text-xs font-bold text-slate-400 mb-2.5">
                        <TrendingDown className="h-4 w-4 mr-2 text-slate-400" /> Brechas / Áreas de Mejora
                      </h4>
                      <ul className="text-xs text-slate-300 space-y-1.5 font-light">
                        {analysis.weaknesses.slice(0, 3).map((w: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 mt-2 mr-2.5 shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendation Card */}
                  {analysis.recommendations.length > 0 && (
                    <div className="mt-4 bg-slate-900/30 p-4 rounded-xl border border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recomendación Estratégica</span>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-light">{analysis.recommendations[0]}</p>
                    </div>
                  )}

                  {/* Personality Profile Widget */}
                  <div className="mt-4 bg-slate-900/20 p-5 rounded-xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        Perfil de Personalidad de IA
                      </span>
                      {analysis.cv.user.personalityTest && (
                        <span className="bg-cyan-500/10 border border-cyan-500/25 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-cyan-300">
                          Completado
                        </span>
                      )}
                    </div>

                    {analysis.cv.user.personalityTest ? (
                      <div className="space-y-4 animate-fade-in">
                        <div>
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <BrainCircuit className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
                            {analysis.cv.user.personalityTest.personalityType}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-light italic">
                            "{analysis.cv.user.personalityTest.summary}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-white/5">
                          {[
                            { label: 'Apertura', score: analysis.cv.user.personalityTest.scores.openness },
                            { label: 'Respons.', score: analysis.cv.user.personalityTest.scores.conscientiousness },
                            { label: 'Extrav.', score: analysis.cv.user.personalityTest.scores.extraversion },
                            { label: 'Amabil.', score: analysis.cv.user.personalityTest.scores.agreeableness },
                            { label: 'Estabil.', score: analysis.cv.user.personalityTest.scores.stability },
                          ].map((item) => (
                            <div key={item.label} className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5 text-center">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">{item.label}</span>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full mb-1">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400" 
                                  style={{ width: `${item.score}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-black text-cyan-300">{item.score}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic font-light">
                        El candidato no ha completado el test de personalidad Big Five todavía.
                      </p>
                    )}
                  </div>

                  {/* Custom Recruiter AI Questions Section */}
                  <div className="mt-5 border-t border-white/5 pt-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        ✨ Guía de Entrevista Personalizada por IA
                      </span>
                      {!recruiterQuestions[analysis.id] && (
                        <button
                          onClick={() => loadRecruiterQuestions(analysis.id)}
                          disabled={generatingQuestions[analysis.id]}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-white border border-white/5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {generatingQuestions[analysis.id] ? (
                            <>
                              <Loader2 className="animate-spin h-3.5 w-3.5 mr-1 text-slate-400" />
                              <span>Generando preguntas...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                              <span>Generar Preguntas a Medida</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {recruiterQuestions[analysis.id] && (
                      <div className="grid grid-cols-1 gap-4 mt-3 animate-fade-in">
                        {recruiterQuestions[analysis.id].map((q: any, qIdx: number) => (
                          <div key={qIdx} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest">Pregunta {qIdx + 1}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(q.question);
                                  alert('¡Pregunta copiada al portapapeles!');
                                }}
                                className="text-[9px] font-semibold text-slate-400 hover:text-white transition-colors px-2 py-0.5 bg-slate-800 rounded border border-white/5"
                              >
                                Copiar
                              </button>
                            </div>
                            <p className="text-xs font-bold text-white leading-relaxed">{q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-light leading-relaxed border-t border-white/5 pt-3">
                              <div>
                                <span className="font-semibold text-slate-400 block mb-0.5">Por qué preguntar:</span>
                                <p className="text-slate-300">{q.why_ask}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-400 block mb-0.5">Qué escuchar/evaluar:</span>
                                <p className="text-slate-300">{q.expected_points}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
