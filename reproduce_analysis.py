import requests
import os

BASE_URL = "http://localhost:8000"

def test_analysis():
    print(f"Testing analysis against {BASE_URL}")
    
    # 1. Login
    print("1. Logging in...")
    try:
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_repro@example.com",
            "password": "password123"
        })
        if login_resp.status_code != 200:
            print(f"Login failed: {login_resp.text}")
            return
            
        token = login_resp.json().get("access_token")
        print("Logged in.")
    except Exception as e:
        print(f"Auth failed: {e}")
        return

    # 2. Submit Code for Analysis
    code_snippet = """
def add(a, b):
    return a + b
    """
    
    print("\n2. Submitting Python Code...")
    try:
        resp = requests.post(
            f"{BASE_URL}/api/review",
            headers={"Authorization": f"Bearer {token}"},
            json={"code": code_snippet, "language": "python"}
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            print("Success!")
            print(resp.json())
        else:
            print(f"Failed: {resp.text}")
            
    except Exception as e:
        print(f"Submission failed: {e}")

if __name__ == "__main__":
    test_analysis()
