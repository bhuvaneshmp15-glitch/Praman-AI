from fastapi import APIRouter
from typing import List
from praman_api.models import DiscrepancyCase

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("", response_model=List[DiscrepancyCase])
def list_discrepancy_cases():
    return []
