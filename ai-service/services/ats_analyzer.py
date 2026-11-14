import os
import json
import re
from typing import List, Dict, Any
from .document_processor import chunk_text
from .rag_engine import RAGVectorStore, compute_overall_semantic_similarity

COMMON_TECH_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "c", "go", "rust",
    "react", "react.js", "angular", "vue", "vue.js", "node", "node.js", "express", "express.js",
    "django", "flask", "fastapi", "spring", "spring boot", "next.js", "html", "css", "tailwind",
    "mongodb", "sql", "mysql", "postgresql", "oracle", "sqlite", "redis", "cassandra",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd", "linux",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "scikit-learn", "data structures", "algorithms", "rest api", "graphql", "microservices"
]

def extract_skills_from_text(text: str) -> List[str]:
    """Extract known technical skills from text using regex boundary matching."""
    text_lower = text.lower()
    found = []
    for skill in COMMON_TECH_SKILLS:
        pattern = r'(?:\b|_)' + re.escape(skill) + r'(?:\b|_)'
        if re.search(pattern, text_lower):
            found.append(skill)
    return list(dict.fromkeys(found))

def run_gemini_analysis(prompt: str) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text)
        return data
    except Exception as e:
        print(f"Gemini API invocation error: {e}")
        return None

def analyze_ats_resume(resume_text: str, job_title: str, job_description: str, required_skills: List[str] = None) -> Dict[str, Any]:
    """
    RAG-driven ATS resume analysis:
    1. Chunk resume and index in FAISS.
    2. Extract semantic sections matching job requirements.
    3. Analyze skill gaps and qualification matches.
    4. Synthesize with Gemini (or fallback).
    """
    if not required_skills:
        required_skills = extract_skills_from_text(job_description)
    
    # Normalize required skills
    req_skills_clean = [s.strip().lower() for s in required_skills if s.strip()]
    if not req_skills_clean:
        req_skills_clean = extract_skills_from_text(job_description)

    # 1. Chunk resume and build FAISS vector store
    resume_chunks = chunk_text(resume_text, chunk_size=400, chunk_overlap=60)
    vector_store = RAGVectorStore(resume_chunks)

    # 2. Extract resume skills
    resume_skills = extract_skills_from_text(resume_text)

    # 3. Retrieve relevant resume snippets for key job requirements
    query = f"{job_title} {' '.join(req_skills_clean[:6])}"
    retrieved = vector_store.search(query, top_k=4)
    retrieved_context = "\n---\n".join([r[0] for r in retrieved])

    # 4. Compute Skill Match
    matching_skills = [s for s in req_skills_clean if s in resume_skills]
    missing_skills = [s for s in req_skills_clean if s not in resume_skills]
    additional_skills = [s for s in resume_skills if s not in req_skills_clean]

    skill_ratio = len(matching_skills) / max(len(req_skills_clean), 1)
    
    # Semantic text similarity
    semantic_sim = compute_overall_semantic_similarity(resume_text[:2000], job_description[:2000])

    # Check sections present in resume
    resume_lower = resume_text.lower()
    has_education = any(w in resume_lower for w in ["education", "b.tech", "b.e", "cgpa", "degree", "university", "college"])
    has_projects = any(w in resume_lower for w in ["project", "projects", "developed", "built", "implemented"])
    has_experience = any(w in resume_lower for w in ["experience", "internship", "work history", "employment", "intern"])
    has_certifications = any(w in resume_lower for w in ["certificat", "courses", "achievements", "awards"])

    section_score = (
        (0.25 if has_education else 0.1) +
        (0.35 if has_projects else 0.1) +
        (0.25 if has_experience else 0.1) +
        (0.15 if has_certifications else 0.05)
    )

    # Pre-calculated weighted score (Skills: 50%, Semantic Match: 30%, Completeness: 20%)
    weighted_score = round((skill_ratio * 50) + (semantic_sim * 30) + (section_score * 20))
    overall_score = max(15, min(98, weighted_score))

    # Try Gemini LLM for enhanced qualitative feedback
    prompt = f"""
You are an expert AI Applicant Tracking System (ATS) evaluator.
Analyze this candidate's resume against the Job Opportunity.

Job Title: {job_title}
Job Description:
{job_description}

Required Skills: {json.dumps(req_skills_clean)}

Retrieved Relevant Resume Excerpts via RAG:
{retrieved_context}

Resume Full Text:
{resume_text[:3500]}

Provide the output strictly in valid JSON with these keys:
{{
  "overall_score": <number between 0 and 100>,
  "skills_score": <number between 0 and 100>,
  "experience_score": <number between 0 and 100>,
  "education_score": <number between 0 and 100>,
  "matching_skills": [<string>, ...],
  "missing_skills": [<string>, ...],
  "strengths": [<string>, ... at least 3 points],
  "weaknesses": [<string>, ... at least 2 points],
  "actionable_recommendations": [<string>, ... at least 4 clear bullet points],
  "executive_summary": "<summary paragraph>"
}}
"""
    llm_result = run_gemini_analysis(prompt)

    if llm_result and "overall_score" in llm_result:
        # Normalize and merge
        return {
            "overallScore": int(llm_result.get("overall_score", overall_score)),
            "skillsScore": int(llm_result.get("skills_score", round(skill_ratio * 100))),
            "experienceScore": int(llm_result.get("experience_score", round(semantic_sim * 100))),
            "educationScore": int(llm_result.get("education_score", 85 if has_education else 50)),
            "matchingSkills": llm_result.get("matching_skills", matching_skills),
            "missingSkills": llm_result.get("missing_skills", missing_skills),
            "additionalSkills": additional_skills[:8],
            "strengths": llm_result.get("strengths", []),
            "weaknesses": llm_result.get("weaknesses", []),
            "recommendations": llm_result.get("actionable_recommendations", []),
            "summary": llm_result.get("executive_summary", ""),
            "retrievedChunksCount": len(retrieved)
        }

    # High quality fallback assessment when LLM is offline or no API key
    strengths = []
    if matching_skills:
        strengths.append(f"Strong overlap with core required skills: {', '.join(matching_skills[:5])}.")
    if has_projects:
        strengths.append("Contains project demonstrations relevant to modern software development.")
    if has_education:
        strengths.append("Structured academic background and educational qualifications are clearly articulated.")
    if has_experience:
        strengths.append("Professional exposure / internships mentioned to substantiate hands-on capabilities.")
    if not strengths:
        strengths.append("Clear foundational layout with potential for targeted customization.")

    weaknesses = []
    if missing_skills:
        weaknesses.append(f"Missing mentions of key requested skills: {', '.join(missing_skills[:5])}.")
    if not has_experience:
        weaknesses.append("Lack of dedicated work experience or internship section.")
    if not has_certifications:
        weaknesses.append("No technical certifications or specialized credentials found.")
    if overall_score < 60:
        weaknesses.append("Overall keyword density and project alignment with the job description are below optimal ATS threshold.")

    recommendations = []
    if missing_skills:
        recommendations.append(f"Incorporate missing core technologies ({', '.join(missing_skills[:4])}) into project bullet points or skills matrix.")
    recommendations.append("Quantify achievements in project descriptions with numerical metrics (e.g., 'improved performance by 25%', 'handled 500+ requests').")
    recommendations.append(f"Align section headings and keywords with the job title: '{job_title}'.")
    recommendations.append("Ensure your GitHub and portfolio links are active, clean, and highlighted near the top.")

    summary = (
        f"The candidate's resume shows a {overall_score}% contextual match for the {job_title} role. "
        f"They demonstrate competence in {len(matching_skills)} of {len(req_skills_clean)} target requirements, "
        f"with immediate opportunities to strengthen ATS ranking by addressing key gaps in {', '.join(missing_skills[:3]) or 'specialized tooling'}."
    )

    return {
        "overallScore": overall_score,
        "skillsScore": round(skill_ratio * 100),
        "experienceScore": round(semantic_sim * 100),
        "educationScore": 90 if has_education else 55,
        "matchingSkills": matching_skills,
        "missingSkills": missing_skills,
        "additionalSkills": additional_skills[:8],
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "summary": summary,
        "retrievedChunksCount": len(retrieved)
    }
