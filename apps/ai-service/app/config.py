from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Saarthi AI Service"
    app_version: str = "0.1.0"
    debug: bool = False
    database_url: str = ""
    redis_url: str = "redis://localhost:6379"
    internal_service_token: str = "dev-internal-token-change-in-prod"
    fastapi_host: str = "0.0.0.0"
    fastapi_port: int = 8000

    # Supabase & pgvector
    next_public_supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_url: str = ""

    # Cloudflare R2
    cloudflare_account_id: Optional[str] = None
    r2_account_id: Optional[str] = None
    r2_access_key_id: Optional[str] = None
    r2_secret_access_key: Optional[str] = None
    r2_bucket_name: str = "saarthi-documents"

    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_model: str = "qwen/qwen3-30b-a3b-instruct-2507"
    openrouter_vision_model: str = "qwen/qwen3-vl-30b-a3b-instruct"

    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
