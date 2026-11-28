"""Praman Financial Copilot - Citation & Audit Trail Service.
Tracks deterministic evidence citations linking LLM claims directly to DuckDB rows and external API checks.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class Citation(BaseModel):
    citation_id: str
    source_table: str
    row_id: str
    field: str
    value: Any
    note: str = ""
    confidence: float = 1.0


class CitationTracker:
    """Session citation tracker linking investigation findings to exact ledger records."""

    def __init__(self):
        self._citations: Dict[str, Citation] = {}
        self._counter = 1

    def register(
        self,
        source_table: str,
        row_id: str,
        field: str,
        value: Any,
        note: str = "",
        citation_id: Optional[str] = None,
        confidence: float = 1.0
    ) -> Citation:
        if not citation_id:
            citation_id = f"CIT-{self._counter}"
            self._counter += 1

        cit = Citation(
            citation_id=citation_id,
            source_table=source_table,
            row_id=str(row_id),
            field=field,
            value=value,
            note=note,
            confidence=confidence
        )
        self._citations[citation_id] = cit
        return cit

    def get(self, citation_id: str) -> Optional[Citation]:
        return self._citations.get(citation_id)

    def all(self) -> List[Dict[str, Any]]:
        return [c.model_dump() for c in self._citations.values()]

    def clear(self):
        self._citations.clear()
        self._counter = 1


citation_service = CitationTracker()
