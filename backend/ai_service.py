import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def get_code_review(code: str, language: str) -> dict:
    """Analyzes code and returns a structured JSON review."""
    system_prompt = f"""You are an expert Senior Software Engineer performing a thorough code review.
Analyze the provided {language} code and return a STRICTLY valid JSON object.

The JSON must follow this exact structure:
{{
    "summary": {{
        "score": <integer 0-100 representing overall code quality>,
        "critical": <count of critical severity issues>,
        "high": <count of high severity issues>,
        "medium": <count of medium severity issues>,
        "low": <count of low severity issues>,
        "overview": "<2-3 sentence summary of the code quality>"
    }},
    "issues": [
        {{
            "severity": "critical" | "high" | "medium" | "low",
            "category": "Bug" | "Security" | "Performance" | "Best Practice" | "Maintainability",
            "title": "<concise issue title>",
            "line_hint": "<approximate line or function name where issue occurs>",
            "description": "<clear explanation of why this is a problem>",
            "suggestion": "<exact code snippet showing the fix>"
        }}
    ],
    "refactored_code": "<the complete rewritten code string. DO NOT use Gist links or URLs. MUST be the full code.>",
    "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}}

Rules:
- Output ONLY the raw JSON, no markdown code fences.
- The 'refactored_code' field MUST contain the actual full code.
- DO NOT return a URL, Gist link, or placeholder like "Click here to view code".
- Be thorough but accurate. Do not invent issues that don't exist.
- The refactored_code must be complete and runnable.
- Score 90-100 for excellent code, 70-89 for good, 50-69 for fair, below 50 for poor.
"""
    user_prompt = f"Please review this {language} code:\n\n```{language}\n{code}\n```"

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            model=MODEL,
            temperature=0.1,
            response_format={"type": "json_object"},
            max_tokens=4096,
        )
        return json.loads(chat_completion.choices[0].message.content)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return _error_response(f"Failed to parse AI response: {e}")
    except Exception as e:
        print(f"Groq API error: {e}")
        return _error_response(str(e))


def _error_response(message: str) -> dict:
    return {
        "summary": {
            "score": 0, "critical": 1, "high": 0, "medium": 0, "low": 0,
            "overview": "Analysis failed due to an error."
        },
        "issues": [{
            "severity": "critical",
            "category": "Bug",
            "title": "Analysis Failed",
            "line_hint": "N/A",
            "description": message,
            "suggestion": "Please try again."
        }],
        "refactored_code": "// Error: Could not generate refactored code.",
        "improvements": []
    }
