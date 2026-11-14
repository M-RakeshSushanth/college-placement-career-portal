import os
import json
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from services.document_processor import extract_text
from services.ats_analyzer import analyze_ats_resume
from services.resume_improver import generate_resume_improvements
from services.mock_interview import generate_interview_questions, evaluate_interview_answer

app = FastAPI(
    title="College Placement AI Microservice",
    description="FastAPI service powering ATS resume analysis, RAG semantic matching, resume improvement, and mock interview preparation.",
    version="1.0.0"
)

# Enable CORS for backend & frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ATSAnalyzeTextRequest(BaseModel):
    resume_text: str
    job_title: str
    job_description: str
    required_skills: Optional[List[str]] = []

class ResumeImproveRequest(BaseModel):
    resume_text: str
    job_title: str
    job_description: str

class GenerateQuestionsRequest(BaseModel):
    role: str
    technology: Optional[str] = ""
    experience_level: Optional[str] = "Entry Level / Fresher"
    count: Optional[int] = 5

class EvaluateAnswerRequest(BaseModel):
    question: str
    student_answer: str
    expected_topics: Optional[List[str]] = []
    role: Optional[str] = ""

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "College Placement AI Processing Engine",
        "endpoints": [
            "/ats/analyze",
            "/ats/analyze-file",
            "/resume/improve",
            "/mock-interview/generate-questions",
            "/mock-interview/evaluate-answer"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/ats/analyze")
def analyze_ats(payload: ATSAnalyzeTextRequest):
    try:
        result = analyze_ats_resume(
            resume_text=payload.resume_text,
            job_title=payload.job_title,
            job_description=payload.job_description,
            required_skills=payload.required_skills
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ats/analyze-file")
async def analyze_ats_file(
    job_title: str = Form(...),
    job_description: str = Form(...),
    required_skills: Optional[str] = Form("[]"),
    resume: UploadFile = File(...)
):
    try:
        content = await resume.read()
        extracted_text = extract_text(content, resume.filename)
        if not extracted_text:
            raise HTTPException(status_code=400, detail="Could not extract readable text from uploaded file.")
        
        try:
            parsed_skills = json.loads(required_skills)
            if not isinstance(parsed_skills, list):
                parsed_skills = [s.strip() for s in required_skills.split(",") if s.strip()]
        except Exception:
            parsed_skills = [s.strip() for s in required_skills.split(",") if s.strip()]

        result = analyze_ats_resume(
            resume_text=extracted_text,
            job_title=job_title,
            job_description=job_description,
            required_skills=parsed_skills
        )
        return {"success": True, "extracted_text_snippet": extracted_text[:400], "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resume/improve")
def improve_resume(payload: ResumeImproveRequest):
    try:
        result = generate_resume_improvements(
            resume_text=payload.resume_text,
            job_title=payload.job_title,
            job_description=payload.job_description
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mock-interview/generate-questions")
def get_questions(payload: GenerateQuestionsRequest):
    try:
        questions = generate_interview_questions(
            role=payload.role,
            technology=payload.technology,
            experience_level=payload.experience_level,
            count=payload.count
        )
        return {"success": True, "data": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mock-interview/evaluate-answer")
def evaluate_answer(payload: EvaluateAnswerRequest):
    try:
        evaluation = evaluate_interview_answer(
            question=payload.question,
            student_answer=payload.student_answer,
            expected_topics=payload.expected_topics,
            role=payload.role
        )
        return {"success": True, "data": evaluation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
