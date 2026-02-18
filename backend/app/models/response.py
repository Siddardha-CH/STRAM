from pydantic import BaseModel
from typing import List, Dict

class Issue(BaseModel):
    line: int
    message: str
    fix: str

class ReviewResponse(BaseModel):
    summary: Dict[str, int]
    issues: Dict[str, List[Issue]]

class RewriteResponse(BaseModel):
    rewritten_code: str
    improvements: List[str]
