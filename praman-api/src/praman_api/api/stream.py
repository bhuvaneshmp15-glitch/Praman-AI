from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import json
from praman_api.agent.loop import run_investigation_stream

router = APIRouter(prefix="/stream", tags=["stream"])


@router.get("/investigate/{case_id}")
async def stream_investigation(case_id: str):
    async def event_generator():
        async for event in run_investigation_stream(case_id):
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
