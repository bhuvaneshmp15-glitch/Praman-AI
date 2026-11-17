from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/actions", tags=["actions"])


@router.post("/hold")
def place_payout_hold(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {"status": "SUCCESS", "action": "HOLD", "payload": payload}
