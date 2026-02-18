def generate_review(prompt: str) -> str:
    # Mock AI response for now
    return """
CRITICAL:
- Issue: Security Vulnerability
  Explanation: Input is not sanitized before use.

HIGH:
- Issue: Performance Issue
  Explanation: Inefficient loop detected.

MEDIUM:
- Issue: Code Style
  Explanation: Variable names are not descriptive.

LOW:
- Issue: Typo
  Explanation: Misspelled comment.
"""