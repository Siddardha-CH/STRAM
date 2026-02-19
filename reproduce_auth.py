import requests
import sys

BASE_URL = "http://localhost:8000"

def test_auth():
    print(f"Testing auth against {BASE_URL}")
    
    # 1. Register
    username = "testuser_repro"
    email = "test_repro@example.com"
    password = "password123"
    
    print(f"\n1. Registering user: {username}")
    try:
        reg_resp = requests.post(f"{BASE_URL}/api/auth/register", json={
            "username": username,
            "email": email,
            "password": password
        })
        print(f"Status: {reg_resp.status_code}")
        print(f"Response: {reg_resp.text}")
    except Exception as e:
        print(f"Registration failed to connect: {e}")
        return

    # If already exists (400), that's fine, proceed to login
    
    # 2. Login
    print(f"\n2. Logging in user: {email}")
    try:
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        })
        print(f"Status: {login_resp.status_code}")
        print(f"Response: {login_resp.text}")
        
        if login_resp.status_code == 200:
            token = login_resp.json().get("access_token")
            print(f"SUCCESS: Got token: {token[:10]}...")
            
            # 3. Test Me
            print("\n3. Testing /api/auth/me")
            me_resp = requests.get(f"{BASE_URL}/api/auth/me", headers={
                "Authorization": f"Bearer {token}"
            })
            print(f"Status: {me_resp.status_code}")
            print(f"Response: {me_resp.text}")
        else:
            print("FAILURE: Could not login")

    except Exception as e:
        print(f"Login failed to connect: {e}")

if __name__ == "__main__":
    test_auth()
