import requests
import sys

BASE_URL = "http://localhost:8000"

def test_c_submission():
    print(f"Testing C submission against {BASE_URL}")
    
    # 1. Login to get token
    print("1. Logging in...")
    try:
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_repro@example.com",
            "password": "password123"
        })
        if login_resp.status_code != 200:
            print("Login failed, trying to register first...")
            requests.post(f"{BASE_URL}/api/auth/register", json={
                "username": "testuser_c",
                "email": "test_repro@example.com",
                "password": "password123"
            })
            login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": "test_repro@example.com",
                "password": "password123"
            })
            
        token = login_resp.json().get("access_token")
        print("Logged in.")
    except Exception as e:
        print(f"Auth failed: {e}")
        return

    # 2. Submit C Code
    c_code = """
#include <stdio.h>

int main() {
    int i;
    for (i = 0; i < 10; i++) {
        printf("Hello World %d\\n", i);
    }
    return 0;
}
    """
    
    print("\n2. Submitting C Code...")
    try:
        resp = requests.post(
            f"{BASE_URL}/api/review",
            headers={"Authorization": f"Bearer {token}"},
            json={"code": c_code, "language": "c"}
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            result = resp.json()
            print("Success!")
            print(f"Score: {result['summary']['score']}")
            print(f"Issues found: {len(result['issues'])}")
        else:
            print(f"Failed: {resp.text}")
            
    except Exception as e:
        print(f"Submission failed: {e}")

if __name__ == "__main__":
    test_c_submission()
