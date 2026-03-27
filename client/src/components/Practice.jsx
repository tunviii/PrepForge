import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import '../styles/Practice.css';

function Practice({ goBack, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const bottomRef = useRef(null);

  useEffect(() => {
    if(token){
      startChat();
    }
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startChat() {
    const res = await fetch("http://localhost:5000/api/practice/start", {
      headers: {
        Authorization: `Bearer ${token}`
      }
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
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answer: userMessage, conversationId }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
  }

  fetch("/api/practice/history", {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

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

      <div id="chatSection">
        <div className="chat-wrapper">

          {/* HEADER */}
          <div className="chat-header">
            <button className="back-btn" onClick={goBack}>← Back</button>
            <div className="chat-title">Practice Mode</div>
          </div>

          {/* CHAT CONTAINER */}
          <div className="chat-container">

            {/* MESSAGES */}
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  {msg.text?.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>

            {/* INPUT AREA */}
            <div className="input-area">

              <button
                className="toggle-ide-btn"
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
                  className="chat-textarea"
                />
              )}

              {isIdeOpen && (
                <div className="ide-container">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="language-selector"
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

              <button className="send-btn" onClick={sendMessage}>
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