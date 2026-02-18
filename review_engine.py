# review_engine.py

import re
from ai_engine import generate_review


def build_review_prompt(code: str, language: str) -> str:
    return f"""
You are a senior software engineer performing a strict code review.

Analyze the following {language} code.

Return output strictly in this format:

CRITICAL:
- Issue: <short title>
  Explanation: <why this is critical>

HIGH:
- Issue:
  Explanation:

MEDIUM:
- Issue:
  Explanation:

LOW:
- Issue:
  Explanation:

Code:
\"\"\"
{code}
\"\"\"
"""


def parse_review_response(response_text: str) -> dict:
    severity_levels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    result = {level.lower(): [] for level in severity_levels}

    for level in severity_levels:
        pattern = rf"{level}:(.*?)(?=\n[A-Z]+:|$)"
        match = re.search(pattern, response_text, re.DOTALL)

        if match:
            section = match.group(1)

            issues = re.findall(
                r"- Issue:\s*(.*?)\n\s*Explanation:\s*(.*?)(?=\n\s*- Issue:|\Z)",
                section,
                re.DOTALL
            )

            for title, explanation in issues:
                result[level.lower()].append({
                    "issue": title.strip(),
                    "explanation": explanation.strip()
                })

    return result


def review_code(code: str, language: str) -> dict:
    prompt = build_review_prompt(code, language)
    raw_response = generate_review(prompt)

    structured_output = parse_review_response(raw_response)

    return {
        "summary": {
            "critical": len(structured_output["critical"]),
            "high": len(structured_output["high"]),
            "medium": len(structured_output["medium"]),
            "low": len(structured_output["low"]),
        },
        "issues": structured_output
    }
