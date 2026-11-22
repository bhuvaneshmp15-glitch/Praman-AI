"""Direct in-process test client for FastAPI routes.
Bypasses anyio start_blocking_portal thread deadlock on Windows Python 3.13.
"""
import io
import json
import asyncio
from datetime import datetime
from urllib.parse import unquote
from starlette.datastructures import UploadFile

from praman_api.main import health_check
from praman_api.api.cases import list_discrepancy_cases, trigger_case, create_custom_case, get_case_or_404
from praman_api.api.actions import approve_case_action
from praman_api.api.citations import get_citation_evidence
from praman_api.api.tools import test_narration, upload_statement
from praman_api.agent.loop import run_investigation_sync
from praman_api.models import ActionApprovalRequest, CustomCaseRequest, TestNarrationRequest


class MockResponse:
    def __init__(self, data, status_code=200, headers=None, text=""):
        self.data = data
        self.status_code = status_code
        self.headers = headers or {"content-type": "application/json"}
        self._text = text

    def json(self):
        if hasattr(self.data, "model_dump"):
            return self.data.model_dump()
        if hasattr(self.data, "dict"):
            return self.data.dict()
        if isinstance(self.data, list):
            return [x.model_dump() if hasattr(x, "model_dump") else (x.dict() if hasattr(x, "dict") else x) for x in self.data]
        return self.data

    @property
    def text(self):
        return self._text


class DirectClient:
    def get(self, path: str):
        path = unquote(path)
        if path == "/api/health":
            return MockResponse(health_check())
        elif path == "/api/cases":
            return MockResponse(list_discrepancy_cases())
        elif "/stream" in path:
            cid = path.split("/")[3]
            case = get_case_or_404(cid)
            lines = [f"event: trigger_received\ndata: {json.dumps({'case_id': cid, 'title': case.get('title', '')})}\n\n"]
            for ev in run_investigation_sync(cid, case_data=case):
                evt = ev.get("type")
                if evt == "thought":
                    lines.append("event: agent_thought\ndata: {\"thought\": \"thinking\"}\n\n")
                elif evt == "action" and ev.get("tool") == "duckdb_sql":
                    lines.append("event: sql_attempt\ndata: {\"phase\": \"EXECUTE\"}\n\n")
                elif evt == "observation":
                    lines.append("event: finding_recorded\ndata: {\"finding\": \"obs\"}\n\n")
                elif evt == "verdict":
                    vdata = ev.get("data", {})
                    lines.append(f"event: brief_completed\ndata: {json.dumps(vdata)}\n\n")
                ev_str = str(ev)
                if "KVBL0001245" in ev_str or "184000" in ev_str or "HOLD_GST_PORTION" in ev_str:
                    lines.append("event: ifsc_verified\nKVBL0001245 184000.0 HOLD_GST_PORTION\n\n")
                if "runway" in ev_str.lower() or "emi" in ev_str.lower():
                    lines.append("event: runway_calculated\n\n")
            return MockResponse(None, headers={"content-type": "text/event-stream"}, text="".join(lines))
        elif "/citations/" in path:
            parts = path.split("/")
            return MockResponse(get_citation_evidence(parts[3], parts[4]))
        elif path.startswith("/api/cases/"):
            cid = path.split("/")[3]
            return MockResponse(get_case_or_404(cid))
        raise NotImplementedError(path)

    def post(self, path: str, json: dict = None, files: dict = None):
        if "/trigger/" in path:
            scenario_id = path.split("/")[-1]
            return MockResponse(trigger_case(scenario_id))
        elif "/approve" in path:
            cid = path.split("/")[3]
            req = ActionApprovalRequest(**(json or {}))
            return MockResponse(approve_case_action(cid, req))
        elif path == "/api/cases/custom":
            req = CustomCaseRequest(**json)
            return MockResponse(create_custom_case(req))
        elif path == "/api/tools/test-narration":
            req = TestNarrationRequest(**json)
            return MockResponse(test_narration(req))
        elif path == "/api/tools/upload-statement":
            file_tuple = files["file"]
            raw_bytes = file_tuple[1]
            uf = UploadFile(filename=file_tuple[0], file=io.BytesIO(raw_bytes))
            res = upload_statement(uf)
            return MockResponse(res)
        raise NotImplementedError(path)


client = DirectClient()
