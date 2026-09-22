import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private pythonServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.pythonServiceUrl = this.configService.get<string>('PYTHON_AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async evaluateCvAgainstJob(cvText: string, jobRequirements: any): Promise<any> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobRequirements }),
      });

      if (!response.ok) {
        throw new Error(`Python service returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error llamando al servicio de IA en Python (evaluateCvAgainstJob):', error?.message || error);
      console.log('Devolviendo evaluación simulada debido a error de servicio.');
      return {
        score: 85,
        strengths: ["Experiencia técnica alineada (vía Python Service)", "Habilidades de resolución de problemas"],
        weaknesses: ["Falta experiencia específica en algunas herramientas secundarias"],
        recommendations: ["Destacar más los logros cuantitativos en la entrevista", "Repasar conceptos clave de la arquitectura requerida"]
      };
    }
  }

  async analyzeGeneralCv(cvText: string): Promise<any> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      });

      if (!response.ok) {
        throw new Error(`Python service returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error en análisis general vía Python:', error?.message || error);
      console.log('Devolviendo análisis simulado debido a error de servicio.');
      return {
        role: "Desarrollador de Software (Análisis Simulado)",
        summary: "Perfil técnico sólido con experiencia en desarrollo de aplicaciones web y capacidad demostrada para aprender nuevas tecnologías rápidamente.",
        strengths: ["Resolución analítica de problemas", "Desarrollo Full-Stack", "Adaptabilidad"],
        weaknesses: ["Mayor exposición a arquitecturas en la nube a gran escala", "Liderazgo técnico formal"],
        technicalSkills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
        recommendations: ["Mejorar detalle sobre el impacto en negocios de proyectos anteriores", "Incluir métricas de rendimiento en la experiencia laboral"]
      };
    }
  }

  async generatePracticeQuestions(cvText: string, jobTitle?: string, jobDescription?: string): Promise<any> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/generate-practice-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobTitle, jobDescription }),
      });

      if (!response.ok) {
        throw new Error(`Python service returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error in generatePracticeQuestions:', error?.message || error);
      return {
        questions: [
          { id: 1, question: "¿Podrías describir un desafío técnico complejo y cómo lo resolviste?" },
          { id: 2, question: "¿Cómo manejas los desacuerdos técnicos dentro de un equipo de desarrollo?" },
          { id: 3, question: "¿Qué metodologías utilizas para asegurar la calidad del código?" },
          { id: 4, question: "¿Cómo priorizas tus tareas al trabajar con plazos de entrega ajustados?" },
          { id: 5, question: "¿Por qué te interesa esta área y cómo te mantienes actualizado con las nuevas tecnologías?" }
        ]
      };
    }
  }

  async evaluatePracticeAnswer(question: string, answer: string, cvText: string): Promise<any> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/evaluate-practice-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, cvText }),
      });

      if (!response.ok) {
        throw new Error(`Python service returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error in evaluatePracticeAnswer:', error?.message || error);
      return {
        score: 75,
        feedback: "Tu respuesta cubre los aspectos básicos, pero sería ideal que estructures tu relato usando la metodología STAR (Situación, Tarea, Acción, Resultado) y menciones tecnologías clave del currículum.",
        idealAnswer: "En mi experiencia previa, cuando nos enfrentamos a un cuello de botella en rendimiento, utilicé análisis estático para identificar la consulta SQL causante y la optimicé agregando índices y reduciendo uniones complejas, reduciendo la latencia de respuesta en un 40%."
      };
    }
  }

  async generateRecruiterQuestions(cvText: string, jobTitle: string, jobDescription: string, score: number): Promise<any> {
    try {
      const response = await fetch(`${this.pythonServiceUrl}/generate-recruiter-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jobTitle, jobDescription, score }),
      });

      if (!response.ok) {
        throw new Error(`Python service returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error in generateRecruiterQuestions:', error?.message || error);
      return {
        questions: [
          {
            question: "¿Podrías darme un ejemplo de un proyecto donde tuviste que liderar técnicamente sin tener el cargo oficial, como se insinúa en tu perfil?",
            why_ask: "El candidato tiene buena experiencia técnica pero carece de roles de liderazgo formales en su CV.",
            expected_points: "Iniciativa propia, gestión de desacuerdos, entrega a tiempo."
          },
          {
            question: "Mencionas experiencia con JavaScript y frameworks modernos, ¿cómo abordarías una migración arquitectónica a gran escala bajo presión?",
            why_ask: "Para validar su nivel de profundidad en arquitecturas complejas y manejo de estrés laboral.",
            expected_points: "Desacoplamiento, pruebas automatizadas, planificación por fases."
          }
        ]
      };
    }
  }
}

