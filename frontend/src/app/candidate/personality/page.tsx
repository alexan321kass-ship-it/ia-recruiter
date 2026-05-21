'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  RefreshCw, 
  Award, 
  Compass, 
  Briefcase, 
  Heart, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

const QUESTIONS = [
  { id: 'q1', text: 'Disfruto ser el centro de atención o liderar debates en reuniones de equipo.', category: 'Extraversión' },
  { id: 'q2', text: 'Me resulta fácil iniciar conversaciones con personas que no conozco.', category: 'Extraversión' },
  { id: 'q3', text: 'Recargo mis energías estando rodeado de gente y participando en actividades sociales.', category: 'Extraversión' },
  
  { id: 'q4', text: 'Suelo priorizar la armonía del equipo y el bienestar de los demás antes que mis propios intereses.', category: 'Amabilidad' },
  { id: 'q5', text: 'Creo sinceramente en las buenas intenciones de las personas y confío en ellas fácilmente.', category: 'Amabilidad' },
  { id: 'q6', text: 'Me esfuerzo por ayudar a mis compañeros cuando veo que lo necesitan, incluso si estoy ocupado.', category: 'Amabilidad' },
  
  { id: 'q7', text: 'Siempre planifico mis tareas con anticipación y mantengo un cronograma detallado.', category: 'Responsabilidad' },
  { id: 'q8', text: 'Presto mucha atención a los detalles y me aseguro de que mi trabajo esté libre de errores.', category: 'Responsabilidad' },
  { id: 'q9', text: 'Me considero una persona sumamente disciplinada y comprometida con cumplir mis plazos.', category: 'Responsabilidad' },
  
  { id: 'q10', text: 'Mantengo la calma y la claridad mental incluso bajo situaciones de alta presión o estrés.', category: 'Estabilidad Emocional' },
  { id: 'q11', text: 'No suelo preocuparme demasiado por cosas que escapan de mi control directo.', category: 'Estabilidad Emocional' },
  { id: 'q12', text: 'Supero las frustraciones y los contratiempos en el trabajo rápidamente.', category: 'Estabilidad Emocional' },
  
  { id: 'q13', text: 'Constantemente busco nuevas formas de hacer las cosas y me encanta experimentar.', category: 'Apertura' },
  { id: 'q14', text: 'Disfruto discutiendo teorías abstractas y conceptos filosóficos complejos.', category: 'Apertura' },
  { id: 'q15', text: 'Me entusiasman los cambios y me adapto con rapidez a nuevos entornos de trabajo.', category: 'Apertura' },
];

const SCALES = [
  { value: 1, label: 'Muy en desacuerdo', color: 'hover:bg-red-500/20 hover:border-red-500 text-red-400' },
  { value: 2, label: 'En desacuerdo', color: 'hover:bg-orange-500/20 hover:border-orange-500 text-orange-400' },
  { value: 3, label: 'Neutral', color: 'hover:bg-slate-500/20 hover:border-slate-500 text-slate-400' },
  { value: 4, label: 'De acuerdo', color: 'hover:bg-cyan-500/20 hover:border-cyan-500 text-cyan-400' },
  { value: 5, label: 'Muy de acuerdo', color: 'hover:bg-cyan-600/20 hover:border-cyan-600 text-cyan-400' },
];

