from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from praman_api.config import settings

app = FastAPI(
    title="Praman Financial Reconciliation & Protection Engine",
    version="0.1.0",
    description="Autonomous B2B financial reconciliation and cash-flow protection engine for Indian SMEs."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": "Praman API", "environment": settings.ENVIRONMENT}
