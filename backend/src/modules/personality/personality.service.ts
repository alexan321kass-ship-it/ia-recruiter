import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PersonalityService {
  private pythonServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.pythonServiceUrl = this.configService.get<string>('PYTHON_AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async findByUserId(userId: string) {
    return this.prisma.personalityTest.findUnique({
      where: { userId },
    });
  }

  async submit(userId: string, answers: Record<string, number>) {
    // 1. Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Extraer y promediar respuestas (escala 1 a 5)
    // q1-q3: Extraversión
    // q4-q6: Amabilidad
    // q7-q9: Responsabilidad
    // q10-q12: Estabilidad Emocional
    // q13-q15: Apertura
    const getVal = (key: string) => {
      const v = answers[key] ?? 3; // 3 por defecto (neutral)
      return Math.max(1, Math.min(5, v)); // Clamp entre 1 y 5
    };

    const extRaw = getVal('q1') + getVal('q2') + getVal('q3');
    const agrRaw = getVal('q4') + getVal('q5') + getVal('q6');
    const conRaw = getVal('q7') + getVal('q8') + getVal('q9');
    const staRaw = getVal('q10') + getVal('q11') + getVal('q12');
    const opeRaw = getVal('q13') + getVal('q14') + getVal('q15');

    // Máximo teórico es 15. Calculamos el porcentaje
    const scores = {
      extraversion: Math.round((extRaw / 15) * 100),
      agreeableness: Math.round((agrRaw / 15) * 100),
      conscientiousness: Math.round((conRaw / 15) * 100),
      stability: Math.round((staRaw / 15) * 100),
      openness: Math.round((opeRaw / 15) * 100),
    };

    // 3. Determinar el rasgo dominante y su arquetipo
    const scoreEntries = Object.entries(scores);
    scoreEntries.sort((a, b) => b[1] - a[1]);
    const dominantTrait = scoreEntries[0][0];

    let personalityType = 'El Colaborador Empático';
    let fallback = {
      summary: 'Tu prioridad fundamental es la armonía grupal y el bienestar de los miembros de tu equipo. Te caracteriza una profunda empatía y una disposición sincera para colaborar y mediar ante conflictos. Eres el pegamento social que mantiene unidas a las personas bajo un ambiente positivo.',
      traits: ['Trabajo en equipo', 'Empatía', 'Mediación'],
      strengths: [
        'Facilidad natural para integrarse en equipos multiculturales y multidisciplinarios',
        'Gran aptitud para la escucha empática y la resolución constructiva de diferencias',
        'Inclinación a dar soporte incondicional a los compañeros de trabajo'
      ],
      weaknesses: [
        'Dificultad para decir "no" o poner límites firmes ante demandas excesivas',
        'Evitación del conflicto constructivo por miedo a dañar la armonía personal'
      ],
      careerAdvice: [
        'Roles en gestión de recursos humanos, éxito del cliente (Customer Success), liderazgo servicial, soporte o mediación de conflictos te beneficiarán enormemente',
        'Recuerda que el desacuerdo técnico o constructivo es fundamental para el crecimiento del producto; exprésalo sin temor',
        'Establece límites claros sobre tu carga de trabajo para proteger tu salud mental'
      ],
    };

    if (dominantTrait === 'openness') {
      personalityType = 'El Innovador Visionario';
      fallback = {
        summary: 'Muestras una alta curiosidad intelectual y una inclinación innata hacia la innovación y la creatividad. Te entusiasma explorar ideas complejas y abstractas, adaptándote con extrema rapidez a los cambios en el entorno de trabajo. Encuentras motivación al diseñar soluciones novedosas para problemas desafiantes.',
        traits: ['Innovación', 'Creatividad', 'Adaptabilidad'],
        strengths: [
          'Habilidad excepcional para idear soluciones fuera de lo común',
          'Apertura y entusiasmo genuino frente a la incertidumbre y el cambio',
          'Gran capacidad para aprender nuevas tecnologías y conceptos complejos rápidamente'
        ],
        weaknesses: [
          'Tendencia a aburrirse con tareas rutinarias o de mantenimiento operativo',
          'Riesgo de perder el foco en la ejecución final por entusiasmarse con la conceptualización'
        ],
        careerAdvice: [
          'Busca roles que involucren investigación y desarrollo, diseño de nuevos productos o consultoría estratégica',
          'Esfuérzate por aliarte con perfiles más orientados a la ejecución para llevar tus ideas a la realidad',
          'Establece límites de tiempo concretos al explorar alternativas creativas para no descuidar los plazos'
        ],
      };
    } else if (dominantTrait === 'conscientiousness') {
      personalityType = 'El Organizador Estratégico';
      fallback = {
        summary: 'Te destacas por un alto sentido del deber, disciplina y una meticulosa atención a los detalles. Planificas tus responsabilidades con minuciosidad y te comprometes rigurosamente con los plazos de entrega. En el trabajo, eres visto como el pilar de confiabilidad y precisión del equipo.',
        traits: ['Precisión', 'Disciplina', 'Planificación'],
        strengths: [
          'Extraordinaria capacidad de organización personal y gestión del tiempo',
          'Alto estándar de calidad en las entregas, previniendo errores de forma proactiva',
          'Gran sentido del compromiso y consistencia en el rendimiento laboral'
        ],
        weaknesses: [
          'Inclinación al perfeccionamiento excesivo, lo cual puede generar parálisis por análisis',
          'Dificultad inicial para reaccionar ante cambios drásticos de planes o interrupciones repentinas'
        ],
        careerAdvice: [
          'Roles de gestión de proyectos, aseguramiento de calidad (QA), desarrollo de infraestructuras críticas u operaciones serán ideales para ti',
          'Practica la flexibilidad cognitiva y aprende a delegar o priorizar tareas bajo el concepto de "suficientemente bueno"',
          'Dedica tiempo intencional para descansar y evitar el agotamiento por sobre-exigencia'
        ],
      };
    } else if (dominantTrait === 'extraversion') {
      personalityType = 'El Comunicador Dinámico';
      fallback = {
        summary: 'Posees una gran energía social y capacidad de persuasión. Te resulta natural conectar con otras personas, liderar debates y coordinar dinámicas de grupo. Encuentras motivación al trabajar cara a cara con clientes y equipos de trabajo dinámicos.',
        traits: ['Liderazgo', 'Influencia', 'Relacionamiento'],
        strengths: [
          'Excelente comunicación verbal y facilidad para inspirar a otros',
          'Gran habilidad para negociar, resolver disputas interpersonales y crear alianzas',
          'Alta proactividad para liderar iniciativas o representar al equipo externamente'
        ],
        weaknesses: [
          'Posible tendencia a monopolizar discusiones o debates grupales',
          'Riesgo de dispersión al enfocarse demasiado en el plano relacional antes que en la ejecución técnica'
        ],
        careerAdvice: [
          'Sobresaldrás en roles de liderazgo de equipos, relaciones públicas, ventas de alto nivel, reclutamiento o gestión del cambio',
          'Asegúrate de reservar espacios de trabajo profundo e individual para enfocarse en tareas complejas sin interrupciones',
          'Practica la escucha activa y dale espacio a los perfiles más introvertidos para que expresen sus ideas'
        ],
      };
    } else if (dominantTrait === 'stability') {
      personalityType = 'El Líder Resiliente';
      fallback = {
        summary: 'Destacas por tu ecuanimidad y tu capacidad de mantener la cabeza fría bajo presiones extremas. Los contratiempos o las críticas constructivas no te desestabilizan; al contrario, te impulsan a buscar soluciones pragmáticas. Aportas una enorme tranquilidad y seguridad a todo tu entorno laboral.',
        traits: ['Manejo de estrés', 'Estabilidad', 'Resolución de conflictos'],
        strengths: [
          'Altísima tolerancia a la frustración y calma ante crisis corporativas',
          'Enfoque pragmático y orientado a la solución de incidentes críticos',
          'Estilo de liderazgo estable y predecible que reduce la ansiedad del equipo'
        ],
        weaknesses: [
          'Riesgo de proyectar una imagen excesivamente fría o desapegada emocionalmente',
          'Dificultad potencial para percibir la urgencia emocional o el estrés en otros compañeros'
        ],
        careerAdvice: [
          'Destacarás en entornos de alta exigencia y cambio continuo, como startups en crecimiento, roles de respuesta ante incidentes (SRE), o puestos directivos de alta gerencia',
          'Esfuérzate por comunicar tus decisiones explicando también la dimensión humana para generar mayor cercanía relacional',
          'Utiliza tu resiliencia para ser mentor de compañeros más jóvenes que estén aprendiendo a gestionar la presión'
        ],
      };
    }

    // 4. Buscar CV del usuario para contexto de IA (opcional)
    const latestCv = await this.prisma.cv.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    let aiAnalysis: any = null;

    // 5. Intentar llamar al servicio de Python AI si está disponible
    try {
      const response = await fetch(`${this.pythonServiceUrl}/analyze-personality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          scores,
          personalityType,
          cvText: latestCv?.parsedText || null,
        }),
      });

      if (response.ok) {
        aiAnalysis = await response.json();
      }
    } catch (error) {
      console.warn('Error llamando al servicio de IA para personalidad, usando fallback local.', error);
    }

    const finalSummary = aiAnalysis?.summary || fallback.summary;
    const finalTraits = aiAnalysis?.traits || fallback.traits;
    const finalStrengths = aiAnalysis?.strengths || fallback.strengths;
    const finalWeaknesses = aiAnalysis?.weaknesses || fallback.weaknesses;
    const finalCareerAdvice = aiAnalysis?.careerAdvice || fallback.careerAdvice;

    // 6. Guardar / Actualizar en Base de Datos
    const result = await this.prisma.personalityTest.upsert({
      where: { userId },
      update: {
        answers,
        personalityType,
        summary: finalSummary,
        traits: finalTraits,
        scores: {
          ...scores,
          strengths: finalStrengths,
          weaknesses: finalWeaknesses,
          careerAdvice: finalCareerAdvice,
        },
      },
      create: {
        userId,
        answers,
        scores: {
          ...scores,
          strengths: finalStrengths,
          weaknesses: finalWeaknesses,
          careerAdvice: finalCareerAdvice,
        },
        personalityType,
        summary: finalSummary,
        traits: finalTraits,
      },
    });

    return result;
  }
}