export default function CandidatePersonalityPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [takingTest, setTakingTest] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'traits' | 'advice'>('profile');
  const answeredCount = Object.keys(answers).length;

  const fetchTest = async () => {
    setLoading(true);
    try {
      const response = await api.get('/personality/my-test');
      setTestResult(response.data || null);
    } catch (error) {
      console.error('Error al obtener test de personalidad', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTest();
  }, []);

  const handleSelectAnswer = (questionId: string, val: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    // Auto-advance with a tiny delay
    if (currentIdx < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 250);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) setCurrentIdx(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < QUESTIONS.length) {
      alert('Por favor responde todas las preguntas del test.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/personality/submit', { answers });
      // After successful submission, fetch the stored test data
      await fetchTest();
      setTakingTest(false);
    } catch (error) {
      console.error('Error al enviar test de personalidad', error);
      alert('Ocurrió un error al procesar el test.');
    } finally {
      setSubmitting(false);
    }
  };

  const startTest = () => {
    setAnswers({});
    setCurrentIdx(0);
    setTakingTest(true);
  };

  // Helper values for Pentagon Radar Chart
  const getRadarPoints = () => {
    if (!testResult?.scores) return '';
    const scores = testResult.scores;
    const center = 100;
    const maxRadius = 70;
    
    // Traits order: Openness, Conscientiousness, Extraversion, Agreeableness, Stability
    const orderedScores = [
      scores.openness || 50,
      scores.conscientiousness || 50,
      scores.extraversion || 50,
      scores.agreeableness || 50,
      scores.stability || 50
    ];

    const angles = [-Math.PI / 2, -Math.PI / 2 + 0.4 * Math.PI * 1, -Math.PI / 2 + 0.4 * Math.PI * 2, -Math.PI / 2 + 0.4 * Math.PI * 3, -Math.PI / 2 + 0.4 * Math.PI * 4];
    
    return orderedScores.map((score, i) => {
      const radius = maxRadius * (score / 100);
      const x = center + radius * Math.cos(angles[i]);
      const y = center + radius * Math.sin(angles[i]);
      return `${x},${y}`;
    }).join(' ');
  };

  const generatePDF = () => {
    if (!testResult) return;
    const scores = testResult.scores;
    
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT DE PERSONALIDAD IA', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Plataforma de Reclutamiento SaaS con Inteligencia Artificial', 20, 28);
    doc.text(`Fecha de emisión: ${new Date(testResult.createdAt).toLocaleDateString('es-ES')}`, 20, 34);

    // Archetype Card
    doc.setFillColor(248, 250, 252); // slate 50
    doc.rect(20, 55, 170, 35, 'F');
    doc.setDrawColor(226, 232, 240); // slate 200
    doc.rect(20, 55, 170, 35, 'S');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ARQUETIPO PROFESIONAL DOMINANTE', 25, 63);

    doc.setTextColor(79, 70, 229); // indigo 600
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(testResult.personalityType, 25, 74);

    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Factores clave: ${testResult.traits?.join(', ')}`, 25, 83);

    // Dynamic Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Análisis Ejecutivo', 20, 103);
    
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    
    const summaryLines = doc.splitTextToSize(testResult.summary, 170);
    doc.text(summaryLines, 20, 110);

    let nextY = 110 + (summaryLines.length * 5) + 8;

    // Grid of scores
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Puntajes de Rasgos Big Five (OCEAN)', 20, nextY);

    nextY += 7;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');

    const traitsInfo = [
      { name: 'Apertura a la Innovación (Openness)', score: scores.openness },
      { name: 'Responsabilidad y Organización (Conscientiousness)', score: scores.conscientiousness },
      { name: 'Extraversión y Comunicación (Extraversion)', score: scores.extraversion },
      { name: 'Colaboración y Empatía (Agreeableness)', score: scores.agreeableness },
      { name: 'Estabilidad Emocional (Stability)', score: scores.stability }
    ];

    traitsInfo.forEach(t => {
      // Label
      doc.setTextColor(51, 65, 85);
      doc.text(t.name, 20, nextY);
      
      // Score number
      doc.setTextColor(79, 70, 229);
      doc.setFont('helvetica', 'bold');
      doc.text(`${t.score}%`, 175, nextY);
      doc.setFont('helvetica', 'normal');

      // Draw horizontal bar
      doc.setFillColor(241, 245, 249); // slate 100 background
      doc.rect(20, nextY + 2, 170, 3, 'F');
      doc.setFillColor(99, 102, 241); // indigo 500 fill
      doc.rect(20, nextY + 2, 170 * (t.score / 100), 3, 'F');

      nextY += 12;
    });

    nextY += 3;

    // Strengths
    if (scores.strengths && scores.strengths.length > 0) {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Fortalezas Clave', 20, nextY);
      
      nextY += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      
      scores.strengths.forEach((s: string) => {
        const lines = doc.splitTextToSize(`• ${s}`, 170);
        doc.text(lines, 20, nextY);
        nextY += lines.length * 4.5 + 1;
      });
    }

    // Add page if needed
    if (nextY > 240) {
      doc.addPage();
      nextY = 20;
    }

    // Weaknesses
    if (scores.weaknesses && scores.weaknesses.length > 0) {
      nextY += 4;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Áreas de Mejora Profesional', 20, nextY);
      
      nextY += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      
      scores.weaknesses.forEach((w: string) => {
        const lines = doc.splitTextToSize(`• ${w}`, 170);
        doc.text(lines, 20, nextY);
        nextY += lines.length * 4.5 + 1;
      });
    }

    // Advice
    if (scores.careerAdvice && scores.careerAdvice.length > 0) {
      nextY += 6;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Consejos de Desarrollo y Carrera', 20, nextY);
      
      nextY += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      
      scores.careerAdvice.forEach((a: string) => {
        const lines = doc.splitTextToSize(`• ${a}`, 170);
        doc.text(lines, 20, nextY);
        nextY += lines.length * 4.5 + 1;
      });
    }

    doc.save(`PersonalityReport_${testResult.personalityType.replace(/ /g, '_')}.pdf`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-cyan-300 mb-4" />
        <p className="text-slate-400 text-xs font-light">Cargando tu perfil de personalidad...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full bg-grid">
      {/* Back button */}
      <Link href="/candidate" className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors w-fit text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Panel</span>
      </Link>

      {!takingTest && !testResult && (
        /* Onboarding Screen */
        <div className="glass relative overflow-hidden p-8 sm:p-12 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-cyan-950/40 text-center animate-fade-in shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.20),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.12),transparent_20%)] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-3xl bg-slate-900/60 border border-white/10 text-cyan-300 shadow-[0_25px_60px_-40px_rgba(56,189,248,0.45)]">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <div className="space-y-3 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Test de Personalidad de IA</h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                Descubre tu arquetipo profesional basado en el modelo científico <span className="font-semibold text-white">Big Five (OCEAN)</span>. Comparte tu perfil con reclutadores y encuentra roles alineados con tu estilo de trabajo.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-3 text-left">
            <div className="glass-hover glass p-4 rounded-3xl border border-white/10 bg-slate-950/40">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-bold mb-2">Científico</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Un análisis diseñado para medir tus rasgos clave con precisión.</p>
            </div>
            <div className="glass-hover glass p-4 rounded-3xl border border-white/10 bg-slate-950/40">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-bold mb-2">Rápido</h3>
              <p className="text-xs text-slate-400 leading-relaxed">15 preguntas situacionales para completar el test en minutos.</p>
            </div>
            <div className="glass-hover glass p-4 rounded-3xl border border-white/10 bg-slate-950/40">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-bold mb-2">Acción</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Entrega un informe visual y recomendaciones prácticas.</p>
            </div>
          </div>

          <button
            onClick={startTest}
            className="btn-primary mt-10 w-full sm:w-auto mx-auto text-xs font-black tracking-widest uppercase py-4 px-10 shadow-[0_25px_60px_-30px_rgba(56,189,248,0.45)]"
          >
            Iniciar Test Ahora
          </button>
        </div>
      )}

      {takingTest && (
        /* Questionnaire Multi-step Card */
        <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-slate-900/50 to-slate-950/80 animate-scale-in relative shadow-[0_40px_120px_-75px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-slate-300 font-semibold">
                <span>Pregunta {currentIdx + 1}</span>
                <span className="text-slate-500">•</span>
                <span>{QUESTIONS[currentIdx].category}</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">Selecciona la respuesta que mejor refleje tu preferencia en cada situación. Si ya escogiste, el test seguirá al siguiente ítem automáticamente.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              {answeredCount}/{QUESTIONS.length} respondidas
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-10">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.45)]"
              style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Text Card */}
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 min-h-[170px] mb-8 flex items-center justify-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed select-none">
              “{QUESTIONS[currentIdx].text}”
            </h2>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 mb-8">
            {SCALES.map((scale) => {
              const questionId = QUESTIONS[currentIdx].id;
              const isSelected = answers[questionId] === scale.value;

              return (
                <button
                  key={scale.value}
                  onClick={() => handleSelectAnswer(questionId, scale.value)}
                  className={`group relative overflow-hidden rounded-3xl border p-4 text-center transition-all duration-200 active:scale-[0.98] flex flex-col justify-between items-center gap-3 ${
                    isSelected 
                      ? 'border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_30px_rgba(56,189,248,0.25)]' 
                      : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-cyan-500/20 hover:bg-slate-900/80 '
                  }`}
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-900 text-slate-200'}`}>
                    {scale.value}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-300 leading-tight">{scale.label}</span>
                  <span className="block text-[10px] text-slate-500">Toca para seleccionar</span>
                </button>
              );
            })}
          </div>

          {/* Actions Footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-t border-white/10 pt-6">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>

            {currentIdx === QUESTIONS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < QUESTIONS.length}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-[0_0_20px_rgba(56,189,248,0.20)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Procesando resultados</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Finalizar</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[QUESTIONS[currentIdx].id]}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span>Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {!takingTest && testResult && (
        /* Results Dashboard UI */
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-hover glass p-6 rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.85)]">
              <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-300 font-bold">Perfil Generado</span>
              <p className="mt-4 text-lg font-black text-white">{testResult.personalityType}</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Arquetipo IA basado en tus respuestas y el modelo Big Five.</p>
            </div>
            <div className="glass-hover glass p-6 rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.85)]">
              <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-bold">Puntaje Promedio</span>
              <p className="mt-4 text-3xl font-black text-white">{Math.round((testResult.scores.openness + testResult.scores.conscientiousness + testResult.scores.extraversion + testResult.scores.agreeableness + testResult.scores.stability) / 5)}%</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Una visión rápida de tu perfil combinado en las 5 dimensiones.</p>
            </div>
            <div className="glass-hover glass p-6 rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.85)]">
              <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-bold">Próximo paso</span>
              <p className="mt-4 text-lg font-black text-white">Comparte tu perfil</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Usa este reporte para destacar competencias clave con reclutadores.</p>
            </div>
          </div>

          {/* Archetype glowing card */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/10 via-slate-950/20 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 h-40 w-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
            
            <div className="space-y-3 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block">Arquetipo Profesional IA</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Award className="h-7 w-7 text-cyan-400 shrink-0" />
                {testResult.personalityType}
              </h1>
              <div className="flex flex-wrap gap-2 pt-1.5">
                {testResult.traits?.map((trait: string) => (
                  <span key={trait} className="px-2.5 py-0.5 bg-cyan-500/15 border border-cyan-500/25 text-[10px] font-bold text-cyan-300 rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto relative z-10">
              <button
                onClick={generatePDF}
                className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-slate-900/50 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold transition-all border border-white/5 text-xs"
              >
                <Download className="h-4 w-4 text-slate-400" />
                <span>Descargar PDF</span>
              </button>
              <button
                onClick={startTest}
                className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 text-slate-950 px-5 py-3 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] text-xs active:scale-95 duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Repetir Test</span>
              </button>
            </div>
          </div>

          {/* Radar Chart & Mini Score Grid section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Pentagon SVG Radar Widget */}
            <div className="md:col-span-2 glass p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center bg-slate-950/20 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Gráfico de Personalidad</span>
              
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <svg className="w-full h-full transform -rotate-180" viewBox="0 0 200 200">
                  {/* Outer Concentric Pentagon grids */}
                  {[0.25, 0.5, 0.75, 1.0].map((scale) => {
                    const r = 70 * scale;
                    const angles = [-Math.PI / 2, -Math.PI / 2 + 0.4 * Math.PI * 1, -Math.PI / 2 + 0.4 * Math.PI * 2, -Math.PI / 2 + 0.4 * Math.PI * 3, -Math.PI / 2 + 0.4 * Math.PI * 4];
                    const pts = angles.map(a => `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`).join(' ');
                    return (
                      <polygon 
                        key={scale} 
                        points={pts} 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.05)" 
                        strokeWidth="1"
                      />
                    );
                  })}
                  
                  {/* Axis lines */}
                  {[-Math.PI / 2, -Math.PI / 2 + 0.4 * Math.PI * 1, -Math.PI / 2 + 0.4 * Math.PI * 2, -Math.PI / 2 + 0.4 * Math.PI * 3, -Math.PI / 2 + 0.4 * Math.PI * 4].map((a, i) => {
                    return (
                      <line
                        key={i}
                        x1="100"
                        y1="100"
                        x2={100 + 70 * Math.cos(a)}
                        y2={100 + 70 * Math.sin(a)}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Filled radar polygon */}
                  <polygon 
                    points={getRadarPoints()} 
                    fill="rgba(99, 102, 241, 0.25)" 
                    stroke="rgba(99, 102, 241, 0.85)" 
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />

                  {/* Dots at radar vertices */}
                  {(() => {
                    const center = 100;
                    const maxRadius = 70;
                    const scores = testResult.scores;
                    const orderedScores = [
                      scores.openness || 50,
                      scores.conscientiousness || 50,
                      scores.extraversion || 50,
                      scores.agreeableness || 50,
                      scores.stability || 50
                    ];
                    const angles = [-Math.PI / 2, -Math.PI / 2 + 0.4 * Math.PI * 1, -Math.PI / 2 + 0.4 * Math.PI * 2, -Math.PI / 2 + 0.4 * Math.PI * 3, -Math.PI / 2 + 0.4 * Math.PI * 4];
                    return orderedScores.map((score, i) => {
                      const radius = maxRadius * (score / 100);
                      const x = center + radius * Math.cos(angles[i]);
                      const y = center + radius * Math.sin(angles[i]);
                      return (
                        <circle 
                          key={i} 
                          cx={x} 
                          cy={y} 
                          r="4.5" 
                          fill="#ffffff" 
                          stroke="#6366f1" 
                          strokeWidth="2.5" 
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Pentagon absolute tags */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-cyan-300 uppercase tracking-widest">Apertura</div>
                <div className="absolute bottom-[20%] right-[-10px] text-[9px] font-black text-cyan-300 uppercase tracking-widest text-right">Extrav.</div>
                <div className="absolute bottom-[20%] left-[-10px] text-[9px] font-black text-cyan-300 uppercase tracking-widest text-left">Respons.</div>
                <div className="absolute top-[35%] right-[-24px] text-[9px] font-black text-cyan-300 uppercase tracking-widest text-right">Estabil.</div>
                <div className="absolute top-[35%] left-[-24px] text-[9px] font-black text-cyan-300 uppercase tracking-widest text-left">Amabil.</div>
              </div>
              
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-light">Este mapa dinámico muestra la distribución de tus fortalezas conductuales en las 5 dimensiones clave.</p>
            </div>

            {/* Trait breakdown lists */}
            <div className="md:col-span-3 glass p-6 rounded-2xl border border-white/5 space-y-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Desglose de Dimensiones</span>
              
              <div className="space-y-4">
                {[
                  { name: 'Apertura a la Innovación (Openness)', score: testResult.scores.openness, desc: 'Imaginación, curiosidad intelectual y gusto por la variedad.' },
                  { name: 'Responsabilidad y Organización (Conscientiousness)', score: testResult.scores.conscientiousness, desc: 'Disciplina, esmero y orientación a metas estructuradas.' },
                  { name: 'Extraversión y Relacionamiento (Extraversion)', score: testResult.scores.extraversion, desc: 'Sociabilidad, liderazgo y comunicación asertiva.' },
                  { name: 'Colaboración y Empatía (Agreeableness)', score: testResult.scores.agreeableness, desc: 'Empatía, confianza y priorización del equipo.' },
                  { name: 'Estabilidad Emocional y Resiliencia (Stability)', score: testResult.scores.stability, desc: 'Gestión de estrés, ecuanimidad y tolerancia a la frustración.' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-300">{item.name}</span>
                      <span className="font-black text-cyan-400">{item.score}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs bar details */}
          <div className="space-y-6">
            <div className="flex border-b border-white/5 space-x-6">
              {[
                { id: 'profile', label: 'Análisis Ejecutivo', icon: BrainCircuit },
                { id: 'traits', label: 'Fortalezas y Áreas de Mejora', icon: Heart },
                { id: 'advice', label: 'Consejos de Carrera', icon: Compass },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-3xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500/15 text-white shadow-[0_10px_40px_-30px_rgba(56,189,248,0.65)] border border-cyan-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content panel */}
            <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 min-h-[220px] bg-slate-950/60 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.6)]">
              
              {activeTab === 'profile' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Perfil Conductual Profesional</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-light whitespace-pre-line bg-slate-900/20 p-5 rounded-xl border border-white/5 italic">
                    "{testResult.summary}"
                  </p>
                  <p className="text-[10px] text-slate-500 font-light">Este análisis ejecutivo es autogenerado a partir de tu distribución Big Five mediante algoritmos de inteligencia artificial aplicados al comportamiento corporativo.</p>
                </div>
              )}

              {activeTab === 'traits' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-emerald-950/5 border border-emerald-500/10 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Fortalezas de Personalidad
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-2.5 font-light">
                      {testResult.scores.strengths?.map((s: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-emerald-400 mr-2.5 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/30 border border-white/5 p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-500" />
                      Áreas de Mejora Profesional
                    </h4>
                    <ul className="text-xs text-slate-300 space-y-2.5 font-light">
                      {testResult.scores.weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="text-slate-500 mr-2.5 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'advice' && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass className="h-5 w-5 text-cyan-400" />
                    Recomendaciones para Potenciar tu Desarrollo
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {testResult.scores.careerAdvice?.map((advice: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="h-6 w-6 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-light">{advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
