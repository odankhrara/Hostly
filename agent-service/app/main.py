from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.agent import router as agent_router
from app.config.settings import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Hostly AI Travel Agent",
    description="AI-powered travel concierge service for Hostly platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent_router, prefix="/api/agent", tags=["agent"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Hostly AI Travel Agent Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/api/status")
async def status():
    """Service status endpoint"""
    return {
        "service": "hostly-ai-agent",
        "status": "healthy",
        "version": "1.0.0",
        "environment": "development" if settings.DEBUG else "production"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
