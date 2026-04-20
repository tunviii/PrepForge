import dotenv from "dotenv";
import Conversation from "./models/Conversation.js";
import { verifyFirebaseToken } from "./middleware/authMiddleware.js";
dotenv.config();
import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ===============================
   HELPERS
================================ */

const sanitizeMessages = (messages) => {
  return messages.map(({ role, content }) => ({
    role,
    content,
  }));
};

const normalizeTopic = (topic) => {
  if (!topic) return "General";
  return topic.split("/")[0].trim();
};

/* ===============================
   SYSTEM PROMPT
================================ */

function generateSystemPrompt(mode, topics) {

  // CASE 1: Topic-based mode
  if (mode === "topics" && topics?.length > 0) {
    return `
You are a technical interviewer conducting a campus placement interview.

The candidate has chosen to practice ONLY the following topics:
${Array.isArray(topics) ? topics.join(", ") : "General Topics"}

STRICT RULES:
- Ask questions ONLY from these topics
- Do NOT ask anything outside these topics
- Ask follow-up questions within the same topic
- Increase difficulty gradually
- If the user asks or answers something outside selected topics:
  → Politely redirect them back to the selected topics

QUESTION FORMAT:
- Ask ONE question at a time
- After each answer:
  → Give focused feedback (2-3 sentences)
  → Mention what was correct and what was missing or wrong
  → Suggest how the answer could have been better or more complete
  → Then ask the next question

You will ask exactly 10 questions total. Keep track internally.
After the candidate answers Question 10, do NOT ask another question.
Instead, provide a FINAL REPORT in this exact format:

---
**Interview Complete!**

**Overall Score: X/10**

**Topic-wise Performance:**
- [Topic]: [Score] — [Brief remark]

**Strengths:**
- [Point 1]
- [Point 2]

**Areas to Improve:**
- [Point 1] — [Suggested improvement]
- [Point 2] — [Suggested improvement]

**Final Suggestion:**
[1-2 sentences of overall advice]
---
`;
  }

  // CASE 2: Full placement interview (default)
  return `
You are a campus placement technical interviewer conducting a complete mock interview.

INTERVIEW STRUCTURE (10 questions total, follow this order strictly):
- Questions 1–2:   Introduction & background
- Questions 3–5:   Data Structures & Algorithms (DSA)
- Questions 6–7:   CS Fundamentals (OS, Computer Networks, OOP concepts)
- Questions 8–9:   DBMS (SQL queries, normalization, transactions, indexing)
- Question  10:    Behavioral (situational, teamwork, problem-solving attitude)

STRICT RULES:
- Follow the structure above in order — do NOT skip or shuffle sections
- Ask ONE question at a time
- Increase difficulty gradually within each section
- Do NOT repeat questions

AFTER EACH ANSWER:
- Suggest how the answer could have been better or more complete
- Then ask the next question in the structure

Keep track of the question number internally (1 through 10).
After the candidate answers Question 10, do NOT ask another question.
Instead, provide a FINAL REPORT in this exact format:

---
**Interview Complete!**

**Overall Score: X/10**

**Topic-wise Performance:**
- Introduction: [Score] — [Brief remark]
- DSA: [Score] — [Brief remark]
- CS Fundamentals: [Score] — [Brief remark]
- DBMS: [Score] — [Brief remark]
- Behavioral: [Score] — [Brief remark]

**Strengths:**
- [Point 1]
- [Point 2]

**Areas to Improve:**
- [Point 1] — [Suggested improvement]
- [Point 2] — [Suggested improvement]

**Final Suggestion:**
[1-2 sentences of overall advice for the candidate]
---
`;
}

/* ===============================
   WELCOME MESSAGE
================================ */

function generateWelcomeMessage(mode, topics) {
  if (mode === "topics" && topics?.length > 0) {
    return `
Welcome to your focused interview practice session!

We will cover ONLY the following topics:
${Array.isArray(topics) ? topics.join(", ") : "General Topics"}

This session consists of **10 questions**. After each answer, I'll give you feedback and suggest improvements. At the end, you'll receive a detailed performance report with your score out of 10.

Let's begin!

**Question 1:**
Please introduce yourself and tell me about your experience with the selected topics.
`;
  }

  return `
Greetings! Welcome to your campus placement mock interview session.

I'll be your interviewer today. This session consists of **10 questions** covering:
- Introduction & Background
- Data Structures & Algorithms
- CS Fundamentals (OS, Networks, OOP)
- DBMS
- Behavioral

After each of your answers, I'll give you feedback and suggest improvements. At the end of all 10 questions, you'll receive a **detailed performance report** with an overall score out of 10.

Please answer clearly and walk me through your thought process when solving problems.

Let's begin!

**Question 1:**
Could you introduce yourself and briefly describe your programming background and any projects you've worked on?
`;
}

/* ===============================
   START INTERVIEW
================================ */

