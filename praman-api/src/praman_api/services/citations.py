"""Citation tracker linking verdicts to exact tabular evidence."""
from typing import Dict, Any, List


class CitationTracker:
    @staticmethod
    def build_citation(table: str, row_id: str, field: str, value: Any, note: str = "") -> Dict[str, Any]:
        return {
            "source_table": table,
            "row_id": str(row_id),
            "field": field,
            "value": str(value),
            "note": note
        }
