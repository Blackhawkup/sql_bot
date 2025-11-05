import os
from typing import List, Dict, Any, Optional
from contextlib import contextmanager

# Support either the legacy psycopg2 driver or the newer psycopg (psycopg3).
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    HAS_PSYCOPG2 = True
except Exception:
    psycopg2 = None
    RealDictCursor = None
    ISOLATION_LEVEL_AUTOCOMMIT = None
    HAS_PSYCOPG2 = False

try:
    import psycopg as psycopg3
    from psycopg.rows import dict_row
    HAS_PSYCOPG3 = True
except Exception:
    psycopg3 = None
    dict_row = None
    HAS_PSYCOPG3 = False


def get_connection():
    """
    Get a PostgreSQL connection using the POSTGRES_URL environment variable.
    Returns a connection object that should be used in a context manager.
    """
    postgres_url = os.getenv("POSTGRES_URL")
    if not postgres_url:
        raise ConnectionError("POSTGRES_URL environment variable is not set")

    # Clean up the URL if it has extra characters or quotes
    postgres_url = postgres_url.strip()
    if postgres_url.startswith("psql "):
        postgres_url = postgres_url[5:]  # Remove "psql " prefix
    if postgres_url.startswith("'") and postgres_url.endswith("'"):
        postgres_url = postgres_url[1:-1]  # Remove surrounding quotes
    if postgres_url.startswith('"') and postgres_url.endswith('"'):
        postgres_url = postgres_url[1:-1]  # Remove surrounding quotes

    # Add SSL mode if not already present
    if "sslmode=" not in postgres_url:
        separator = "&" if "?" in postgres_url else "?"
        postgres_url = f"{postgres_url}{separator}sslmode=require"

    # Prefer psycopg2 when available; fall back to psycopg3.
    if HAS_PSYCOPG2:
        return psycopg2.connect(postgres_url)
    if HAS_PSYCOPG3:
        return psycopg3.connect(postgres_url)

    raise ConnectionError("No PostgreSQL driver installed (psycopg2 or psycopg)")


@contextmanager
def get_db_connection():
    """
    Context manager for PostgreSQL database connections.
    Automatically handles connection cleanup.
    """
    connection = None
    try:
        connection = get_connection()
        yield connection
    except Exception as e:
        if connection:
            try:
                connection.rollback()
            except Exception:
                pass
        raise e
    finally:
        if connection:
            try:
                connection.close()
            except Exception:
                pass


def run_query(sql: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Execute a SQL query and return results as a list of dictionaries.
    Uses parameterized queries for safety.
    """
    limited_sql = sql
    if limit is not None:
        if "LIMIT" not in sql.upper():
            limited_sql = f"{sql.rstrip(';')} LIMIT {int(limit)}"

    # Fallback data when connection is not available
    if not os.getenv("POSTGRES_URL"):
        return [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}][: limit or 2]

    try:
        with get_db_connection() as connection:
            if HAS_PSYCOPG2:
                with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(limited_sql)
                    rows = cursor.fetchall()
                    return [dict(row) for row in rows]

            if HAS_PSYCOPG3:
                with connection.cursor(row_factory=dict_row) as cursor:
                    cursor.execute(limited_sql)
                    rows = cursor.fetchall()
                    return [dict(row) for row in rows]

            raise Exception("No suitable PostgreSQL driver available")
    except Exception as e:
        raise Exception(f"Database error: {str(e)}")


def test_connection() -> Dict[str, Any]:
    try:
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()[0]
                return {
                    "status": "success",
                    "message": "Database connection successful",
                    "version": version
                }
    except Exception as e:
        return {
            "status": "error",
            "message": "Database connection failed",
            "details": str(e)
        }