router.post("/start", verifyFirebaseToken, async (req, res) => {
  try {
    const { mode = "full", topics = [] } = req.body || {};

    console.log("START HIT");
    console.log("MODE:", mode);
    console.log("TOPICS:", topics);

    const userId = req.user?.uid || "test-user";

    const systemPrompt = generateSystemPrompt(mode, topics);
    const welcomeMessage = generateWelcomeMessage(mode, topics);

    const conversation = new Conversation({
      userId,
      mode,
      topics,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "assistant", content: welcomeMessage },
      ],
    });

    await conversation.save();

    res.json({
      reply: welcomeMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("START ERROR:", error);
    res.status(500).json({ reply: error.message });
  }
});

/* ===============================
   HANDLE ANSWERS
================================ */

router.post("/answer", verifyFirebaseToken, async (req, res) => {
  try {
    const { answer, conversationId } = req.body;
    const userId = req.user?.uid || "test-user";

    const conversation = await Conversation.findById(conversationId);

    if (!conversation)
      return res.status(404).json({ reply: "Conversation not found" });

    if (conversation.userId !== userId)
      return res.status(403).json({ reply: "Unauthorized" });

    // Count evaluated answers so far to know which question we're on
    const answeredCount = conversation.messages.filter(
      (m) => m.role === "assistant" && m.evaluation
    ).length;

    // Save user message
    conversation.messages.push({
      role: "user",
      content: answer,
    });

    /* ======================
       AI CALL 1 — CHAT
    ====================== */

    const isLastQuestion = answeredCount + 1 >= 10;

    const chatResponse = await groq.chat.completions.create({
      messages: [
        ...sanitizeMessages(conversation.messages),
        {
          role: "system",
          content: isLastQuestion
            ? `
This was Question 10, the final question of the interview.
Give focused feedback on this last answer, then immediately provide the full FINAL REPORT as specified in your instructions.
Do NOT ask any more questions after the report.
            `
            : `
You are a technical interviewer.

- Give focused feedback on the candidate's answer (2-3 sentences)
- Mention what was correct and what was missing or wrong
- Suggest a better or more complete version of the answer
- Then ask the next question according to the interview structure
- Ask ONE question only
- Increase difficulty gradually
- DO NOT return JSON
- DO NOT end the interview yet — there are still more questions remaining
            `,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    const reply = chatResponse.choices[0].message.content;

    /* ======================
       AI CALL 2 — EVALUATION
    ====================== */
    const evaluationResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are evaluating a candidate's answer in a placement interview.

Based on the question asked and the answer given, return ONLY valid JSON with no extra text, no markdown, no code fences:
{
  "topic": "one of: Introduction, DSA, CS Fundamentals, DBMS, Behavioral",
  "correct": true or false,
  "score": a number from 0 to 10
}
`,
        },
        ...sanitizeMessages(conversation.messages.slice(-2)),
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0,
    });

    let evaluation;

    try {
      evaluation = JSON.parse(
        evaluationResponse.choices[0].message.content
      );
    } catch {
      evaluation = { topic: "General", correct: false, score: 0 };
    }

    // Ensure score is a safe finite number
    const safeScore = Number(evaluation.score);
    evaluation.score = Number.isFinite(safeScore) ? safeScore : 0;

    // Save assistant message with evaluation metadata
    conversation.messages.push({
      role: "assistant",
      content: reply,
      evaluation,
    });

    /* ======================
       TOPIC STATS
    ====================== */

    if (!conversation.topicStats) {
      conversation.topicStats = [];
    }

    const currentTopic =
      normalizeTopic(evaluation.topic) ||
      (conversation.mode === "topics"
        ? conversation.topics[0]
        : "General");

    let topicEntry = conversation.topicStats.find(
      (t) => t.topic === currentTopic
    );

    if (!topicEntry) {
      topicEntry = {
        topic: currentTopic,
        questions: 0,
        correct: 0,
        score: 0,
      };
      conversation.topicStats.push(topicEntry);
    }

    topicEntry.questions += 1;
    if (evaluation.correct) topicEntry.correct += 1;
    topicEntry.score += evaluation.score;

    /* ======================
       COMPLETION CHECK
    ====================== */

    const newAnsweredCount = conversation.messages.filter(
      (m) => m.role === "assistant" && m.evaluation
    ).length;

    if (newAnsweredCount >= 10) {
      conversation.status = "completed";
      conversation.completedAt = new Date();
    }

    await conversation.save();

    res.json({ reply });
  } catch (error) {
    console.error("ANSWER ROUTE ERROR:", error);
    res.status(500).json({ reply: "Server error." });
  }
});

/* ===============================
   RESET
================================ */

router.post("/reset", verifyFirebaseToken, async (req, res) => {
  try {
    const { conversationId } = req.body;

    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Interview reset." });
  } catch (error) {
    console.error("RESET ERROR:", error);
    res.status(500).json({ message: "Error resetting interview" });
  }
});

/* ===============================
   HISTORY
================================ */

router.get("/history", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user?.uid || "test-user";

    const conversations = await Conversation.find({ userId }).sort({
      createdAt: -1,
    });

    res.json(conversations);
  } catch (error) {
    console.error("HISTORY ERROR:", error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;