from fastapi import APIRouter
from app.models.request import RewriteRequest
from app.models.response import RewriteResponse
from app.core.rewrite_engine import rewrite_code

router = APIRouter()

@router.post("/", response_model=RewriteResponse)
def rewrite_endpoint(payload: RewriteRequest):
    return rewrite_code(
        payload.code,
        payload.language
    )
