import os
import io
import re
from typing import List
import pymupdf as fitz
import docx
from langchain_text_splitters import RecursiveCharacterTextSplitter

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF."""
    text = ""
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return clean_text(text)

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    text = ""
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    text += cell.text + " "
                text += "\n"
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
    return clean_text(text)

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract text based on file extension."""
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_bytes)
    elif ext == ".txt":
        return clean_text(file_bytes.decode("utf-8", errors="ignore"))
    else:
        # Try generic string decoding
        return clean_text(file_bytes.decode("utf-8", errors="ignore"))

def clean_text(text: str) -> str:
    """Remove redundant spaces and special characters while preserving structure."""
    if not text:
        return ""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[\t ]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 80) -> List[str]:
    """Split text into semantic chunks using LangChain text splitter."""
    if not text:
        return []
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.split_text(text)
