import json
from fastapi import APIRouter, HTTPException
from models.schemas import CvEvaluationRequest, CvAnalysisRequest
from dependencies import ai_client

router = APIRouter()

@router.post("/evaluate")
async def evaluate_cv(request: CvEvaluationRequest):
    prompt = f"""
    Eres un experto en búsqueda y selección de ejecutivos para todos los sectores. Te proporcionaré la descripción del puesto y el currículum del candidato.

    POLÍTICA ESTRICTA ANTI-SESGO (BLIND SCREENING):
    1. Evalúa estricta y únicamente basándote en el mérito, las habilidades demostrables y la experiencia profesional.
    2. Ignora por completo cualquier indicador de género, edad (fechas de graduación), raza, etnia, nacionalidad, orientación sexual, estado civil o estatus socioeconómico.
    3. El nombre del candidato o el prestigio de las instituciones académicas no deben influir en tu calificación.
    4. Redacta todas tus recomendaciones y análisis utilizando un lenguaje inclusivo, neutral y objetivo.

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
    
    IMPORTANTE: TODAS las respuestas, textos y recomendaciones generadas en el JSON DEBEN estar en ESPAÑOL.
    """

    try:
        response = await ai_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in evaluate_cv: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@router.post("/analyze")
async def analyze_cv(request: CvAnalysisRequest):
    prompt = f"""
    Eres un Headhunter Ejecutivo 'Top Tier' a nivel global, conocido por ser directo, exigente y visionario en cualquier industria. 
    Analiza el siguiente CV para extraer el verdadero potencial del candidato y generar un análisis de alto impacto.
    
    POLÍTICA ESTRICTA ANTI-SESGO (BLIND SCREENING):
    1. Evalúa estricta y únicamente basándote en el mérito, las habilidades demostrables y la experiencia profesional.
    2. Ignora por completo cualquier indicador de género, edad (fechas de graduación), raza, etnia, nacionalidad, orientación sexual, estado civil o estatus socioeconómico.
    3. El nombre del candidato (aunque lo extraigas) o el prestigio de las instituciones académicas no deben influir en tu análisis.
    4. Redacta todas tus recomendaciones y análisis utilizando un lenguaje inclusivo, neutral y objetivo.

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

    IMPORTANTE: TODAS las respuestas, textos y recomendaciones generadas en el JSON DEBEN estar en ESPAÑOL.
    """

    try:
        response = await ai_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in analyze_cv: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
