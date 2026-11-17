"""DuckDB OLAP Execution Plane for Praman."""
import duckdb
from pathlib import Path
from praman_api.config import settings
from praman_api.engine.udfs import jaro_winkler_similarity, is_valid_gstin


class DuckDBPlane:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.DUCKDB_PATH
        self.conn = None

    def connect(self):
        if not self.conn:
            self.conn = duckdb.connect(self.db_path)
            self._register_udfs()
        return self.conn

    def _register_udfs(self):
        try:
            self.conn.create_function("jaro_winkler", jaro_winkler_similarity)
            self.conn.create_function("is_valid_gstin", is_valid_gstin)
        except Exception:
            pass

    def execute_query(self, query: str):
        conn = self.connect()
        return conn.execute(query).fetchdf()

    def close(self):
        if self.conn:
            self.conn.close()
            self.conn = None


db_plane = DuckDBPlane()
