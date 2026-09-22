import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

ai_client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)
