import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Recruitment Service")

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

class JobRequirements(BaseModel):
    title: str
    description: str
    skills: List[str]
    experience: int

class CvEvaluationRequest(BaseModel):
    cvText: str
    jobRequirements: JobRequirements

class CvAnalysisRequest(BaseModel):
    cvText: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/evaluate")
async def evaluate_cv(request: CvEvaluationRequest):
    prompt = f"""
    Eres un experto en búsqueda y selección de ejecutivos para todos los sectores. Te proporcionaré la descripción del puesto y el currículum del candidato.

    Tu tarea consiste en analizar la idoneidad del candidato para el puesto y devolver un objeto JSON con la siguiente estructura:

    {{
    "score": <número entre 0 y 100 que representa el porcentaje de compatibilidad>,
    "strengths": [<array de cadenas que contiene las fortalezas del candidato para este puesto>],
    "weaknesses": [<array de cadenas que contiene las habilidades o debilidades que le faltan>],
    "recommendations": [<array de cadenas con recomendaciones prácticas para el candidato o el responsable de contratación>]
    }}

    Job Requirements:
    Title: {request.jobRequirements.title}
    Description: {request.jobRequirements.description}
    Skills: {", ".join(request.jobRequirements.skills)}
    Required Experience: {request.jobRequirements.experience} years

    Candidate CV Text:
    {request.cvText}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        import json
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in evaluate_cv: {e}")
        # Fallback response
        return {
            "score": 85,
            "strengths": ["Experiencia técnica alineada (Python Port)", "Habilidades portadas"],
            "weaknesses": ["Error de API en Python"],
            "recommendations": ["Revisar logs de Python"]
        }

@app.post("/analyze")
async def analyze_cv(request: CvAnalysisRequest):
    prompt = f"""
    Eres un Headhunter Ejecutivo 'Top Tier' a nivel global, conocido por ser directo, exigente y visionario en cualquier industria. 
    Analiza el siguiente CV para extraer el verdadero potencial del candidato y generar un análisis de alto impacto.
    
    Responde estrictamente en formato JSON con la siguiente estructura:
    {{
      "candidateName": "Extrae el nombre completo del candidato del texto del CV",
      "role": "Define un título profesional impactante",
      "summary": "Resumen ejecutivo detallado de 3-4 líneas resaltando logros cuantificables",
      "strengths": ["Mínimo 4 fortalezas estratégicas"],
      "weaknesses": ["2 áreas de mejora reales y constructivas"],
      "technicalSkills": ["Habilidades técnicas y herramientas específicas"],
      "softSkills": ["Habilidades blandas detectadas"],
      "experienceYears": "Cálculo aproximado de años de experiencia total",
      "recommendations": ["3 consejos accionables para mejorar su perfil"]
    }}

    Texto del CV:
    {request.cvText}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        import json
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in analyze_cv: {e}")
        return {
            "role": "Analista Python",
            "summary": "Resumen portado a Python.",
            "strengths": ["Python"],
            "weaknesses": [],
            "technicalSkills": [],
            "recommendations": []
        }

class PracticeQuestionsRequest(BaseModel):
    cvText: str
    jobTitle: Optional[str] = None
    jobDescription: Optional[str] = None

class EvaluatePracticeAnswerRequest(BaseModel):
    question: str
    answer: str
    cvText: str

class RecruiterQuestionsRequest(BaseModel):
    cvText: str
    jobTitle: str
    jobDescription: str
    score: int

@app.post("/generate-practice-questions")
async def generate_practice_questions(request: PracticeQuestionsRequest):
    job_info = ""
    if request.jobTitle:
        job_info = f"\nTarget Job: {request.jobTitle}\nJob Description: {request.jobDescription}"

    prompt = f"""
    Eres un seleccionador y coach de carrera experto. Basándote en el CV del candidato y, si está disponible, en el puesto al que aspira, genera exactamente 5 preguntas de entrevista de comportamiento personalizadas y desafiantes. Las preguntas deben profundizar en sus áreas de mejora y validar sus fortalezas técnicas indicadas en el CV.
    
    Devuelve un objeto JSON con el siguiente formato exacto:
    {{
      "questions": [
        {{ "id": 1, "question": "Pregunta 1" }},
        {{ "id": 2, "question": "Pregunta 2" }},
        {{ "id": 3, "question": "Pregunta 3" }},
        {{ "id": 4, "question": "Pregunta 4" }},
        {{ "id": 5, "question": "Pregunta 5" }}
      ]
    }}

    CV del candidato:
    {request.cvText}
    {job_info}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        import json
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {"questions": []}
    except Exception as e:
        print(f"Error in generate_practice_questions: {e}")
        return {
            "questions": [
                { "id": 1, "question": "¿Podrías describir un desafío técnico complejo y cómo lo resolviste?" },
                { "id": 2, "question": "¿Cómo manejas los desacuerdos técnicos dentro de un equipo de desarrollo?" },
                { "id": 3, "question": "¿Qué metodologías utilizas para asegurar la calidad del código?" },
                { "id": 4, "question": "¿Cómo priorizas tus tareas al trabajar con plazos de entrega ajustados?" },
                { "id": 5, "question": "¿Por qué te interesa esta área y cómo te mantienes actualizado con las nuevas tecnologías?" }
            ]
        }

@app.post("/evaluate-practice-answer")
async def evaluate_practice_answer(request: EvaluatePracticeAnswerRequest):
    prompt = f"""
    Eres un entrevistador técnico y coach experto. Evalúa la respuesta dada por el candidato a la siguiente pregunta de entrevista de trabajo, considerando también su CV de contexto.
    
    Pregunta: {request.question}
    Respuesta del candidato: {request.answer}
    CV del candidato: {request.cvText}
    
    Devuelve un análisis constructivo y riguroso en formato JSON con la siguiente estructura exacta:
    {{
      "score": <número entero de 0 a 100 indicando la calidad de la respuesta>,
      "feedback": "Análisis detallado en español de qué fue excelente y qué áreas específicas le faltó profundizar (usa un tono alentador pero directo y profesional)",
      "idealAnswer": "Un ejemplo redactado de cómo sería una respuesta de nivel sobresaliente para esta misma pregunta basada en su perfil y mejores prácticas"
    }}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        import json
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in evaluate_practice_answer: {e}")
        return {
            "score": 75,
            "feedback": "Tu respuesta cubre los aspectos básicos, pero sería ideal que estructures tu relato usando la metodología STAR (Situación, Tarea, Acción, Resultado) y menciones tecnologías clave del currículum.",
            "idealAnswer": "En mi experiencia previa, cuando nos enfrentamos a [Problema], utilicé [Tecnología] para [Acción]. Esto nos permitió lograr [Métrica/Resultado]."
        }

