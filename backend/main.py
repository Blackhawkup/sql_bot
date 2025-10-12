from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.auth import router as auth_router
from routers.chat import router as chat_router
from routers.admin import router as admin_router
from models import init_db
from database.init_db import init_neon_database

load_dotenv()

app = FastAPI(title="AI SQL Assistant Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    # Initialize Neon PostgreSQL database
    print("🚀 Starting SQL Bot backend...")
    if init_neon_database():
        print("✅ Database initialization completed")
    else:
        print("⚠️  Database initialization failed, but continuing with fallback")
    
    # Initialize SQLAlchemy models (for compatibility)
    init_db()


