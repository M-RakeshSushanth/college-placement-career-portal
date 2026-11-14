import numpy as np
from typing import List, Tuple
import faiss

# Lazy load sentence transformer to keep startup fast
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Lightweight and fast HuggingFace SentenceTransformer
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Warning: SentenceTransformer load failed: {e}")
            _model = False
    return _model

class RAGVectorStore:
    def __init__(self, chunks: List[str]):
        self.chunks = chunks
        self.index = None
        self.dimension = 384  # Dimension for all-MiniLM-L6-v2
        self.build_index()

    def build_index(self):
        if not self.chunks:
            return
        model = get_embedding_model()
        if model:
            try:
                embeddings = model.encode(self.chunks, convert_to_numpy=True, normalize_embeddings=True)
                self.dimension = embeddings.shape[1]
                self.index = faiss.IndexFlatIP(self.dimension)
                self.index.add(embeddings.astype(np.float32))
            except Exception as e:
                print(f"Error building FAISS index: {e}")
                self.index = None
        else:
            self.index = None

    def search(self, query: str, top_k: int = 4) -> List[Tuple[str, float]]:
        """Search top_k relevant chunks with similarity score."""
        if not self.chunks:
            return []
        model = get_embedding_model()
        if model and self.index is not None:
            try:
                query_vec = model.encode([query], convert_to_numpy=True, normalize_embeddings=True).astype(np.float32)
                top_k = min(top_k, len(self.chunks))
                scores, indices = self.index.search(query_vec, top_k)
                results = []
                for score, idx in zip(scores[0], indices[0]):
                    if idx >= 0 and idx < len(self.chunks):
                        results.append((self.chunks[idx], float(score)))
                return results
            except Exception as e:
                print(f"FAISS search failed, falling back to keyword search: {e}")

        # Fallback keyword matching
        words = set(query.lower().split())
        scored = []
        for chunk in self.chunks:
            chunk_words = set(chunk.lower().split())
            intersection = len(words.intersection(chunk_words))
            score = intersection / (len(words) + 1e-5)
            scored.append((chunk, float(score)))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

def compute_overall_semantic_similarity(text1: str, text2: str) -> float:
    """Compute cosine similarity between two texts."""
    model = get_embedding_model()
    if model:
        try:
            embeddings = model.encode([text1, text2], convert_to_numpy=True, normalize_embeddings=True)
            similarity = float(np.dot(embeddings[0], embeddings[1]))
            # Rescale from [-1, 1] to [0, 1]
            return max(0.0, min(1.0, (similarity + 1) / 2))
        except Exception as e:
            print(f"Cosine similarity error: {e}")
    # Fallback word overlap Jaccard
    w1 = set(text1.lower().split())
    w2 = set(text2.lower().split())
    if not w1 or not w2:
        return 0.0
    return len(w1.intersection(w2)) / len(w1.union(w2))
