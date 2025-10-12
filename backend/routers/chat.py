from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

from services.azure_openai_service import AzureOpenAIService
from database.postgres_connection import run_query, test_connection
from utils.jwt_handler import jwt_required
from models import increment_column_usage

router = APIRouter()


class GenerateSqlRequest(BaseModel):
    prompt: str = Field(...)
    userId: Optional[str] = None
    schema: Optional[str] = None


class GenerateSqlResponse(BaseModel):
    status: str
    sql: str
    preview: List[Dict[str, Any]]


class RunQueryRequest(BaseModel):
    sql: str
    limit: Optional[int] = None


class RunQueryResponse(BaseModel):
    status: str
    rows: List[Dict[str, Any]]


@router.post("/generate-sql", response_model=GenerateSqlResponse)
async def generate_sql(body: GenerateSqlRequest, user=Depends(jwt_required)):
    try:
        ai = AzureOpenAIService()
        sql = await ai.generate_sql(body.prompt, body.schema)
        preview = run_query(sql, limit=5)
        # naive column extraction for usage logging
        cols = []
        try:
            select_part = sql.lower().split("select", 1)[1].split("from", 1)[0]
            cols = [c.strip().split(" as ")[0] for c in select_part.split(',') if c.strip() and c.strip() != '*']
        except Exception:
            cols = []
        increment_column_usage(user.get("sub", "unknown"), cols)
        return {"status": "ok", "sql": sql, "preview": preview}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-query", response_model=RunQueryResponse)
def run_query_endpoint(body: RunQueryRequest, user=Depends(jwt_required)):
    try:
        rows = run_query(body.sql, limit=body.limit)
        return {"status": "ok", "rows": rows}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retry-query")
def retry_query():
    return {"status": "ok", "sql": "SELECT 2;"}


@router.get("/test-db")
def test_db():
    """
    Test database connection by running SELECT version() and returning the result.
    This endpoint doesn't require authentication for testing purposes.
    """
    try:
        result = test_connection()
        return result
    except Exception as e:
        return {"error": "Database connection failed", "details": str(e)}


