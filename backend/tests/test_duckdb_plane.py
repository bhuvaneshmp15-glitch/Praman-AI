"""Unit and integration tests for DuckDBPlane and semantic guardrails."""
import pytest
from praman_api.engine.duckdb_plane import DuckDBPlane, SqlSemanticError


@pytest.fixture(scope="module")
def plane():
    p = DuckDBPlane()
    # Warm up connection and catalog
    p.execute_query("SELECT 1")
    yield p
    p.close()


def test_guardrail_sum_running_balance(plane):
    """Test that Anti-Bug Guardrail 1 catches SUM(running_balance)."""
    sql_bad = "SELECT SUM(running_balance) FROM bank_statement;"
    with pytest.raises(SqlSemanticError) as exc_info:
        plane.execute_query(sql_bad)
    assert "CRITICAL FINANCIAL BUG: Never SUM(running_balance) on bank_statement" in str(exc_info.value)

    # Test alias variation
    sql_bad_alias = "SELECT b.ifsc_code, sum(b.running_balance) FROM bank_statement b GROUP BY b.ifsc_code;"
    with pytest.raises(SqlSemanticError) as exc_info:
        plane.execute_query(sql_bad_alias)
    assert "CRITICAL FINANCIAL BUG: Never SUM(running_balance) on bank_statement" in str(exc_info.value)


def test_guardrail_sum_coalesce_running_balance(plane):
    """Test that Anti-Bug Guardrail 1 catches SUM(COALESCE(running_balance, 0)) via sqlglot AST."""
    sql = "SELECT SUM(COALESCE(running_balance, 0)) FROM bank_statement;"
    with pytest.raises(SqlSemanticError) as exc_info:
        plane.execute_query(sql)
    assert "Blocked: cannot SUM running_balance" in str(exc_info.value)


def test_guardrail_sum_cte_alias_running_balance(plane):
    """Test that Anti-Bug Guardrail 1 catches SUM(rb) aliased through CTE via sqlglot AST."""
    sql = "WITH cte AS (SELECT running_balance AS rb FROM bank_statement) SELECT SUM(rb) FROM cte;"
    with pytest.raises(SqlSemanticError) as exc_info:
        plane.execute_query(sql)
    assert "Blocked: cannot SUM running_balance" in str(exc_info.value)


def test_guardrail_cartesian_fanout_threshold(plane):
    """Test that Anti-Bug Guardrail 2 blocks loose jw_sim thresholds < 0.90."""
    sql_loose = "SELECT * FROM bank_statement WHERE jw_sim(narration, 'Sri Balaji') >= 0.75;"
    with pytest.raises(SqlSemanticError) as exc_info:
        plane.execute_query(sql_loose)
    assert "CARTESIAN FANOUT DETECTED" in str(exc_info.value)


def test_guardrail_mutation_prevention(plane):
    """Test that DML / DDL operations are prohibited."""
    sql_drop = "DROP TABLE bank_statement;"
    with pytest.raises(SqlSemanticError) as exc_info:
        plane.execute_query(sql_drop)
    assert "READ-ONLY ERROR" in str(exc_info.value)


def test_udf_extract_utr_in_duckdb(plane):
    """Test extract_utr execution inside SQL queries."""
    res = plane.execute_query(
        "SELECT row_id, extract_utr(narration) as utr FROM bank_statement WHERE extract_utr(narration) != '' LIMIT 5"
    )
    assert res["row_count"] == 5
    assert len(res["rows"]) == 5
    for row in res["rows"]:
        utr = row[1]
        assert len(utr) == 12
        assert utr.isdigit()
    assert res["elapsed_ms"] < 200.0


def test_udf_jw_sim_reconciliation_in_duckdb(plane):
    """Test high-precision jw_sim >= 0.92 filtering Sri Balaji amidst decoys."""
    # Sri Balaji Enterprises with IFSC filter executes in ~15-25ms
    sql = """
    WITH filtered AS (
        SELECT row_id, narration FROM bank_statement WHERE ifsc_code = 'KVBL0001245'
    )
    SELECT row_id, narration, jw_sim(narration, 'Sri Balaji Enterprises') AS sim
    FROM filtered
    WHERE jw_sim(narration, 'Sri Balaji Enterprises') >= 0.92
    ORDER BY sim DESC
    """
    res = plane.execute_query(sql)
    assert res["row_count"] >= 1
    # Check that SRI BALJI ENT matched with high similarity (>0.95)
    matched_narrations = [r[1] for r in res["rows"]]
    assert any("SRI BALJI ENT" in n for n in matched_narrations)
    assert res["elapsed_ms"] < 200.0  # Under sub-second requirement


def test_latest_running_balance_query(plane):
    """Test correct financial query pattern for latest running balance."""
    sql = """
    WITH latest_bal AS (
        SELECT running_balance 
        FROM bank_statement 
        ORDER BY txn_date DESC, row_id DESC 
        LIMIT 1
    )
    SELECT running_balance FROM latest_bal;
    """
    res = plane.execute_query(sql)
    assert res["row_count"] == 1
    assert res["rows"][0][0] == 312450.00
    assert res["elapsed_ms"] < 200.0
