import json
from fastapi import APIRouter, HTTPException
from models.schemas import PersonalityAnalysisRequest
from dependencies import ai_client

router = APIRouter()

@router.post("/analyze-personality")
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

    IMPORTANTE: TODAS las respuestas, textos y consejos generados en el JSON DEBEN estar en ESPAÑOL.
    """

    try:
        response = await ai_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content) if response.choices[0].message.content else {}
    except Exception as e:
        print(f"Error in analyze_personality: {e}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")
