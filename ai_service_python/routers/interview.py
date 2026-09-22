import json
from fastapi import APIRouter, HTTPException
from models.schemas import PracticeQuestionsRequest, EvaluatePracticeAnswerRequest, RecruiterQuestionsRequest
from dependencies import ai_client

router = APIRouter()

@router.post("/generate-practice-questions")
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

    IMPORTANTE: TODAS las preguntas y el texto dentro del JSON DEBEN estar en ESPAÑOL.
    """

    try:
        response = await ai_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {"questions": []}
    except Exception as e:
        print(f"Error in generate_practice_questions: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@router.post("/evaluate-practice-answer")
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

    IMPORTANTE: TODAS las respuestas, textos y feedbacks generados en el JSON DEBEN estar en ESPAÑOL.
    """

    try:
        response = await ai_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in evaluate_practice_answer: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@router.post("/generate-recruiter-questions")
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

    IMPORTANTE: TODAS las preguntas, respuestas y textos dentro del JSON DEBEN estar en ESPAÑOL.
    """

    try:
        response = await ai_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {"questions": []}
    except Exception as e:
        print(f"Error in generate_recruiter_questions: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
