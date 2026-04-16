import React, { useState, useRef, useEffect } from "react";
import "../styles/Interview.css";
import { useNavigate } from "react-router-dom";

function Interview({ goBack }) {

  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [questionText, setQuestionText] = useState("Click Start Interview to begin");

  const [questionsAsked, setQuestionsAsked] = useState([]);
  const [answerTranscripts, setAnswerTranscripts] = useState([]);

  const [interviewLog, setInterviewLog] = useState([]);

  const questionStartRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);

  const [timer, setTimer] = useState(45 * 60);
  const [started, setStarted] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const timerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const recognitionRef = useRef(null);

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  useEffect(() => {
    if (started) startCamera();
  }, [started]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  /* ---------------- Speech Recognition ---------------- */

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {

      const transcript =
        event.results[event.results.length - 1][0].transcript;

      setAnswerTranscripts(prev => {

        const updated = [...prev];
        updated[currentQuestion - 1] = transcript;

        return updated;

      });

    };

    recognitionRef.current = recognition;

  }, [currentQuestion]);

  /* ---------------- AI Voice ---------------- */

  const speak = (text) => {

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;

    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(speech);
  };

  /* ---------------- Timer ---------------- */

  const startTimer = (duration) => {

    setTimer(duration);

    timerRef.current = setInterval(() => {

      setTimer(prev => {

        if (prev <= 1) {
          clearInterval(timerRef.current);
          endInterview();
          return 0;
        }

        return prev - 1;

      });

    }, 1000);
  };

  /* ---------------- Camera ---------------- */

  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current)
        videoRef.current.srcObject = stream;

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0)
          setRecordedChunks(prev => [...prev, e.data]);
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

      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;

    }
  };

  /* ---------------- Start Interview ---------------- */

  const startInterview = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (data.finished) {
        endInterview();
        return;
      }

      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;

      setQuestionText(data.question);
      setQuestionsAsked([data.question]);

      setCurrentQuestion(data.currentQuestion);
      setTotalQuestions(data.totalQuestions);

      setStarted(true);

      startTimer(data.duration);

      speak(data.question);

      questionStartRef.current = Date.now();

      recognitionRef.current?.start();

    } catch (error) {

      console.error("Start interview error:", error);

    }
  };

  /* ---------------- Next Question ---------------- */

  const nextQuestion = async () => {

    if (!sessionIdRef.current) return;

    const timeSpent =
      Math.floor((Date.now() - questionStartRef.current) / 1000);

    setInterviewLog(prev => [
      ...prev,
      { timeSpent }
    ]);

    try {

      const res = await fetch("http://localhost:5000/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current })
      });

      const data = await res.json();

      if (data.finished) {
        endInterview();
        return;
      }

      setQuestionText(data.question);
      setQuestionsAsked(prev => [...prev, data.question]);

      setCurrentQuestion(data.currentQuestion);

      speak(data.question);

      questionStartRef.current = Date.now();

      recognitionRef.current?.stop();
      recognitionRef.current?.start();

    } catch (error) {

      console.error("Next question error:", error);

    }
  };

  /* ---------------- Recording ---------------- */

  const stopRecording = () => {

    if (mediaRecorder && mediaRecorder.state !== "inactive") {

      mediaRecorder.stop();

      mediaRecorder.onstop = () => {

        const blob = new Blob(recordedChunks, {
          type: "video/webm"
        });

        setDownloadUrl(URL.createObjectURL(blob));

      };
    }
  };

  /* ---------------- End Interview ---------------- */

  const endInterview = async () => {

    const timeSpent =
      Math.floor((Date.now() - questionStartRef.current) / 1000);

    setInterviewLog(prev => [
      ...prev,
      { timeSpent }
    ]);

    try {

      clearInterval(timerRef.current);

      recognitionRef.current?.stop();

      speak("Interview ended. Thank you.");

      stopRecording();
      stopCamera();

      if (sessionIdRef.current) {

        await fetch("http://localhost:5000/api/interview/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current })
        });

      }

    } catch (error) {

      console.error("End interview error:", error);

    }

    navigate("/report", {
      state: {
        questions: questionsAsked,
        answerTranscripts: answerTranscripts,
        interviewLog: interviewLog,
        currentQuestion
      }
    });
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
}

export default Interview;