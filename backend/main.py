from fastapi import FastAPI

from api.routes.telemetry import router as telemetry_router


app = FastAPI(
    title="RootCauseAI",
    description="AI-powered software failure root-cause analysis platform",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "RootCauseAI backend is running",
        "status": "online"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RootCauseAI Backend"
    }


app.include_router(telemetry_router)