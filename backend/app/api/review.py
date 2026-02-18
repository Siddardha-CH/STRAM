from fastapi import APIRouter
from app.models.request import ReviewRequest
from app.models.response import ReviewResponse
from app.core.review_engine import review_code

router = APIRouter()

@router.post("/", response_model=ReviewResponse)
def review_endpoint(payload: ReviewRequest):
    return review_code(
        payload.code,
        payload.language,
        payload.focus
    )
