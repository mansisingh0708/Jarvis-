# Jarvis Project Prerequisites

This document outlines the necessary setup and permissions required to run the Jarvis AI assistant successfully.

## 1. Hardware Requirements
- **Microphone**: A functional microphone is required for voice commands.

## 2. Software & Environment
- **Python**: Version 3.12 or higher.
- **Node.js & npm**: Required to run the React frontend.
- **Ollama**: Must be installed and running locally.
  - **Model**: Ensure the `phi3` model is pulled (`ollama pull phi3`).

## 3. Browser Requirements
- **Recommended Browsers**: Google Chrome or Microsoft Edge.
- **Web Speech API**: Jarvis uses the Web Speech API for voice recognition, which is best supported in Chromium-based browsers.

## 4. Permissions
- **Microphone Access**: You must explicitly allow microphone access in your browser when prompted.
- **Localhost Exceptions**: Ensure your browser allows insecure content (HTTP) from `localhost` if you encounter issues connecting to the backend.

## 5. Performance Note
- **Latency**: Since Jarvis uses a **Local LLM (Ollama)**, response times may vary depending on your hardware (CPU/GPU). It might take a few seconds to process complex queries.

## 6. Setup Instructions
### Backend
1. Navigate to `jarvis_backend`.
2. Install dependencies: `pip install -r requirements.txt` (if available).
3. Run the server: `python manage.py runserver`.

### Frontend
1. Navigate to `frontend`.
2. Install dependencies: `npm install`.
3. Run the app: `npm run dev`.

### Voice Logic (Standalone)
- You can also run `main.py` directly for a terminal-based voice interaction.
