# main.py

from fastapi import FastAPI
from pydantic import BaseModel
from review_engine import review_code

app = FastAPI()


class ReviewRequest(BaseModel):
    code: str
    language: str


@app.post("/review")
def review(request: ReviewRequest):
    return review_code(request.code, request.language)
