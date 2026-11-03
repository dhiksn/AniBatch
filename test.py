
import os
import requests

API_KEY = os.getenv("BAI_API_KEY")

BASE_URL = "https://zro.moonmath.ai/v1"
MODEL = "deepseek-v4.1-flash"

if not API_KEY:
    raise ValueError("API KEY tidak ditemukan!")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": MODEL,
    "messages": [
        {
            "role": "user",
            "content": "Hello! Introduce yourself."
        }
    ],
    "stream": False,
    "temperature": 0.7,
    "max_tokens": 1000
}

try:
    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers=headers,
        json=payload,
        timeout=120
    )

    print("Status:", response.status_code)

    if response.ok:
        data = response.json()
        print("\nAI Response:")
        print(data["choices"][0]["message"]["content"])
    else:
        print("\nAPI Error:")
        print(response.text)

except requests.RequestException as error:
    print("Connection Error:", error)
