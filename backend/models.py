from sqlalchemy import Column, Integer, String, create_engine, BigInteger, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import NoResultFound
from sqlalchemy.sql import func
import hashlib
import hmac
import os
from dotenv import load_dotenv

load_dotenv()

# Use PostgreSQL URL from environment, fallback to SQLite for development
DATABASE_URL = os.getenv("POSTGRES_URL", "sqlite:///./app.db")

# Clean up the URL if it has extra characters or quotes
if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.strip()
    if DATABASE_URL.startswith("psql "):
        DATABASE_URL = DATABASE_URL[5:]  # Remove "psql " prefix
    if DATABASE_URL.startswith("'") and DATABASE_URL.endswith("'"):
        DATABASE_URL = DATABASE_URL[1:-1]  # Remove surrounding quotes
    if DATABASE_URL.startswith('"') and DATABASE_URL.endswith('"'):
        DATABASE_URL = DATABASE_URL[1:-1]  # Remove surrounding quotes

# Configure engine based on database type
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL)
else:
    # SQLite fallback for development
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    schema = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())


class ColumnUsage(Base):
    __tablename__ = "column_usage"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    column_name = Column(String, index=True, nullable=False)
    count = Column(BigInteger, default=0)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())


class QueryLog(Base):
    __tablename__ = "query_logs"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False)
    sql_query = Column(Text, nullable=False)
    status = Column(String, default="ok")
    execution_time_ms = Column(Integer, nullable=True)
    rows_affected = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())


def init_db():
    Base.metadata.create_all(bind=engine)


def _hash_password(password: str, username: str) -> str:
    # Simple HMAC-SHA256 with username as key (demo only)
    return hmac.new(username.encode(), password.encode(), hashlib.sha256).hexdigest()


def verify_password(username: str, password: str, password_hash: str) -> bool:
    return hmac.compare_digest(_hash_password(password, username), password_hash)


def create_user(username: str, password: str, role: str = "user", schema: str | None = None):
    with SessionLocal() as db:
        user = User(username=username, password_hash=_hash_password(password, username), role=role, schema=schema)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


def delete_user(username: str) -> bool:
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True


def get_user_by_username(username: str) -> User | None:
    with SessionLocal() as db:
        return db.query(User).filter(User.username == username).first()


def increment_column_usage(username: str, columns: list[str]):
    if not columns:
        return
    with SessionLocal() as db:
        for col in columns:
            rec = db.query(ColumnUsage).filter(ColumnUsage.username == username, ColumnUsage.column_name == col).first()
            if not rec:
                rec = ColumnUsage(username=username, column_name=col, count=0)
                db.add(rec)
            rec.count = (rec.count or 0) + 1
        db.commit()


def get_column_usage_summary() -> list[dict]:
    with SessionLocal() as db:
        rows = db.query(ColumnUsage).all()
        return [{"username": r.username, "column": r.column_name, "count": int(r.count or 0)} for r in rows]


def log_query(username: str, sql_query: str, status: str = "ok", execution_time_ms: int = None, 
              rows_affected: int = None, error_message: str = None):
    """Log a query execution to the query_logs table."""
    with SessionLocal() as db:
        query_log = QueryLog(
            username=username,
            sql_query=sql_query,
            status=status,
            execution_time_ms=execution_time_ms,
            rows_affected=rows_affected,
            error_message=error_message
        )
        db.add(query_log)
        db.commit()
        return query_log


def get_query_logs(username: str = None, limit: int = 100) -> list[dict]:
    """Get query logs, optionally filtered by username."""
    with SessionLocal() as db:
        query = db.query(QueryLog)
        if username:
            query = query.filter(QueryLog.username == username)
        
        logs = query.order_by(QueryLog.created_at.desc()).limit(limit).all()
        return [
            {
                "id": log.id,
                "username": log.username,
                "sql_query": log.sql_query,
                "status": log.status,
                "execution_time_ms": log.execution_time_ms,
                "rows_affected": log.rows_affected,
                "error_message": log.error_message,
                "created_at": log.created_at.isoformat() if log.created_at else None
            }
            for log in logs
        ]


