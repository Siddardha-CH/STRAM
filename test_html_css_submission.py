import requests
import sys

BASE_URL = "http://localhost:8000"

def test_html_css_submission():
    print(f"Testing HTML/CSS submission against {BASE_URL}")
    
    # 1. Login
    print("1. Logging in...")
    try:
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_repro@example.com",
            "password": "password123"
        })
        token = login_resp.json().get("access_token")
        print("Logged in.")
    except Exception as e:
        print(f"Auth failed: {e}")
        return

    # 2. Submit HTML Code
    html_code = """
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
    <div style="color: red">Hello</div>
</body>
</html>
    """
    
    print("\n2. Submitting HTML Code...")
    try:
        resp = requests.post(
            f"{BASE_URL}/api/review",
            headers={"Authorization": f"Bearer {token}"},
            json={"code": html_code, "language": "html"}
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            result = resp.json()
            print("HTML Success!")
            print(f"Score: {result['summary']['score']}")
        else:
            print(f"HTML Failed: {resp.text}")
            
    except Exception as e:
        print(f"HTML Submission failed: {e}")

    # 3. Submit CSS Code
    css_code = """
body {
    background-color: #fff;
    color: #333;
}
.container {
    display: flex;
    justify-content: center;
}
    """
    
    print("\n3. Submitting CSS Code...")
    try:
        resp = requests.post(
            f"{BASE_URL}/api/review",
            headers={"Authorization": f"Bearer {token}"},
            json={"code": css_code, "language": "css"}
        )
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            result = resp.json()
            print("CSS Success!")
            print(f"Score: {result['summary']['score']}")
        else:
            print(f"CSS Failed: {resp.text}")
            
    except Exception as e:
        print(f"CSS Submission failed: {e}")

if __name__ == "__main__":
    test_html_css_submission()
