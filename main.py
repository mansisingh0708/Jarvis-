import speech_recognition as sr
import webbrowser
import pyttsx3
from musiclibrary import music
import time
import ollama
import requests



# Initialize TTS engine
engine = pyttsx3.init()# initialize the voice engine
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)  # Change index to choose a different voice
# engine.setProperty('rate', 150)         # Speed of speech (default ~200)
# engine.setProperty('volume', 0.8)       # Volume (0.0 to 1.0)
# voices = engine.getProperty('voices')   # Get available voices
# engine.setProperty('voice', voices[1].id)  # C



def speak(text):
    engine.say(text)# queues the text its like telling jarvis this is the text i want you to say
    engine.runAndWait()# it will speak out lous the tetx





def get_news_mediastack():
    api_key = 'e235f2c6e1f3838b3e98eb8a1d0ed4e5'  # Replace with your real key
    url = f'http://api.mediastack.com/v1/news?access_key={api_key}&countries=in&limit=10'

    try:
        response = requests.get(url)
        if response.status_code==200:
          data = response.json()# will be a dict
          print("Raw response:", data)  # Debug
          if "data" in data and data["data"]:
            headlines = [article["title"] for article in data["data"]]
            return headlines
        else:
            print("No news found or error:", data,"error,",response.status_code)
            return ["Sorry, I couldn't fetch news at this moment."]
    except Exception as e:
        print("Error:", e)
        return [f"Error fetching news: {e}"]


#         {
#   'status': 'ok',
#   'articles': [
#     {'title': 'News headline 1', 'description': 'Desc 1'},
#     {'title': 'News headline 2', 'description': 'Desc 2'}
#   ]
# }


def ask_local_llm(prompt):
    response = ollama.chat(
        model= 'llama3.2',  # or 'mistral', etc.
        messages=[
        {"role": "system", "content": "You are Jarvis Helpful AI assistant."},
        {"role": "user", "content": prompt}
        ]
    )
    return response['message']['content']



def processcommand(command):
    command = command.lower()
    if "open google" in command:
        webbrowser.open("https://google.com")
    elif "open youtube" in command:
        webbrowser.open("https://youtube.com")
    elif "open leet code" in command:
        webbrowser.open("https://leetcode.com/problemset/javascript/")
    elif "open IIIT Pune" in command or "iiit pune" in command or "triple i t pune" in command:
     speak("Opening IIIT Pune website")
     webbrowser.open("https://www.iiitp.ac.in/")
                   
    elif command.startswith("play"):
        song = command.replace("play", "").strip()
        if song in music:  
            webbrowser.open(music[song])
        else:
            speak("Sorry, I couldn't find that song.")
   
    elif "news" in command:
     print("Fetching news...")  # Debug line
     headlines = get_news_mediastack()
     print("Headlines:", headlines)  # Debug line
     for headline in headlines:
        print("Speaking:", headline)  # Debug line
        speak(headline)

 
    else:
        speak("Let me think...")
        reply = ask_local_llm(command)
        print("Local AI:", reply)
        speak(reply)    

   
    

if __name__ == "__main__":
    speak("Initializing Jarvis")
    r = sr.Recognizer()  # sr.recognizer recognizer is a class inside the sr module and to create its object we write r = sr.recognizer()
#     🔧 Recognizer() – Purpose:
# It provides all the tools and methods needed to:
# Capture audio from a microphone or file.
# Convert spoken words into text using services like:
# Google Web Speech API (default and free)
# IBM, Sphinx, Wit.ai, etc.
# Handle noise, time limits, and timeouts.
    
    while True:
        print("Waiting for wake word...")

        try:
            with sr.Microphone() as source:  # this will record our audio from the microphone or file
                r.adjust_for_ambient_noise(source, duration=1)# this will remove ambient sound
                time.sleep(0.5)
                print("Listening for wake word...")
                audio = r.listen(source, timeout=5)   # Listens to audio from microphone as source is microphoen

            word = r.recognize_google(audio)# Converts audio to text using Google
            print(f"You said: {word}")

            if "jarvis" in word.lower():
                speak("Hi, I am Jarvis. How can I help you?")
                
                with sr.Microphone() as source:
                    #✅ sr.Microphone()
                        # This tells Python: "Use the microphone as the audio input."
                        # It opens a live audio stream from your mic.
                    # ✅ with ... as source:
                        # This is a context manager that:
                        # Automatically starts listening to the microphone.
                        # Automatically closes the connection when done (no need to manually stop or release the mic).
                    # The source object is now an audio source that can be used with other functions like:
                        # recognizer.listen(source)
                        # recognizer.adjust_for_ambient_noise(source)
                    print("Listening for command...")
                    audio = r.listen(source, timeout=5, phrase_time_limit=6)
                    command = r.recognize_google(audio)
                    print(f"Command received: {command}")
                    processcommand(command)

        except sr.UnknownValueError:
            print("Sorry, I couldn't understand you.")
        except sr.RequestError as e:
            print("Could not request results; {0}".format(e))
        except Exception as e:
            print(f"Error: {e}")


# This block handles errors that might occur when recognizing speech using the speech_recognition (sr) library.

                # 🔹 1. except sr.UnknownValueError
                # What it catches:
                # Raised when speech is detected, but the recognizer can't understand what was said.


                # Common causes:
                # Muffled speech
                # Too much background noise
                # silence
                # Accents or unclear words


                # Example:
                # audio = r.listen(source)
                # r.recognize_google(audio)  # raises UnknownValueError if input is not understood
                # What your code does:
                # It prints a friendly message:
                # "Sorry, I couldn't understand you."



                # 🔹 2. except sr.RequestError as e
                # What it catches:
                # Raised when there is a problem with the internet connection or the Google Speech Recognition API is unreachable.
                # Typical error causes:
                # No internet
                # API service down
                # Request timed out

                # The e contains details, such as:
                # Could not request results; recognition connection failed: [Errno 11001] getaddrinfo failed
                # What your code does:
                # It formats and prints the error message:
                # print("Could not request results; {0}".format(e))


                # 🔹 3. except Exception as e
                # What it catches:
                # A generic catch-all for any other type of unexpected exception that wasn’t caught above.



                # Why it's useful:
                # Prevents the program from crashing due to an unanticipated error (like ValueError, TimeoutError, etc.)
                # What your code does:
                # It prints:
                # Error: <exception message>
                # ✅ Summary
                # Exception Type	When It Happens	What You Do
                # sr.UnknownValueError	Audio heard, but speech can't be understood	Print apology
                # sr.RequestError	Internet/API request failed	Show error
                # Exception (generic)	Any other error	Print exception
