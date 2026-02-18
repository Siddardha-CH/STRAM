from pydantic import BaseModel
from typing import List, Optional

class ReviewRequest(BaseModel):
    code: str
    language: str
    focus: Optional[List[str]] = []

class RewriteRequest(BaseModel):
    code: str
    language: str
