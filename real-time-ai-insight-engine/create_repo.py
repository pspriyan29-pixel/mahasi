
import requests
import json

token = "[REDACTED_GITHUB_TOKEN]"
url = "https://api.github.com/user/repos"
headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}
data = {"name": "ai-insight-engine-final", "private": False}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status: {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
