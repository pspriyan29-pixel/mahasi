
import requests
import json

token = "[REDACTED_GITHUB_TOKEN]"
url = "https://api.github.com/user"
headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"}

try:
    response = requests.get(url, headers=headers)
    data = response.json()
    print(f"ID: {data.get('id')}")
    print(f"Login: {data.get('login')}")
except Exception as e:
    print(f"Error: {e}")
