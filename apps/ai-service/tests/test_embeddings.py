import pytest
from app.services.embeddings import EmbeddingService

def test_embed_text():
    vec = EmbeddingService.embed_text("This is a sample text for embedding.")
    assert len(vec) == 384
    # Check if normalized (magnitude ~ 1.0)
    mag = sum(x*x for x in vec)
    assert abs(mag - 1.0) < 1e-5

def test_cosine_similarity():
    vec1 = EmbeddingService.embed_text("GST Compliance")
    vec2 = EmbeddingService.embed_text("GST Compliance")
    vec3 = EmbeddingService.embed_text("FSSAI Food Safety")
    
    sim_identical = EmbeddingService.cosine_similarity(vec1, vec2)
    sim_different = EmbeddingService.cosine_similarity(vec1, vec3)
    
    assert abs(sim_identical - 1.0) < 1e-5
    assert sim_different < sim_identical
