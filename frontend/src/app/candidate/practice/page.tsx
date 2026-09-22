'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { ArrowLeft, BrainCircuit, MessageSquare, Award, BookOpen, Sparkles, RefreshCw, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface Cv {
  id: string;
  generalAnalysis?: {
    role: string;
    candidateName?: string;
  };
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
  };
}

interface Question {
  id: number;
  question: string;
}

interface Evaluation {
  score: number;
  feedback: string;
  idealAnswer: string;
}

export default function PracticeInterviewPage() {
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCv, setSelectedCv] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [loadingSetup, setLoadingSetup] = useState(true);
  
  // Simulation State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  
  // History of answers and evaluations
  const [simulationHistory, setSimulationHistory] = useState<Array<{
    question: string;
    answer: string;
    evaluation?: Evaluation;
  }>>([]);

  useEffect(() => {
    const loadSetupData = async () => {
      try {
        const [cvsRes, jobsRes] = await Promise.all([
          api.get('/cvs/my-cvs'),
          api.get('/jobs')
        ]);
        setCvs(cvsRes.data);
        setJobs(jobsRes.data);
        if (cvsRes.data.length > 0) {
          setSelectedCv(cvsRes.data[0].id);
        }
      } catch (error) {
        console.error('Error al cargar datos del simulador', error);
      } finally {
        setLoadingSetup(false);
      }
    };
    loadSetupData();
  }, []);

  const handleStartSimulation = async () => {
    if (!selectedCv) return;

    setGeneratingQuestions(true);
    setQuestions([]);
    setSimulationHistory([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');

    try {
      const response = await api.post('/analysis/practice/questions', {
        cvId: selectedCv,
        jobId: selectedJob || undefined,
      });

      if (response.data && response.data.questions) {
        setQuestions(response.data.questions);
      } else {
        alert('No se pudieron obtener preguntas de la IA. Por favor, intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al iniciar simulación de entrevista:', error);
      alert('Error en el servicio de IA al generar preguntas.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    setEvaluatingAnswer(true);

    // Guardar temporalmente en el historial local
    const newHistoryItem = {
      question: currentQuestion.question,
      answer: userAnswer,
      evaluation: undefined
    };
    
    const updatedHistory = [...simulationHistory, newHistoryItem];
    setSimulationHistory(updatedHistory);
    const tempAnswer = userAnswer;
    setUserAnswer('');

    try {
      const response = await api.post('/analysis/practice/evaluate', {
        cvId: selectedCv,
        question: currentQuestion.question,
        answer: tempAnswer,
      });

      if (response.data) {
        // Actualizar el item del historial con su evaluación correspondiente
        const evaluatedItem = {
          ...newHistoryItem,
          evaluation: {
            score: response.data.score,
            feedback: response.data.feedback,
            idealAnswer: response.data.idealAnswer
          }
        };
        const finalHistory = [...simulationHistory, evaluatedItem];
        setSimulationHistory(finalHistory);
      }
    } catch (error) {
      console.error('Error al evaluar respuesta:', error);
      const errorItem = {
        ...newHistoryItem,
        evaluation: {
          score: 0,
          feedback: 'Error de conexión con el servicio de IA. Intente enviar de nuevo.',
          idealAnswer: 'No disponible.'
        }
      };
      setSimulationHistory([...simulationHistory, errorItem]);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const activeQuestion = questions[currentQuestionIndex];
  const currentHistoryItem = simulationHistory[currentQuestionIndex];
  const hasFinished = questions.length > 0 && currentQuestionIndex >= questions.length;
  const averageScore = simulationHistory.length > 0
    ? Math.round(simulationHistory.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0) / simulationHistory.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full bg-grid">
      <Link href="/candidate" className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors w-fit text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Panel</span>
      </Link>

      {/* Hero Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-indigo-400" />
          <span>Simulador de Entrevista de IA</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Practica preguntas reales generadas en base a tu perfil profesional y recibe feedback inmediato.
        </p>
      </div>

      {loadingSetup ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-slate-600" />
        </div>
      ) : cvs.length === 0 ? (
        <div className="glass p-10 text-center rounded-2xl border border-white/5 space-y-4">
          <AlertCircle className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No tienes currículums analizados</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Sube primero una hoja de vida en PDF desde tu panel para que la IA pueda comprender tu perfil y formular preguntas relevantes.
          </p>
          <Link
            href="/candidate"
            className="inline-block px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs transition-colors"
          >
            Subir Currículum
          </Link>
        </div>
      ) : questions.length === 0 ? (
        /* Configuration Section */
        <div className="glass p-6 sm:p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-[0_35px_90px_-50px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80 mb-2">Configurar Simulación</p>
              <h2 className="text-3xl font-black text-white">Prepara tu entrevista con preguntas hechas a medida</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
              <p className="font-semibold text-white">TIP:</p>
              <p className="mt-1">Elige una vacante si quieres preguntas más alineadas a la empresa.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Selecciona tu Hoja de Vida</label>
                <select
                  value={selectedCv}
                  onChange={(e) => setSelectedCv(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-3xl py-4 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                >
                  {cvs.map(cv => (
                    <option key={cv.id} value={cv.id}>
                      {cv.generalAnalysis?.role || 'Currículum cargado'} ({new Date(cv.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Vacante Objetivo (Opcional)</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-3xl py-4 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                >
                  <option value="">Preguntas Generales (Alineadas a tu Perfil)</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300 space-y-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles className="h-4 w-4" />
                <span className="font-semibold">¿Cómo funciona?</span>
              </div>
              <p>La IA toma tu CV y genera preguntas específicas para tu experiencia. Si eliges una vacante, hace la simulación aún más precisa.</p>
              <div className="rounded-3xl bg-slate-950/90 border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 mb-2">Mejor resultado</p>
                <p className="text-sm text-slate-300">Responde usando la estructura STAR y menciona tus logros cuantificables.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartSimulation}
            disabled={generatingQuestions}
            className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold py-4 rounded-3xl text-sm transition-all active:scale-95 duration-200 flex items-center justify-center gap-3"
          >
            {generatingQuestions ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Analizando tu perfil...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <span>Generar Guía de Entrevista Personalizada por IA</span>
              </>
            )}
          </button>
        </div>
      ) : hasFinished ? (
        /* Results Section */
        <div className="space-y-8 animate-fade-in">
          <div className="glass p-8 rounded-2xl border border-white/5 text-center space-y-6">
            <Award className="h-14 w-14 text-indigo-400 mx-auto" />
            <div>
              <h2 className="text-2xl font-black text-white">¡Simulación Completada!</h2>
              <p className="text-xs text-slate-400 mt-2">Has respondido a las 5 preguntas formuladas por la IA.</p>
            </div>

            <div className="inline-flex items-center justify-center p-6 bg-slate-900 rounded-2xl border border-white/5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Puntuación Promedio</span>
                <span className="text-4xl font-black text-white">{averageScore}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Excelente trabajo preparándote. Revisa el historial de feedback técnico abajo para comprender tus áreas de oportunidad.
            </p>

            <button
              onClick={handleStartSimulation}
              className="px-6 py-3 bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors"
            >
              Iniciar Nueva Simulación
            </button>
          </div>

          {/* Detailed Summary History */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white">Historial de Evaluación</h3>
            {simulationHistory.map((item, index) => (
              <div key={index} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Pregunta {index + 1}</span>
                  {item.evaluation && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">
                      Puntaje: {item.evaluation.score}%
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white leading-relaxed">{item.question}</h4>
                
                <div className="text-xs space-y-3 font-light leading-relaxed border-t border-white/5 pt-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Tu Respuesta:</span>
                    <p className="text-slate-300 italic">"{item.answer}"</p>
                  </div>
                  {item.evaluation && (
                    <>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Feedback Técnico:</span>
                        <p className="text-slate-300">{item.evaluation.feedback}</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">Respuesta Blueprint Ideal:</span>
                        <p className="text-slate-300 italic">"{item.evaluation.idealAnswer}"</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1.7fr_0.95fr] animate-fade-in">
          <div className="space-y-8">
            <div className="glass p-6 sm:p-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 shadow-[0_35px_90px_-55px_rgba(0,0,0,0.75)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-300">En vivo</p>
                  <h2 className="text-xl font-black text-white">Pregunta actual</h2>
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300 border border-white/10">
                  <span className="block">Progreso</span>
                  <strong className="text-white">{currentQuestionIndex + 1}/{questions.length}</strong>
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-indigo-500/15 bg-slate-900/80 p-7 shadow-[0_30px_80px_-55px_rgba(56,139,253,0.15)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-500/15 grid place-items-center text-indigo-300">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Entrevistador IA</p>
                    <p className="text-sm text-slate-400">Responde con claridad y ejemplos concretos.</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-white leading-8">{activeQuestion?.question}</p>
              </div>

              <div className="mt-6 h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            {!currentHistoryItem ? (
              <div className="glass p-6 sm:p-8 rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-[0_35px_90px_-55px_rgba(0,0,0,0.75)] space-y-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="h-9 w-9 rounded-2xl bg-slate-900/80 grid place-items-center text-white">A</span>
                  <p className="text-sm font-semibold text-white">Tu respuesta</p>
                </div>
                <textarea
                  rows={6}
                  required
                  placeholder="Responde con la mayor claridad posible. Usa contexto, acción y resultados concretos."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-3xl py-4 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || evaluatingAnswer}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-white py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  {evaluatingAnswer ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Evaluando respuesta...</span>
                    </>
                  ) : (
                    <span>Enviar para evaluación</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="glass p-6 sm:p-8 rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-[0_35px_90px_-55px_rgba(0,0,0,0.75)] space-y-6">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Evaluación recibida</p>
                    <p className="mt-2 text-white text-base font-semibold">Puntaje: {currentHistoryItem.evaluation?.score ?? '...'}%</p>
                  </div>
                  {currentHistoryItem.evaluation ? (
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/15">IA Feedback</span>
                  ) : (
                    <span className="text-xs text-slate-500">Procesando...</span>
                  )}
                </div>

                {currentHistoryItem.evaluation ? (
                  <div className="space-y-5 text-sm leading-relaxed text-slate-300">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Tu respuesta</p>
                      <p className="italic text-slate-400">"{currentHistoryItem.answer}"</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-300 mb-2">Mejora recomendada</p>
                      <p>{currentHistoryItem.evaluation.feedback}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 mb-2">Respuesta ideal</p>
                      <p className="italic text-slate-300">"{currentHistoryItem.evaluation.idealAnswer}"</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-6 text-slate-400">
                    <Loader2 className="animate-spin h-6 w-6 mr-3" /> Procesando respuesta...
                  </div>
                )}

                <button
                  onClick={handleNextQuestion}
                  disabled={!currentHistoryItem.evaluation}
                  className="w-full inline-flex items-center justify-center rounded-3xl bg-white py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  <span>{currentQuestionIndex + 1 === questions.length ? 'Finalizar Simulación' : 'Siguiente Pregunta'}</span>
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_35px_90px_-55px_rgba(0,0,0,0.75)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">Panel de progreso</p>
              <div className="space-y-4 text-sm text-slate-300">
                <div className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                  <p className="text-slate-500 text-xs uppercase tracking-[0.24em]">Total de preguntas</p>
                  <p className="mt-2 text-lg font-semibold text-white">{questions.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                  <p className="text-slate-500 text-xs uppercase tracking-[0.24em]">Respondidas</p>
                  <p className="mt-2 text-lg font-semibold text-white">{simulationHistory.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                  <p className="text-slate-500 text-xs uppercase tracking-[0.24em]">Media de puntaje</p>
                  <p className="mt-2 text-lg font-semibold text-cyan-300">{averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-[0_35px_90px_-55px_rgba(0,0,0,0.75)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">Consejo rápido</p>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>Habla en voz alta y estructura tus ideas con hechos.</li>
                <li>Menciona resultados cuantificables siempre que puedas.</li>
                <li>Resalta tus acciones y el impacto que generaste.</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
