"""Praman Financial Copilot - DuckDB Seeder.
Loads generated CSVs into a local DuckDB analytical database with high-performance OLAP indexes.
"""
from pathlib import Path
import duckdb


def seed_database(data_dir: Path = None):
    data_dir = data_dir or Path(__file__).resolve().parent
    raw_dir = data_dir / "raw_csvs"
    db_path = data_dir / "praman.duckdb"

    print(f"Connecting to DuckDB database at: {db_path}")
    conn = duckdb.connect(str(db_path))

    csv_tables = {
        "bank_statement": raw_dir / "bank_statement.csv",
        "razorpay_upi": raw_dir / "razorpay_upi.csv",
        "tally_invoices": raw_dir / "tally_invoices.csv",
        "gstr2b_tax": raw_dir / "gstr2b_tax.csv",
        "cashflow_commitments": raw_dir / "cashflow_commitments.csv",
        "company_policies": raw_dir / "company_policies.csv",
    }

    for table_name, csv_path in csv_tables.items():
        if not csv_path.exists():
            print(f"Warning: {csv_path} not found. Skipping table '{table_name}'.")
            continue

        print(f"Loading '{table_name}' from {csv_path.name}...")
        # Use DuckDB's native high-performance auto CSV reader
        conn.execute(f"DROP TABLE IF EXISTS {table_name}")
        conn.execute(
            f"CREATE TABLE {table_name} AS SELECT * FROM read_csv_auto('{csv_path.as_posix()}', header=True)"
        )
        count = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
        print(f"  -> Created table '{table_name}' with {count:,} rows.")

    conn.close()
    print("DuckDB database seeded successfully!")


def main():
    seed_database()


if __name__ == "__main__":
    main()
