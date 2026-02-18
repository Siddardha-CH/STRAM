from fastapi import FastAPI
from app.api import review, rewrite

app = FastAPI(
    title="AI Code Review & Rewrite API",
    version="1.0.0"
)

app.include_router(review.router, prefix="/review")
app.include_router(rewrite.router, prefix="/rewrite")
