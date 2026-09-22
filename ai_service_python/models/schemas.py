from pydantic import BaseModel
from typing import List, Optional

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

class PersonalityAnalysisRequest(BaseModel):
    name: str
    scores: dict
    personalityType: str
    cvText: Optional[str] = None
