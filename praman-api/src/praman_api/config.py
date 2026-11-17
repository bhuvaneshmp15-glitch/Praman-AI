from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"
    
    # Storage & DuckDB paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    DUCKDB_PATH: str = str(BASE_DIR / "praman-data" / "praman.duckdb")
    RAW_CSVS_DIR: str = str(BASE_DIR / "praman-data" / "raw_csvs")
    
    # LLM Settings
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
