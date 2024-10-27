import requests
import os

def send_wxpusher_message(content, uid):
    app_token = os.getenv("WXPUSHER_APP_TOKEN")
    url = "https://wxpusher.zjiecode.com/api/send/message"
    data = {
        "appToken": app_token,
        "content": content,
        "uids": [uid],
        "contentType": 1
    }
    response = requests.post(url, json=data)
    return response.json()
