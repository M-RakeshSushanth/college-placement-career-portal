import os
import json
import re
from typing import Dict, Any, List
from .ats_analyzer import run_gemini_analysis, extract_skills_from_text
from .rag_engine import RAGVectorStore
from .document_processor import chunk_text

ACTION_VERBS = [
    "Engineered", "Architected", "Spearheaded", "Optimized", "Refactored",
    "Streamlined", "Deployed", "Implemented", "Automated", "Formulated"
]

def generate_resume_improvements(resume_text: str, job_title: str, job_description: str) -> Dict[str, Any]:
    """
    Generate tailored recommendations to optimize a student's resume for a specific job opening.
    """
    resume_skills = extract_skills_from_text(resume_text)
    job_skills = extract_skills_from_text(job_description)
    shared_skills = [s for s in job_skills if s in resume_skills]
    missing_skills = [s for s in job_skills if s not in resume_skills]

    # RAG indexing of resume
    chunks = chunk_text(resume_text, chunk_size=350, chunk_overlap=50)
    vector_store = RAGVectorStore(chunks)
    
    # Retrieve project or work chunks
    project_chunks = vector_store.search("project built developed implemented system database api", top_k=3)
    project_context = "\n---\n".join([c[0] for c in project_chunks])

    prompt = f"""
You are a career guidance expert and tech recruiter helping a student tailor their existing resume for the role: "{job_title}".
DO NOT fabricate fake degrees or false experience. Enhance the presentation of their genuine background.

Target Job Description:
{job_description}

Candidate's Current Resume Excerpt:
{resume_text[:3000]}

Candidate's Projects Excerpt:
{project_context}

Return strictly a JSON object formatted as:
{{
  "tailored_summary": "<A compelling 3-4 sentence professional summary customized for {job_title}>",
  "skills_to_highlight": [<string>, ... high priority skills already on resume to move to top],
  "skills_to_learn_or_mention": [<string>, ... relevant missing skills],
  "project_enhancements": [
    {{
      "current_or_topic": "<name or topic of project from candidate>",
      "suggested_bullet_points": [
        "<High-impact bullet point with action verb and quantifiable outcome>",
        "<Second high-impact bullet point>"
      ],
      "rationale": "<Why this connects to the {job_title} role>"
    }}
  ],
  "structural_tips": [<string>, ... formatting/layout tips to pass ATS],
  "keywords_to_embed": [<string>, ... buzzwords and domain keywords to weave into resume naturally]
}}
"""
    llm_result = run_gemini_analysis(prompt)
    if llm_result and "tailored_summary" in llm_result:
        return llm_result

    # Fallback recommendations if Gemini is offline
    tailored_summary = (
        f"Aspiring {job_title} with a solid foundation in {', '.join(shared_skills[:3]) or 'software engineering and computer science fundamentals'}. "
        f"Proven ability to build scalable web solutions and implement robust architectures. "
        f"Eager to leverage analytical skills and technical expertise to deliver immediate value to development teams."
    )

    project_enhancements = [
        {
            "current_or_topic": "Full-Stack / Core Engineering Project",
            "suggested_bullet_points": [
                f"Engineered responsive and modular architecture using {', '.join(shared_skills[:2]) or 'modern frameworks'}, improving user responsiveness by 30%.",
                f"Integrated secure RESTful APIs and optimized database query execution times by indexing high-frequency lookup fields.",
                f"Deployed continuous testing and version control workflows via Git, maintaining clean code quality and documentation."
            ],
            "rationale": f"Directly demonstrates hands-on implementation of technologies prioritized in the {job_title} specification."
        },
        {
            "current_or_topic": "Database & Backend Service",
            "suggested_bullet_points": [
                "Architected schema models and normalized database relations to support concurrent read/write operations without deadlocks.",
                "Streamlined API authentication and authorization mechanisms utilizing JWT and encrypted session tokens."
            ],
            "rationale": "Demonstrates security awareness and system design fundamentals expected by enterprise recruiters."
        }
    ]

    structural_tips = [
        "Place your 'Technical Skills' section immediately below the Contact and Summary section for rapid recruiter scanning.",
        "Use single-column formatting without nested graphic tables to ensure 100% parsing fidelity with legacy ATS parsers.",
        "Standardize date formats (e.g., 'Aug 2024 - Dec 2024') throughout your education and project timelines.",
        "Add hyperlinks directly to live project demos or GitHub repositories."
    ]

    return {
        "tailored_summary": tailored_summary,
        "skills_to_highlight": shared_skills if shared_skills else ["Problem Solving", "Data Structures", "System Design"],
        "skills_to_learn_or_mention": missing_skills[:6] if missing_skills else ["System Design", "Cloud Basics (AWS/GCP)", "Docker"],
        "project_enhancements": project_enhancements,
        "structural_tips": structural_tips,
        "keywords_to_embed": (job_skills[:8] if job_skills else ["Agile", "REST APIs", "Clean Architecture", "Unit Testing"])
    }
