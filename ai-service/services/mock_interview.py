import os
import json
from typing import Dict, Any, List
from .ats_analyzer import run_gemini_analysis

DEFAULT_QUESTION_BANK = {
    "software developer": [
        {
            "id": 1,
            "category": "Technical",
            "question": "Explain the difference between process and thread, and how concurrency is achieved in modern operating systems.",
            "expected_topics": ["memory space", "context switching", "overhead", "CPU scheduling"],
            "difficulty": "Medium"
        },
        {
            "id": 2,
            "category": "System Design & Architecture",
            "question": "How would you design a scalable rate limiter for an API service receiving millions of requests per minute?",
            "expected_topics": ["Token Bucket", "Leaky Bucket", "Redis", "Distributed Locks", "HTTP 429"],
            "difficulty": "Hard"
        },
        {
            "id": 3,
            "category": "Database",
            "question": "When would you choose a NoSQL database like MongoDB over a relational database like PostgreSQL?",
            "expected_topics": ["ACID vs BASE", "schema flexibility", "horizontal scaling", "query complexity"],
            "difficulty": "Medium"
        },
        {
            "id": 4,
            "category": "Behavioral / HR",
            "question": "Tell me about a time you faced a difficult technical bug near a deadline. How did you diagnose and resolve it?",
            "expected_topics": ["STAR method", "root cause analysis", "debugging steps", "team communication"],
            "difficulty": "Medium"
        }
    ],
    "full stack developer": [
        {
            "id": 1,
            "category": "Frontend",
            "question": "How does React's Virtual DOM work, and what role do keys play in list reconciliation?",
            "expected_topics": ["diffing algorithm", "fiber", "re-rendering", "component identity"],
            "difficulty": "Medium"
        },
        {
            "id": 2,
            "category": "Backend & Security",
            "question": "Explain how JWT authentication works and what measures you take to prevent XSS and CSRF attacks when storing tokens.",
            "expected_topics": ["header/payload/signature", "httpOnly cookies", "CORS", "token expiration"],
            "difficulty": "Medium"
        },
        {
            "id": 3,
            "category": "Performance",
            "question": "What techniques would you implement to optimize the load time and responsiveness of a web application?",
            "expected_topics": ["code splitting", "lazy loading", "caching", "bundle optimization", "CDN"],
            "difficulty": "Medium"
        }
    ],
    "data science & ai": [
        {
            "id": 1,
            "category": "Machine Learning",
            "question": "Explain the bias-variance tradeoff and how techniques like regularization help prevent overfitting.",
            "expected_topics": ["underfitting", "overfitting", "L1 Lasso", "L2 Ridge", "cross-validation"],
            "difficulty": "Medium"
        },
        {
            "id": 2,
            "category": "RAG & LLMs",
            "question": "What is Retrieval-Augmented Generation (RAG) and how does vector chunking and semantic similarity improve LLM accuracy?",
            "expected_topics": ["hallucination reduction", "vector database", "FAISS", "embeddings", "context window"],
            "difficulty": "Hard"
        }
    ]
}

def generate_interview_questions(role: str, technology: str = "", experience_level: str = "Entry Level / Fresher", count: int = 5) -> List[Dict[str, Any]]:
    """Generate tailored technical and behavioral interview questions."""
    prompt = f"""
You are an expert technical interviewer conducting a mock interview for campus placements.
Role: {role}
Target Technology / Domain: {technology or 'General Core Computer Science'}
Candidate Level: {experience_level}
Number of Questions: {count}

Generate a balanced mix of core technical, system/coding concepts, and 1 behavioral question.
Return strictly a JSON array of question objects:
[
  {{
    "id": 1,
    "category": "<Technical | Database | System Design | Behavioral>",
    "question": "<Precise, realistic interview question>",
    "expected_topics": ["<key topic 1>", "<key topic 2>", "<key topic 3>"],
    "difficulty": "<Easy | Medium | Hard>"
  }}
]
"""
    llm_result = run_gemini_analysis(prompt)
    if isinstance(llm_result, list) and len(llm_result) > 0:
        return llm_result

    # Fallback from question bank
    role_key = "software developer"
    for k in DEFAULT_QUESTION_BANK:
        if k in role.lower():
            role_key = k
            break
    
    questions = list(DEFAULT_QUESTION_BANK.get(role_key, DEFAULT_QUESTION_BANK["software developer"]))
    if technology:
        questions.append({
            "id": len(questions) + 1,
            "category": "Technology Specific",
            "question": f"What are the core architectural principles and best practices when building systems with {technology}?",
            "expected_topics": [technology, "best practices", "scalability", "testing"],
            "difficulty": "Medium"
        })
    return questions[:count]

