from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/citations", tags=["citations"])


@router.get("/{citation_id}")
def get_citation_evidence(citation_id: str) -> Dict[str, Any]:
    return {"citation_id": citation_id, "status": "AVAILABLE"}
