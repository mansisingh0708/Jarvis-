from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import sys
import os

# Ensure the parent directory is in sys.path to import main.py
PARENT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PARENT_DIR not in sys.path:
    sys.path.append(PARENT_DIR)

import main
from musiclibrary import music

@csrf_exempt
def process_command(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"reply": "Invalid JSON"}, status=400)
            
        command = data.get('command', '').lower()

        if "news" in command:
            headlines = main.get_news_mediastack()
            reply_text = "Here are the top headlines. " + ". ".join(headlines)
            return JsonResponse({"reply": reply_text})
        
        elif command.startswith("play"):
            song = command.replace("play", "").strip()
            if song in music:
                return JsonResponse({
                    "reply": f"Playing {song}", 
                    "action": "open", 
                    "url": music[song]
                })
            else:
                return JsonResponse({"reply": f"Sorry, I couldn't find {song} in your library."})

        else:
            # Default to LLM
            reply = main.ask_local_llm(command)
            return JsonResponse({"reply": reply})
            
    return JsonResponse({"reply": "Send a POST request with {'command': '...'}"})
