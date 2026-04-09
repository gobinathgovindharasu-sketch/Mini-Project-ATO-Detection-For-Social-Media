"""
Application configuration — loads from environment variables.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "ATO Detection"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./ato_detection.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Fernet encryption key for social media passwords
    FERNET_KEY: str = "change-me-generate-with-Fernet.generate_key"

    # Webhook URL for high-risk alerts
    WEBHOOK_URL: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # ML
    MODEL_PATH: str = "ml_models/ato_model.joblib"
    RISK_THRESHOLD: float = 0.8

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
