from ai_engine import generate_review
import re

def rewrite_code(code, language):

    prompt = f"""
Rewrite this {language} code.

STRICT RULES:
1. Return optimized code inside triple backticks.
2. Keep same logic.
3. Then give bullet improvements starting with "- ".

Code:
{code}
"""


    response = generate_review(prompt)

    optimized = extract_code(response)
    improvements = extract_improvements(response)

    return {
        "optimized_code": optimized,
        "improvements": improvements
    }


def extract_code(text):
    match = re.search(r"```(?:python)?(.*?)```", text, re.S)
    return match.group(1).strip() if match else ""


def extract_improvements(text):
    return [l.strip("- ") for l in text.split("\n") if l.startswith("-")]
