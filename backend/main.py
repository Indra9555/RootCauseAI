from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, engine
from database import models

from api.routes.telemetry import router as telemetry_router
from api.incidents.routes import router as incidents_router
from api.routes.services import router as services_router


app = FastAPI(
    title="RootCauseAI",
    description="AI-powered software failure root-cause analysis platform",
    version="0.1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "message": "RootCauseAI Backend is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RootCauseAI Backend"
    }


# Existing telemetry API
app.include_router(telemetry_router)

# Incident API
app.include_router(incidents_router)

# Services API
app.include_router(services_router)