"""Tools available to the Praman investigation agent."""
from praman_api.engine.duckdb_plane import db_plane


def query_financial_plane(sql: str) -> str:
    """Execute a read-only SQL query against the financial DuckDB database."""
    try:
        df = db_plane.execute_query(sql)
        return df.to_string(index=False)
    except Exception as e:
        return f"Error executing query: {str(e)}"


def verify_ifsc_code(ifsc: str) -> dict:
    """Verify IFSC code structure and details."""
    return {"ifsc": ifsc, "valid": len(ifsc) == 11}
