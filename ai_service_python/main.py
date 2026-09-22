import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from routers import cv, interview, personality

app = FastAPI(title="AI Recruitment Service")

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(cv.router, tags=["CV Analysis"])
app.include_router(interview.router, tags=["Interview Questions"])
app.include_router(personality.router, tags=["Personality Test"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
