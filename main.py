from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import auth, samples, pesticides, assessments

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="0.1.0",
              description="AgriSafe pesticide-residue decision-support API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(samples.router)
app.include_router(pesticides.router)
app.include_router(assessments.router)

@app.get("/")
def root():
    return {"name": "AgriSafe API", "status": "running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