def evaluate_interview_answer(question: str, student_answer: str, expected_topics: List[str] = None, role: str = "") -> Dict[str, Any]:
    """Evaluate student's verbal or written answer to an interview question."""
    if not student_answer or len(student_answer.strip()) < 10:
        return {
            "score": 2,
            "maxScore": 10,
            "technicalCorrectness": 2,
            "clarityAndStructure": 2,
            "completeness": 1,
            "strengths": ["Attempted to provide an answer."],
            "improvements": ["Answer is too brief. Provide detailed explanations, real examples, or code context."],
            "modelAnswer": "A comprehensive answer should define the core concepts, address practical trade-offs, and cite real-world usage."
        }

    prompt = f"""
You are an experienced technical hiring manager evaluating a campus placement candidate's response.
Role: {role or 'Software Engineer'}
Question: {question}
Expected topics / concepts: {json.dumps(expected_topics or [])}
Candidate's Answer:
\"\"\"{student_answer}\"\"\"

Evaluate the answer rigorously yet constructively.
Return strictly a JSON object:
{{
  "score": <overall score from 1 to 10>,
  "technicalCorrectness": <score 1 to 10>,
  "clarityAndStructure": <score 1 to 10>,
  "completeness": <score 1 to 10>,
  "topicsCovered": [<string>, ...],
  "topicsMissed": [<string>, ...],
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "modelAnswer": "<An exemplary concise 3-4 sentence response that an ideal candidate would give>"
}}
"""
    llm_result = run_gemini_analysis(prompt)
    if llm_result and "score" in llm_result:
        llm_result["maxScore"] = 10
        return llm_result

    # Heuristic fallback evaluation
    answer_words = student_answer.lower()
    covered = []
    missed = []
    if expected_topics:
        for t in expected_topics:
            if t.lower() in answer_words:
                covered.append(t)
            else:
                missed.append(t)
    
    word_count = len(student_answer.split())
    depth_score = min(4, word_count // 25)  # up to 4 pts
    coverage_score = (len(covered) / max(len(expected_topics or [1]), 1)) * 4  # up to 4 pts
    structure_score = 2 if "." in student_answer and len(student_answer) > 80 else 1

    total_score = min(10, max(3, round(depth_score + coverage_score + structure_score)))

    strengths = []
    if covered:
        strengths.append(f"Successfully highlighted key concepts: {', '.join(covered)}.")
    if word_count > 60:
        strengths.append("Provided detailed explanation with sufficient technical context.")
    else:
        strengths.append("Good straightforward start to articulating the response.")

    improvements = []
    if missed:
        improvements.append(f"Consider addressing additional core points such as: {', '.join(missed[:3])}.")
    if word_count < 50:
        improvements.append("Elaborate further with real-world project scenarios, design patterns, or metrics.")
    improvements.append("Structure answers using the STAR format (Situation, Task, Action, Result) for behavioral or experiential questions.")

    return {
        "score": total_score,
        "maxScore": 10,
        "technicalCorrectness": min(10, total_score),
        "clarityAndStructure": min(10, total_score + 1 if structure_score >= 2 else total_score),
        "completeness": min(10, round(coverage_score * 2.5)),
        "topicsCovered": covered,
        "topicsMissed": missed,
        "strengths": strengths,
        "improvements": improvements,
        "modelAnswer": f"To address '{question}', one should define the core principles, articulate the underlying mechanics, evaluate architectural trade-offs, and mention practical considerations like performance and error handling."
    }
