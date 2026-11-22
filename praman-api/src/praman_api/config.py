from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    LOG_LEVEL: str = "INFO"
    
    # Storage & DuckDB paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    DUCKDB_PATH: str = ""
    RAW_CSVS_DIR: str = ""

    def __init__(self, **values):
        super().__init__(**values)
        if not self.DUCKDB_PATH:
            # 1. Monorepo root /praman-data
            p1 = self.BASE_DIR / "praman-data" / "praman.duckdb"
            # 2. Inside praman-api/praman-data (Vercel service root)
            p2 = Path(__file__).resolve().parent.parent.parent / "praman-data" / "praman.duckdb"
            if p1.exists():
                self.DUCKDB_PATH = str(p1)
            elif p2.exists():
                self.DUCKDB_PATH = str(p2)
            else:
                self.DUCKDB_PATH = str(p1)

        if not self.RAW_CSVS_DIR:
            r1 = self.BASE_DIR / "praman-data" / "raw_csvs"
            r2 = Path(__file__).resolve().parent.parent.parent / "praman-data" / "raw_csvs"
            if r1.exists():
                self.RAW_CSVS_DIR = str(r1)
            elif r2.exists():
                self.RAW_CSVS_DIR = str(r2)
            else:
                self.RAW_CSVS_DIR = str(r1)
    
    # LLM Settings (OpenAI-compatible multi-provider support with local fallback)
    GROQ_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    LLM_PROVIDER: str = "auto"
    LLM_MODEL: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )


settings = Settings()
