from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend root
load_dotenv(Path(__file__).parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base, SessionLocal
from app.models.models import User
from app.api import search, email, crm


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Ensure demo user exists (for MVP without auth)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.id == "demo-user-001").first():
            db.add(User(id="demo-user-001", email="demo@tradelead.ai", company_name="Demo Company"))
            db.commit()
    finally:
        db.close()
    yield


app = FastAPI(
    title="TradeLead AI API",
    description="AI-powered B2B customer acquisition for international trade",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)
app.include_router(email.router)
app.include_router(crm.router)


@app.get("/")
async def root():
    return {"message": "TradeLead AI API is running", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
