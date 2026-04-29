import express from "express";
import aiService from "./utils/aiService.js"

const router = express.Router();
global.sessions = global.sessions || {};
const sessions = global.sessions;

//========= SYSTEM PROMPT ==============
  function getSystemPrompt() {
  return `
You are a strict campus placement technical interviewer conducting a full mock interview.

INTERVIEW STRUCTURE (exactly 10 questions, follow strictly):
1–2: Introduction & background  
3–5: Data Structures & Algorithms (DSA)  
6–7: CS Fundamentals (OS, CN, OOP)  
8–9: DBMS  
10: Behavioral  

CRITICAL RULES:
- Ask ONLY one question at a time
- Do NOT skip or reorder sections
- Increase difficulty gradually
- Do NOT repeat questions
- Keep questions realistic (like real placements)
- ALWAYS start from Question 1
- DO NOT generate DSA before Question 3

 FIRST MESSAGE (MANDATORY FORMAT):

Greetings! I'm your technical interviewer. Let's begin your interview.

Question 1: Tell me about yourself.

-DO NOT add anything else.
- DO NOT include feedback in the first message
- DO NOT include any report or structure
- DO NOT include extra explanation

Example:
Greetings! I'm your technical interviewer. Let's begin your interview.

AFTER EACH ANSWER:
- Give concise feedback (2–3 sentences)
- Mention what was correct
- Mention what was missing or weak
- Suggest improvement
- Then ask the next question

IMPORTANT:
- Keep track of question number internally (1–10)
- After Question 10 answer → DO NOT ask another question

FINAL RESPONSE (after Q10 only):

---
Interview Complete!

Overall Score: X/10

Section-wise Performance:
- Introduction: [Score] — [Remark]
- DSA: [Score] — [Remark]
- CS Fundamentals: [Score] — [Remark]
- DBMS: [Score] — [Remark]
- Behavioral: [Score] — [Remark]

Strengths:
- Point 1
- Point 2

Areas to Improve:
- Point 1 — Improvement
- Point 2 — Improvement

Final Suggestion:
1–2 lines of advice
---

RESPONSE FORMAT (VERY IMPORTANT):

Feedback:
<your feedback>

Next Question:
<your next question>

(For final response, ONLY return the report)
`;
}


// ================= API =================
router.post("/start", async (req, res) => {
  const sessionId = Date.now().toString();

  const systemPrompt = getSystemPrompt();

  sessions[sessionId] = {
    history: [
      { role: "system", content: systemPrompt }
    ],
    questionCount: 0
  };

  const aiReply = await aiService.generateReply(sessions[sessionId]);

  res.json({
    sessionId,
    message: aiReply,
    currentQuestion: 1,
    totalQuestions: 10,
    duration: 45 * 60
  });
});

router.post("/next", async (req, res) => {
  const { sessionId, answer } = req.body;
  const session = sessions[sessionId];

  if (!session) return res.status(400).json({ error: "Invalid session" });

  // Push user's answer
  session.history.push({ role: "user", content: answer });

  // Generate AI reply
  const aiReply = await aiService.generateReply(session);

  //  Push AI reply into history so it has memory of what it said
  session.history.push({ role: "assistant", content: aiReply });

  // Increment the question counter
  session.questionCount += 1;

  res.json({
    message: aiReply,
    currentQuestion: session.questionCount,
    finished: session.questionCount >= 10,
  });
});

router.post("/end", (req, res) => {
  res.json({ message: "Interview ended" });
});

router.post("/next", async (req, res) => {
  const { sessionId, answer } = req.body;
  const session = sessions[sessionId];

  if (!session) return res.status(400).json({ error: "Invalid session" });

  // Push user's answer
  session.history.push({ role: "user", content: answer });

  // Generate AI reply
  const aiReply = await aiService.generateReply(session);

  
  session.history.push({ role: "assistant", content: aiReply });

  
  session.questionCount += 1;

  res.json({
    message: aiReply,
    currentQuestion: session.questionCount,
    finished: session.questionCount >= 10,
  });
});

export default router;