@app.post("/generate-recruiter-questions")
async def generate_recruiter_questions(request: RecruiterQuestionsRequest):
    prompt = f"""
    Eres un Consultor de Selección y Headhunter Ejecutivo de alto nivel.
    Analiza el currículum del candidato en relación con los requisitos del puesto para generar una guía de entrevista de 4 preguntas de comportamiento extremadamente personalizadas. Estas preguntas deben profundizar en las posibles debilidades detectadas del candidato y verificar sus habilidades críticas para el puesto.
    
    Puesto: {request.jobTitle}
    Descripción del puesto: {request.jobDescription}
    CV del candidato: {request.cvText}
    Puntaje de compatibilidad actual: {request.score}%

    Devuelve un objeto JSON con el siguiente formato exacto:
    {{
      "questions": [
        {{
          "question": "Pregunta detallada de entrevista",
          "why_ask": "Explicación breve al reclutador de por qué hacer esta pregunta específica a este candidato (ej. verificar la debilidad X)",
          "expected_points": "Puntos o palabras clave específicos que el candidato debería mencionar para dar una respuesta satisfactoria"
        }},
        ...
      ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        import json
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {"questions": []}
    except Exception as e:
        print(f"Error in generate_recruiter_questions: {e}")
        return {
            "questions": [
                {
                    "question": "¿Podrías darme un ejemplo de un proyecto donde tuviste que liderar técnicamente sin tener el cargo oficial, como se insinúa en tu perfil?",
                    "why_ask": "El candidato tiene buena experiencia técnica pero carece de roles de liderazgo formales en su CV.",
                    "expected_points": "Iniciativa propia, gestión de desacuerdos, entrega a tiempo."
                },
                {
                    "question": "Mencionas experiencia con JavaScript y frameworks modernos, ¿cómo abordarías una migración arquitectónica a gran escala bajo presión?",
                    "why_ask": "Para validar su nivel de profundidad en arquitecturas complejas y manejo de estrés laboral.",
                    "expected_points": "Desacoplamiento, pruebas automatizadas, planificación por fases."
                }
            ]
        }
class PersonalityAnalysisRequest(BaseModel):
    name: str
    scores: dict
    personalityType: str
    cvText: Optional[str] = None

@app.post("/analyze-personality")
async def analyze_personality(request: PersonalityAnalysisRequest):
    cv_context = ""
    if request.cvText:
        cv_context = f"\nContexto del CV del candidato:\n{request.cvText}"

    prompt = f"""
    Eres un psicólogo organizacional y experto en desarrollo de carrera 'Top Tier'.
    Analiza el perfil de personalidad del candidato {request.name} basándote en los siguientes resultados de su test Big Five (OCEAN):
    - Arquetipo dominante: {request.personalityType}
    - Puntajes por dimensión (de 0 a 100%):
      * Apertura a la innovación (Openness): {request.scores.get('openness', 50)}%
      * Responsabilidad y organización (Conscientiousness): {request.scores.get('conscientiousness', 50)}%
      * Extraversión y comunicación (Extraversion): {request.scores.get('extraversion', 50)}%
      * Colaboración y empatía (Agreeableness): {request.scores.get('agreeableness', 50)}%
      * Estabilidad emocional y resiliencia (Stability): {request.scores.get('stability', 50)}%
    {cv_context}

    Genera una devolución profesional de alto impacto en español, en formato JSON estricto con la siguiente estructura:
    {{
      "summary": "Un resumen ejecutivo de 4-5 líneas que describa sus principales rasgos, estilo de trabajo, comunicación, resiliencia y adaptabilidad.",
      "traits": ["3 palabras clave que sinteticen sus rasgos más marcados (ej: Innovador, Organizado, Empático)"],
      "strengths": ["3 fortalezas de personalidad accionables y detalladas"],
      "weaknesses": ["2 áreas de mejora reales explicadas constructivamente"],
      "careerAdvice": ["3 consejos prácticos de carrera o comportamiento en equipo para maximizar su potencial"]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        import json
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in analyze_personality: {e}")
        return {}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

