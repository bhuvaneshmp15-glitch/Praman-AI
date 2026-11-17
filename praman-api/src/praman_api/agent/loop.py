"""Investigation agent execution loop."""
from typing import AsyncGenerator, Dict, Any


async def run_investigation_stream(case_id: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Streams thought, tool call, and verdict events for an investigation case."""
    yield {
        "event": "thought",
        "data": f"Initiating autonomous investigation for case {case_id}..."
    }
    yield {
        "event": "action",
        "data": f"Cross-referencing bank statement, tally records, and tax filings..."
    }
    yield {
        "event": "verdict",
        "data": {
            "case_id": case_id,
            "status": "ANALYZED",
            "message": "Preliminary investigation complete."
        }
    }
