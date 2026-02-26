from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GOOGLE_CLOUD_PROJECT: str
    GOOGLE_CLOUD_LOCATION: str
    GOOGLE_GENAI_USE_VERTEXAI: bool
    GOOGLE_CLOUD_BUCKET_NAME: str
    REDIS_URL: str = ""  # Optional: leave empty for in-memory job store (local dev)
    SUPABASE_URL: str
    SUPABASE_SECRET_KEY: str
    AUTUMN_SECRET_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"  # Default for local dev
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",  # Ignore extra env vars e.g. AUTUMN_SECRET_KEY(PROD)
    )
settings = Settings()
