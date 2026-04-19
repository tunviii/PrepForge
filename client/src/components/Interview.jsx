import React, { useState, useRef, useEffect } from "react";
import '../styles/Interview.css';
import { useNavigate } from 'react-router-dom';
function Interview({ goBack }) {
  const videoRef = useRef(null);
const navigate = useNavigate();
  const [sessionId, setSessionId]               = useState(null);
  const [questionText, setQuestionText]         = useState("Click Start Interview to begin");
  const [currentQuestion, setCurrentQuestion]   = useState(0);
  const [totalQuestions, setTotalQuestions]     = useState(5);
  const [timer, setTimer]                       = useState(45 * 60);
  const [started, setStarted]                   = useState(false);
  const [isSpeaking, setIsSpeaking]             = useState(false);
  const [downloadUrl, setDownloadUrl]           = useState("");

  const timerRef     = useRef(null);
  const sessionIdRef = useRef(null);
  const [mediaRecorder, setMediaRecorder]       = useState(null);
  const [recordedChunks, setRecordedChunks]     = useState([]);

  useEffect(() => {
    if (started) startCamera();
  }, [started]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const speech   = new SpeechSynthesisUtterance(text);
    speech.lang    = "en-US";
    speech.rate    = 1;
    speech.onstart = () => setIsSpeaking(true);
    speech.onend   = () => setIsSpeaking(false);
    window.speechSynthesis.speak(speech);
  };

  const startTimer = (duration) => {
    setTimer(duration);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); endInterview(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
      };
      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      console.error(err);
      alert("Camera or microphone permission denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startInterview = async () => {
    try {
      const res  = await fetch("http://localhost:5000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.finished) { endInterview(); return; }
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
      setQuestionText(data.question);
      setCurrentQuestion(data.currentQuestion);
      setTotalQuestions(data.totalQuestions);
      setStarted(true);
      startTimer(data.duration);
      speak(data.question);
    } catch (error) {
      console.error("Start interview error:", error);
    }
  };

  const nextQuestion = async () => {
    if (!sessionIdRef.current) return;
    try {
      const res  = await fetch("http://localhost:5000/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      });
      const data = await res.json();
      if (data.finished) { endInterview(); return; }
      setQuestionText(data.question);
      setCurrentQuestion(data.currentQuestion);
      speak(data.question);
    } catch (error) {
      console.error("Next question error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        setDownloadUrl(URL.createObjectURL(blob));
      };
    }
  };

  const endInterview = async () => {
  try {
    clearInterval(timerRef.current);
    speak("Interview ended. Thank you.");
    stopRecording();
    stopCamera();
    if (sessionIdRef.current) {
      await fetch("http://localhost:5000/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      });
    }
  } catch (error) {
    console.error("End interview error:", error);
  }

  navigate('/report', {
    state: {
      questions: [questionText],   // or however you track all questions
      answerTranscripts: [],
      interviewLog: [],
      currentQuestion,
    }
  });
};
const minutes = Math.floor(timer / 60);
const seconds = timer % 60;
  /* ── PRE-START LANDING VIEW ── */
  if (!started) {
    return (
      <>
        <div className="bg-glow"></div>
        <div className="grid-bg"></div>

        <div id="interview-page">
          <nav className="nav">
            <div className="nav-logo">
              <div className="logo-mark">P</div>
              <div className="logo-text">Prep<span>Forge</span></div>
            </div>
            <div className="nav-badge">
              <div className="badge-dot"></div>
              AI Interviewer Ready
            </div>
            <button className="nav-back" onClick={goBack}>← Back</button>
          </nav>

          <div className="main">
            <div className="layout">

              <div className="left">
                <div className="eyebrow">🔴 Live Simulation Mode</div>
                <h1 className="big-title">
                  Mock Interview
                  <span className="accent">Test Mode</span>
                </h1>
                <p className="desc">
                  Step into a high-stakes simulation. Our AI asks, challenges, and
                  evaluates you — exactly like real rounds at Google, Amazon, and Meta.
                </p>

                <div className="pill-list">
                  {[
                    { emoji: "⏱️", title: "Timed Interview",          sub: "Real clock pressure — no pausing allowed" },
                    { emoji: "🧠", title: "AI Evaluation",            sub: "Instant scoring after each response" },
                    { emoji: "📊", title: "Full Performance Report",  sub: "Detailed breakdown + hire recommendation" },
                    { emoji: "🏢", title: "Company-Specific Questions", sub: "DSA, behavioral, HR & system design" },
                  ].map(({ emoji, title, sub }) => (
                    <div className="pill-item" key={title}>
                      <span className="pill-emoji">{emoji}</span>
                      <div className="pill-body">
                        <div className="pill-title">{title}</div>
                        <div className="pill-sub">{sub}</div>
                      </div>
                      <div className="pill-check">
                        <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" /></svg>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cta-section">
                  <button className="start-btn" onClick={startInterview}>
                    <span className="btn-icon">🚀</span>
                    Start Interview Now
                  </button>
                  <div className="cta-note">No hints &nbsp;·&nbsp; No retries &nbsp;·&nbsp; Just you vs the AI</div>
                </div>
              </div>

              <div className="right">
                <div className="mic-hero">
                  <div className="mic-aura">
                    <div className="mic-ring"></div>
                    <div className="mic-ring"></div>
                    <div className="mic-ring"></div>
                    <div className="mic-circle">🎤</div>
                  </div>
                  <div className="mic-label">AI Interviewer is Live</div>
                  <div className="mic-sub">Waiting for you to begin your session</div>
                </div>

                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-icon">🗂️</div>
                    <div className="stat-val">4–5</div>
                    <div className="stat-label">Questions</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">🕐</div>
                    <div className="stat-val">45–60<span>min</span></div>
                    <div className="stat-label">Duration</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-val">100</div>
                    <div className="stat-label">Max Score</div>
                  </div>
                </div>

                <div className="warn-bar">
                  <span className="warn-icon">⚠️</span>
                  Once started, the timer cannot be paused. Treat this like a real interview.
                </div>
              </div>

            </div>
          </div>

          <div className="bottom-bar">
            <div className="bottom-item"><span>💻</span> DSA &amp; Algorithms</div>
            <div className="bottom-sep"></div>
            <div className="bottom-item"><span>🧠</span> Behavioral</div>
            <div className="bottom-sep"></div>
            <div className="bottom-item"><span>👔</span> HR Rounds</div>
            <div className="bottom-sep"></div>
            <div className="bottom-item"><span>🏗️</span> System Design</div>
            <div className="bottom-sep"></div>
            <div className="bottom-item"><span>🏢</span> Company-Specific</div>
          </div>
        </div>
      </>
    );
  }

  /* ── LIVE INTERVIEW VIEW ── */
  return (
    <>
      <div className="bg-glow"></div>
      <div className="grid-bg"></div>

      <div id="interview-page">

        {/* NAV — timer shown inline in badge */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="logo-mark">P</div>
            <div className="logo-text">Prep<span>Forge</span></div>
          </div>
          <div className="nav-badge">
            <div className="badge-dot"></div>
            Live &nbsp;·&nbsp; {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
          <button className="nav-back" onClick={goBack}>← Exit</button>
        </nav>

        {/* FULL-SCREEN LIVE SCREEN */}
        <div id="liveScreen">

          {/* QUESTION BAR */}
          <div className="question-bar">

            <div className="qbar-num">Q {currentQuestion} / {totalQuestions}</div>

            <div className="qbar-text">{questionText}</div>

            <div className="qbar-actions">
              <button
                className="qbtn qbtn-next"
                onClick={nextQuestion}
                disabled={currentQuestion === 0}
              >
                ⏭ Next
              </button>
              <button
                className="qbtn qbtn-end"
                onClick={endInterview}
                disabled={currentQuestion === 0}
              >
                ⏹ End
              </button>
              {downloadUrl && (
                <a
                  className="qbtn-download visible"
                  href={downloadUrl}
                  download="interview_recording.webm"
                >
                  ⬇ Download
                </a>
              )}
            </div>

            {/* AI speaking indicator — visible only while AI is reading aloud */}
            <div className={`qbar-speak${isSpeaking ? " active" : ""}`}>
              <div className="speak-bars">
                <div className="speak-bar"></div>
                <div className="speak-bar"></div>
                <div className="speak-bar"></div>
                <div className="speak-bar"></div>
                <div className="speak-bar"></div>
              </div>
              <span className="speak-lbl">AI Speaking</span>
            </div>

          </div>

          {/* CAMERA — fills the rest of the screen */}
          <div className="cam-area">
            <video ref={videoRef} autoPlay playsInline />

            {/* corner brackets */}
            <div className="vid-corner-tl"></div>
            <div className="vid-corner-tr"></div>
            <div className="vid-corner-bl"></div>
            <div className="vid-corner-br"></div>

            {/* user mic indicator */}
            <div className="user-mic">
              <div className="user-mic-bars">
                <div className="user-mic-bar"></div>
                <div className="user-mic-bar"></div>
                <div className="user-mic-bar"></div>
                <div className="user-mic-bar"></div>
                <div className="user-mic-bar"></div>
              </div>
              <span className="user-mic-lbl">Listening…</span>
            </div>

            {/* recording tag */}
            <div className="vid-live-tag">
              <div className="live-dot"></div>
              <span className="vid-live-text">RECORDING</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Interview;