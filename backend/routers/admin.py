from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from utils.jwt_handler import admin_required
from models import create_user, delete_user, get_column_usage_summary
from utils.schema_manager import SchemaManager

router = APIRouter()


class AddUserRequest(BaseModel):
    username: str
    password: str
    role: str = "user"
    schema: str | None = None


@router.post("/add-user")
def add_user(body: AddUserRequest, _=Depends(admin_required)):
    if body.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = create_user(body.username, body.password, body.role, body.schema)
    return {"status": "ok", "id": user.id}


class RemoveUserRequest(BaseModel):
    username: str


@router.post("/remove-user")
def remove_user(body: RemoveUserRequest, _=Depends(admin_required)):
    ok = delete_user(body.username)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "ok"}


@router.get("/analyze-columns")
def analyze_columns(_=Depends(admin_required)):
    usage = get_column_usage_summary()
    mgr = SchemaManager()
    analysis = mgr.analyze_columns(usage)
    return {"status": "ok", "analysis": analysis}


