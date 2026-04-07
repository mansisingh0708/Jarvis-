import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [appStatus, setAppStatus] = useState("idle"); // idle, initializing, waiting_for_wake_word, awake
  const statusRef = useRef(appStatus);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    statusRef.current = appStatus;
  }, [appStatus]);

  const handleVoiceInputRef = useRef(null);

  useEffect(() => {
    handleVoiceInputRef.current = handleVoiceInput;
  }, [appStatus]); // appStatus is a dependency for handleVoiceInput

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        if (isSpeakingRef.current) {
          console.log("Ignoring voice input while Jarvis is speaking.");
          return;
        }
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        if (handleVoiceInputRef.current) {
          handleVoiceInputRef.current(transcript);
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'no-speech') {
          console.log("No speech detected.");
          return;
        }
        let msg = `Mic error: ${event.error}.`;
        if (event.error === 'not-allowed') {
          msg = "Mic error: Permission denied. Please enable mic access in your browser.";
        }
        setStatusText(msg);
        speakText(msg);
        setAppStatus("idle");
        setIsListening(false);
      };

      rec.onend = () => {
        console.log("Recognition ended. Status:", statusRef.current);
        if (statusRef.current === "waiting_for_wake_word" || statusRef.current === "awake") {
          console.log("Auto-restarting mic...");
          try {
            rec.start();
          } catch (e) {
            console.log("Restart failed (starting or already started)");
          }
        } else {
          setIsListening(false);
          setAppStatus("idle");
          setStatusText("");
        }
      };

      setRecognition(rec);
    } else {
      setStatusText("Error: Your browser does not support Speech Recognition. Use Chrome/Edge.");
    }
  }, []);

  const handleVoiceInput = (transcript) => {
    if (isSpeakingRef.current) return;
    console.log("Transcript:", transcript, "Status:", statusRef.current);

    if (statusRef.current === "waiting_for_wake_word") {
      if (transcript.includes("jarvis")) {
        const helloMsg = "Hi, I am Jarvis. How can I help you?";
        speakText(helloMsg);
        setStatusText(helloMsg);
        setAppStatus("awake");
      }
    } else if (statusRef.current === "awake") {
      if (transcript.includes("exit") || transcript.includes("goodbye") || transcript.includes("stop")) {
        const byeMsg = "Goodbye! Turning off the microphone.";
        speakText(byeMsg);
        setStatusText(byeMsg);
        stopEverything();
      } else {
        handleAction(transcript);
      }
    }
  };

  const speakText = (text, callback) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = true;
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.onend = () => {
        isSpeakingRef.current = false;
        if (callback) callback();
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
      };

      window.speechSynthesis.speak(utterance);
    } else if (callback) {
      callback();
    }
  };

  const startMic = () => {
    console.log("Attempting to start mic...");
    setStatusText("Opening microphone...");

    // Slight delay to ensure audio hardware is released by SpeechSynthesis
    setTimeout(() => {
      try {
        if (!recognition) {
          setStatusText("Error: Recognition object not initialized.");
          return;
        }
        recognition.start();
        setAppStatus("waiting_for_wake_word");
        setStatusText("Waiting for wake command 'Jarvis'...");
        setIsListening(true);
      } catch (e) {
        console.error("Start mic error:", e);
        setStatusText(`Mic error: ${e.message || "Could not start"}. Try clicking again.`);
        setAppStatus("idle");
        setIsListening(false);
      }
    }, 400);
  };

  const stopEverything = () => {
    setAppStatus("idle");
    setIsListening(false);
    setStatusText("");
    if (recognition) {
      recognition.stop();
    }
  };

  const toggleListening = () => {
    if (appStatus !== "idle") {
      stopEverything();
      return;
    }

    setStatusText("Initializing Jarvis...");
    setAppStatus("initializing");

    // Wait for the initialization speech to finish BEFORE starting the mic
    speakText("Initializing Jarvis", () => {
      startMic();
    });
  };

  const handleAction = async (action) => {
    if (!action.trim()) return;

    setStatusText(`Processing: "${action}"`);
    const command = action.toLowerCase();

    // Helper for the follow-up prompt
    const triggerFollowUp = () => {
      setTimeout(() => {
        if (statusRef.current === "awake") {
          const promptMsg = "Anything else?";
          speakText(promptMsg);
          setStatusText(promptMsg);
        }
      }, 500);
    };

    // 1. Client-side navigation (Fast execution)
    if (command.includes("google")) {
      const response = "Opening Google";
      setStatusText(response);
      speakText(response, triggerFollowUp);
      window.open("https://google.com", "_blank");
      return;
    }
    else if (command.includes("youtube")) {
      const response = "Opening YouTube";
      setStatusText(response);
      speakText(response, triggerFollowUp);
      window.open("https://youtube.com", "_blank");
      return;
    }
    else if (command.includes("leet code") || command.includes("leetcode")) {
      const response = "Opening LeetCode";
      setStatusText(response);
      speakText(response, triggerFollowUp);
      window.open("https://leetcode.com/problemset/javascript/", "_blank");
      return;
    }
    else if (command.includes("pune") || command.includes("iiit")) {
      const response = "Opening IIIT Pune website";
      setStatusText(response);
      speakText(response, triggerFollowUp);
      window.open("https://www.iiitp.ac.in/", "_blank");
      return;
    }

    // 2. Delegate everything else to Python Backend
    try {
      const res = await fetch("http://localhost:8000/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ command: command })
      });
      const data = await res.json();

      setStatusText(data.reply);
      speakText(data.reply, () => {
        if (data.action === "open" && data.url) {
          window.open(data.url, "_blank");
        }
        triggerFollowUp();
      });

    } catch (err) {
      console.error("Backend error:", err);
      const errorMsg = "Sorry, I couldn't connect to the backend.";
      speakText(errorMsg);
      setStatusText(errorMsg);
    }
  };

  return (
    <div className="jarvis-container">
      {/* 
        PREVIOUS UI CODE (Commented out for reference)
        <div className="content-wrapper">
          <div className="ambient-glow-1"></div>
          <div className="ambient-glow-2"></div>
          ... (etc)
        </div>
      */}

      <header className="top-nav">
        <div className="system-tag">JARVIS // CORE_OS_V4.2</div>
        <div className="system-tag" style={{ color: isListening ? 'var(--neon-green)' : 'var(--neon-pink)' }}>
          {isListening ? '• SYSTEM_ACTIVE' : '• STANDBY_MODE'}
        </div>
      </header>

      <main className="main-content">
        <div className="orb-wrapper" onClick={toggleListening}>
          <div className="scan-lines"></div>
          <div className={`orb-core ${appStatus === "initializing" ? "initializing" :
            appStatus === "waiting_for_wake_word" ? "waiting" :
              appStatus === "awake" ? "awake" : ""
            }`}></div>
        </div>

        <div className="hud-text">
          <p className="status-label">Signal Processor // Output</p>
          <h2 className="status-main">{statusText || "Ready for Initialization"}</h2>
        </div>

        <div className="action-grid">
          <div className="neon-card" onClick={() => handleAction("Open Google")}>GOOGLE.EXE</div>
          <div className="neon-card" onClick={() => handleAction("Open YouTube")}>YOUTUBE.SYS</div>
          <div className="neon-card" onClick={() => handleAction("Open Leet Code")}>LEETCODE.DEV</div>
          <div className="neon-card" onClick={() => handleAction("Open IIIT Pune")}>ACADEMIC.EDU</div>
          <div className="neon-card" onClick={() => handleAction("News")}>NEWS_FEED.LOG</div>
        </div>
      </main>

      {/* Legacy code preserved as comments below */}
      {/* 
      <section className="contact-section">
        ...
      </section> 
      */}
    </div>
  );
}

export default App;
