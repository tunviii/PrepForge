import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useLocation } from "react-router-dom";
import styles from "../styles/Practice.module.css"; // ✅ changed

function Practice({ goBack, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const bottomRef = useRef(null);
  const location = useLocation();

  const mode = location.state?.mode || "full";
  const topics = location.state?.topics || [];

  useEffect(() => {
    if (token) {
      startChat();
    }
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startChat() {
    const res = await fetch("http://localhost:5000/api/practice/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mode,
        topics,
      }),
    });

    const data = await res.json();
    setConversationId(data.conversationId);
    setMessages([{ sender: "bot", text: data.reply }]);
  }

  async function sendMessage() {
    const userMessage = isIdeOpen ? code : input;
    if (!userMessage.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    if (isIdeOpen) setCode("");
    else setInput("");

    const res = await fetch("http://localhost:5000/api/practice/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answer: userMessage, conversationId }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
  }

  useEffect(() => {
    fetch("/api/practice/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [token]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <div className="bg-canvas"></div>
      <div className="grid-overlay"></div>

      <div className={styles.chatSection}>
        <div className={styles.chatWrapper}>

          {/* HEADER */}
          <div className={styles.chatHeader}>
            <button className={styles.backBtn} onClick={goBack}>
              ← Back
            </button>
            <div className={styles.chatTitle}>Practice Mode</div>
          </div>

          {/* CHAT CONTAINER */}
          <div className={styles.chatContainer}>

            {/* MESSAGES */}
            <div className={styles.chatBox}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${
                    msg.sender === "bot" ? styles.bot : styles.user
                  }`}
                >
                  {msg.text?.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>

            {/* INPUT AREA */}
            <div className={styles.inputArea}>

              <button
                className={styles.toggleIdeBtn}
                onClick={() => setIsIdeOpen(!isIdeOpen)}
              >
                {isIdeOpen ? "✕ Close Editor" : "⌨ Open Code Editor"}
              </button>

              {!isIdeOpen && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
                  className={styles.chatTextarea}
                />
              )}

              {isIdeOpen && (
                <div className={styles.ideContainer}>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={styles.languageSelector}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="typescript">TypeScript</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>

                  <Editor
                    height="350px"
                    language={selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              )}

              <button className={styles.sendBtn} onClick={sendMessage}>
                Send →
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Practice;