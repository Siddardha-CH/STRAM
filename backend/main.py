from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import json
import uvicorn

from database import engine, get_db, Base
from models import User, Review
from auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, get_user_by_email, get_user_by_username
)
from ai_service import get_code_review

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CodeRefine API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    email: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    review_count: Optional[int] = 0

class CodeSubmission(BaseModel):
    code: str
    language: str

class ReviewOut(BaseModel):
    id: int
    language: str
    score: float
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    created_at: datetime
    original_code: str
    refactored_code: Optional[str]
    issues_json: Optional[str]

# ─── Auth Endpoints ──────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "CodeRefine API v2.0 is running", "status": "ok"}

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if email or username already exists
    if get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    hashed_pw = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id)})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=new_user.username,
        email=new_user.email
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=user.username,
        email=user.email
    )

@app.get("/api/auth/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review_count = db.query(Review).filter(Review.user_id == current_user.id).count()
    return UserOut(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at,
        review_count=review_count
    )

# ─── Review Endpoints ─────────────────────────────────────────────────────────

@app.post("/api/review")
async def review_code(
    submission: CodeSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not submission.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    # Call AI service
    result = get_code_review(submission.code, submission.language)

    # Save to database
    review = Review(
        user_id=current_user.id,
        language=submission.language,
        original_code=submission.code,
        refactored_code=result.get("refactored_code", ""),
        score=result.get("summary", {}).get("score", 0),
        critical_count=result.get("summary", {}).get("critical", 0),
        high_count=result.get("summary", {}).get("high", 0),
        medium_count=result.get("summary", {}).get("medium", 0),
        low_count=result.get("summary", {}).get("low", 0),
        issues_json=json.dumps(result.get("issues", []))
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Return full result with DB id
    result["review_id"] = review.id
    return result

@app.get("/api/reviews", response_model=List[ReviewOut])
async def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    reviews = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .limit(limit)
        .all()
    )
    return reviews

@app.get("/api/reviews/{review_id}")
async def get_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return {
        "id": review.id,
        "language": review.language,
        "original_code": review.original_code,
        "refactored_code": review.refactored_code,
        "score": review.score,
        "summary": {
            "score": review.score,
            "critical": review.critical_count,
            "high": review.high_count,
            "medium": review.medium_count,
            "low": review.low_count,
        },
        "issues": json.loads(review.issues_json or "[]"),
        "created_at": review.created_at.isoformat()
    }

@app.delete("/api/reviews/{review_id}")
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}

@app.get("/api/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    if not reviews:
        return {"total": 0, "avg_score": 0, "total_issues": 0, "languages": {}}

    total = len(reviews)
    avg_score = sum(r.score for r in reviews) / total
    total_issues = sum(r.critical_count + r.high_count + r.medium_count + r.low_count for r in reviews)
    languages = {}
    for r in reviews:
        languages[r.language] = languages.get(r.language, 0) + 1

    return {
        "total": total,
        "avg_score": round(avg_score, 1),
        "total_issues": total_issues,
        "languages": languages
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
