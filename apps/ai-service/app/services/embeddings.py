import numpy as np
from typing import List
from sklearn.feature_extraction.text import HashingVectorizer

class EmbeddingService:
    """Generates deterministic vector embeddings for text chunks using HashingVectorizer.
    Maps text to a fixed 384-dimensional space, providing real cosine similarity based on word overlap.
    """
    
    DIMENSION = 384
    
    # Initialize a HashingVectorizer with L2 normalization to output unit vectors
    _vectorizer = HashingVectorizer(n_features=DIMENSION, norm='l2', alternate_sign=False)

    @classmethod
    def embed_text(cls, text: str) -> List[float]:
        """Generates a normalized 384-dimensional embedding vector for text."""
        if not text or not text.strip():
            return [0.0] * cls.DIMENSION
            
        # The vectorizer returns a sparse matrix. We convert to dense and return the list of floats.
        sparse_matrix = cls._vectorizer.transform([text])
        dense_vector = sparse_matrix.toarray()[0]
        
        return dense_vector.tolist()

    @classmethod
    def cosine_similarity(cls, vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two unit vectors."""
        if len(vec_a) != len(vec_b) or not vec_a:
            return 0.0
        
        # Since vectors are L2 normalized, cosine similarity is just the dot product
        return float(np.dot(vec_a, vec_b))
