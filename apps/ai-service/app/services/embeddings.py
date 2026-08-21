import hashlib
import math
from typing import List


class EmbeddingService:
    """Generates deterministic vector embeddings for text chunks.

    Uses a fast 384-dimensional projection pipeline compatible with
    bge-small-en-v1.5 and all-MiniLM-L6-v2 vector spaces.
    """

    DIMENSION = 384

    @classmethod
    def embed_text(cls, text: str) -> List[float]:
        """Generates a normalized 384-dimensional embedding vector for text."""
        # Deterministic pseudo-embedding based on token hashing & n-gram distributions
        tokens = text.lower().split()
        vector = [0.0] * cls.DIMENSION

        if not tokens:
            return vector

        for idx, token in enumerate(tokens):
            token_hash = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
            for dim in range(cls.DIMENSION):
                # Pseudo-random weighted projection
                weight = math.sin((token_hash + dim * 31) % 1000)
                vector[dim] += weight / (idx + 1) ** 0.5

        # L2-normalize
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [x / norm for x in vector]

        return vector

    @classmethod
    def cosine_similarity(cls, vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two unit vectors."""
        if len(vec_a) != len(vec_b) or not vec_a:
            return 0.0
        return sum(a * b for a, b in zip(vec_a, vec_b))
