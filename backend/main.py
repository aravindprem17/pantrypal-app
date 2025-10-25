from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, init_db
from . import models
from .routers import users, items

# Create database tables on startup if they don't exist
init_db()

app = FastAPI(
    title="PantryPal API",
    description="API for managing grocery inventory.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",          # Allow local development if frontend served separately
    "http://localhost:8000",     # Explicitly allow default uvicorn port
    "http://127.0.0.1",        # Allow local development IP
    "http://127.0.0.1:8000",   # Explicitly allow default uvicorn IP:port
    # Add the origin of your deployed frontend if applicable
    # e.g., "https://your-frontend-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],         # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],         # Allows all headers
)


# Include routers
app.include_router(users.router)
app.include_router(items.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the PantryPal API"}

# Optional: Add lifespan events if needed for more complex startup/shutdown logic
# @app.on_event("startup")
# async def startup_event():
#     print("Application startup...")

# @app.on_event("shutdown")
# async def shutdown_event():
#     print("Application shutdown...")
