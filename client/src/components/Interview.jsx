import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/Interview.module.css";
import { useNavigate } from "react-router-dom";

function Interview({ goBack }) {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [sessionId, setSessionId]             = useState(null);
  const [questionText, setQuestionText]       = useState("Click Start Interview to begin");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions]   = useState(5);
  const [timer, setTimer]                     = useState(45 * 60);
  const [started, setStarted]                 = useState(false);
  const [isSpeaking, setIsSpeaking]           = useState(false);
  const [downloadUrl, setDownloadUrl]         = useState("");

  const timerRef      = useRef(null);
  const sessionIdRef  = useRef(null);
  const [mediaRecorder, setMediaRecorder]     = useState(null);
  const [recordedChunks, setRecordedChunks]   = useState([]);

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

    navigate("/report", {
      state: {
        questions: [questionText],
        answerTranscripts: [],
        interviewLog: [],
        currentQuestion,
      },
    });
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  /* ── PRE-START LANDING VIEW ── */
  if (!started) {
    return (
      <>
        <div className={styles.interviewPage}>

          {/* NAVBAR */}
          <nav className={styles.navbar}>
            <div className={styles.navLogo}>
              <div className={styles.logoMark}>P</div>
              <div className={styles.logoText}>
                Prep<span className={styles.accent}>Forge</span>
              </div>
            </div>

            <div className={styles.navBadge}>
              <div className={styles.badgeDot}></div>
              AI Interviewer Ready
            </div>

            <button className={styles.navBack} onClick={goBack}>← Back</button>
          </nav>

          {/* MAIN */}
          <div className={styles.main}>
            <div className={styles.layout}>

              {/* LEFT */}
              <div className={styles.left}>
                <div className={styles.eyebrow}>🔴 Live Simulation Mode</div>

                <h1 className={styles.bigTitle}>
                  Mock Interview
                  <span className={styles.accentBlock}>Test Mode</span>
                </h1>

                <p className={styles.desc}>
                  Step into a high-stakes simulation. Our AI asks, challenges, and
                  evaluates you — exactly like real rounds at Google, Amazon, and Meta.
                </p>

                <div className={styles.pillList}>
                  {[
                    { emoji: "⏱️", title: "Timed Interview",            sub: "Real clock pressure — no pausing allowed" },
                    { emoji: "🧠", title: "AI Evaluation",              sub: "Instant scoring after each response" },
                    { emoji: "📊", title: "Full Performance Report",    sub: "Detailed breakdown + hire recommendation" },
                    { emoji: "🏢", title: "Company-Specific Questions", sub: "DSA, behavioral, HR & system design" },
                  ].map(({ emoji, title, sub }) => (
                    <div className={styles.pillItem} key={title}>
                      <span className={styles.pillEmoji}>{emoji}</span>
                      <div className={styles.pillBody}>
                        <div className={styles.pillTitle}>{title}</div>
                        <div className={styles.pillSub}>{sub}</div>
                      </div>
                      <div className={styles.pillCheck}>
                        <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" /></svg>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.ctaSection}>
                  <button className={styles.startBtn} onClick={startInterview}>
                    <span className={styles.btnIcon}>🚀</span>
                    Start Interview Now
                  </button>
                  <div className={styles.ctaNote}>No hints &nbsp;·&nbsp; No retries &nbsp;·&nbsp; Just you vs the AI</div>
                </div>
              </div>

              {/* RIGHT */}
              <div className={styles.right}>
                <div className={styles.micHero}>
                  <div className={styles.micAura}>
                    <div className={styles.micRing}></div>
                    <div className={styles.micRing}></div>
                    <div className={styles.micRing}></div>
                    <div className={styles.micCircle}>🎤</div>
                  </div>
                  <div className={styles.micLabel}>AI Interviewer is Live</div>
                  <div className={styles.micSub}>Waiting for you to begin your session</div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.statBox}>
                    <div className={styles.statIcon}>🗂️</div>
                    <div className={styles.statVal}>4–5</div>
                    <div className={styles.statLabel}>Questions</div>
                  </div>
                  <div className={styles.statBox}>
                    <div className={styles.statIcon}>🕐</div>
                    <div className={styles.statVal}>45–60<span>min</span></div>
                    <div className={styles.statLabel}>Duration</div>
                  </div>
                  <div className={styles.statBox}>
                    <div className={styles.statIcon}>⭐</div>
                    <div className={styles.statVal}>100</div>
                    <div className={styles.statLabel}>Max Score</div>
                  </div>
                </div>

                <div className={styles.warnBar}>
                  <span className={styles.warnIcon}>⚠️</span>
                  Once started, the timer cannot be paused. Treat this like a real interview.
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className={styles.bottomBar}>
            <div className={styles.bottomItem}><span>💻</span> DSA &amp; Algorithms</div>
            <div className={styles.bottomSep}></div>
            <div className={styles.bottomItem}><span>🧠</span> Behavioral</div>
            <div className={styles.bottomSep}></div>
            <div className={styles.bottomItem}><span>👔</span> HR Rounds</div>
            <div className={styles.bottomSep}></div>
            <div className={styles.bottomItem}><span>🏗️</span> System Design</div>
            <div className={styles.bottomSep}></div>
            <div className={styles.bottomItem}><span>🏢</span> Company-Specific</div>
          </div>

        </div>
      </>
    );
  }

  /* ── LIVE INTERVIEW VIEW ── */
  return (
    <>
      <div className={styles.interviewPage}>

        {/* NAV */}
        <nav className={styles.navbar}>
          <div className={styles.navLogo}>
            <div className={styles.logoMark}>P</div>
            <div className={styles.logoText}>
              Prep<span className={styles.accent}>Forge</span>
            </div>
          </div>

          <div className={styles.navBadge}>
            <div className={styles.badgeDot}></div>
            Live &nbsp;·&nbsp; {minutes}:{seconds.toString().padStart(2, "0")}
          </div>

          <button className={styles.navBack} onClick={goBack}>← Exit</button>
        </nav>

        {/* FULL-SCREEN LIVE SCREEN */}
        <div className={styles.liveScreen}>

          {/* QUESTION BAR */}
          <div className={styles.questionBar}>

            <div className={styles.qbarNum}>Q {currentQuestion} / {totalQuestions}</div>

            <div className={styles.qbarText}>{questionText}</div>

            <div className={styles.qbarActions}>
              <button
                className={`${styles.qbtn} ${styles.qbtnNext}`}
                onClick={nextQuestion}
                disabled={currentQuestion === 0}
              >
                ⏭ Next
              </button>
              <button
                className={`${styles.qbtn} ${styles.qbtnEnd}`}
                onClick={endInterview}
                disabled={currentQuestion === 0}
              >
                ⏹ End
              </button>
              {downloadUrl && (
                <a
                  className={`${styles.qbtnDownload} ${styles.visible}`}
                  href={downloadUrl}
                  download="interview_recording.webm"
                >
                  ⬇ Download
                </a>
              )}
            </div>

            {/* AI speaking indicator */}
            <div className={`${styles.qbarSpeak}${isSpeaking ? ` ${styles.active}` : ""}`}>
              <div className={styles.speakBars}>
                <div className={styles.speakBar}></div>
                <div className={styles.speakBar}></div>
                <div className={styles.speakBar}></div>
                <div className={styles.speakBar}></div>
                <div className={styles.speakBar}></div>
              </div>
              <span className={styles.speakLbl}>AI Speaking</span>
            </div>

          </div>

          {/* CAMERA */}
          <div className={styles.camArea}>
            <video ref={videoRef} autoPlay playsInline />

            <div className={styles.vidCornerTl}></div>
            <div className={styles.vidCornerTr}></div>
            <div className={styles.vidCornerBl}></div>
            <div className={styles.vidCornerBr}></div>

            <div className={styles.userMic}>
              <div className={styles.userMicBars}>
                <div className={styles.userMicBar}></div>
                <div className={styles.userMicBar}></div>
                <div className={styles.userMicBar}></div>
                <div className={styles.userMicBar}></div>
                <div className={styles.userMicBar}></div>
              </div>
              <span className={styles.userMicLbl}>Listening…</span>
            </div>

            <div className={styles.vidLiveTag}>
              <div className={styles.liveDot}></div>
              <span className={styles.vidLiveText}>RECORDING</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Interview;