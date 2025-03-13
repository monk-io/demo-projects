import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from app.routers import user, post, comment, friendship
from app.database import engine, Base
from app.auth import VerifyJWTMiddleware
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import models at the top level
from app.models import User, Post, Comment, Like, Friendship

JWT_SECRET = os.getenv("JWT_SECRET", "secret")

# Get allowed origins from environment variable, default to localhost:3000
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

async def exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    async with engine.begin() as conn:
        # Make sure all models are imported before creating tables
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup
    await engine.dispose()

# Create the FastAPI app
app = FastAPI(
    title="Microblog API",
    description="A social media API",
    version="1.0.0",
    lifespan=lifespan
)

# Add exception handler
app.add_exception_handler(HTTPException, exception_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add JWT middleware
app.add_middleware(
    VerifyJWTMiddleware, 
    jwt_secret=JWT_SECRET,
    public_paths={"/health", "/"}
)

# Include routers
app.include_router(
    user.router,
    prefix="/users",
    tags=["users"]
)

app.include_router(
    post.router,
    prefix="/posts",
    tags=["posts"]
)

app.include_router(
    comment.router,
    prefix="/comments",
    tags=["comments"]
)

app.include_router(
    friendship.router,
    prefix="/friendships",
    tags=["friendships"]  # prefix already set in router
)

# Root endpoints
@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to the Microblog API"}

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}


