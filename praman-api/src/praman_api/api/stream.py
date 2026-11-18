"""Praman API - Real-Time Investigation SSE Stream Router."""
import json
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from praman_api.api.cases import get_case_or_404, CASE_STORE
from praman_api.agent.loop import run_investigation_sync

router = APIRouter(prefix="/cases", tags=["stream"])


@router.get("/{case_id}/stream")
def stream_case_investigation(case_id: str):
    """Server-Sent Events (SSE) endpoint that streams live steps of the AI investigator in real time."""
    case = get_case_or_404(case_id)
    case_key = case["case_id"]

    def event_generator():
        # 1. trigger_received event
        yield f"event: trigger_received\ndata: {json.dumps({'case_id': case_key, 'title': case['title'], 'status': 'INVESTIGATING', 'timestamp': datetime.now().isoformat()})}\n\n"

        # Stream through agent steps
        for event in run_investigation_sync(case_key, case_data=case):
            evt_type = event.get("type")

            if evt_type == "thought":
                yield f"event: agent_thought\ndata: {json.dumps({'thought': event.get('text')})}\n\n"

            elif evt_type == "action" and event.get("tool") == "duckdb_sql":
                yield f"event: sql_attempt\ndata: {json.dumps({'phase': 'EXECUTE', 'raw_sql': event.get('args', {}).get('query'), 'purpose': event.get('args', {}).get('purpose')})}\n\n"

            elif evt_type == "sql_retry":
                yield f"event: sql_attempt\ndata: {json.dumps({'phase': 'RETRY_HEALING', 'status': 'GUARDRAIL_INTERCEPTED', 'error': event.get('error'), 'healing_strategy': event.get('healing_strategy'), 'attempt': event.get('attempt')})}\n\n"

            elif evt_type == "observation" and event.get("tool") == "duckdb_sql":
                res = event.get("result", {})
                yield f"event: sql_attempt\ndata: {json.dumps({'phase': 'OBSERVATION', 'elapsed_ms': res.get('elapsed_ms'), 'row_count': res.get('row_count'), 'columns': res.get('columns')})}\n\n"

            elif evt_type == "observation" and event.get("tool") == "verify_ifsc_live":
                yield f"event: ifsc_verified\ndata: {json.dumps(event.get('result', {}))}\n\n"

            elif evt_type == "observation" and event.get("tool") == "verify_gst_state_pincode":
                yield f"event: pincode_verified\ndata: {json.dumps(event.get('result', {}))}\n\n"

            elif evt_type == "observation" and event.get("tool") == "check_vendor_email_breach":
                yield f"event: breach_checked\ndata: {json.dumps(event.get('result', {}))}\n\n"

            elif evt_type == "observation" and event.get("tool") == "fetch_live_usd_inr":
                yield f"event: fx_retrieved\ndata: {json.dumps(event.get('result', {}))}\n\n"

            elif evt_type == "finding":
                yield f"event: finding_recorded\ndata: {json.dumps(event.get('data', {}))}\n\n"

            elif evt_type == "observation" and event.get("tool") == "calculate_emi_runway":
                yield f"event: runway_calculated\ndata: {json.dumps(event.get('result', {}))}\n\n"

            elif evt_type == "verdict":
                # Update case repository state to BRIEF_READY
                verdict_data = event.get("data", {})
                if case_key in CASE_STORE:
                    CASE_STORE[case_key]["status"] = "BRIEF_READY"
                    CASE_STORE[case_key]["brief"] = verdict_data
                    CASE_STORE[case_key]["citations"] = verdict_data.get("citations", [])
                    CASE_STORE[case_key]["actions"] = verdict_data.get("actions", [])

                yield f"event: brief_completed\ndata: {json.dumps(verdict_data)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )
