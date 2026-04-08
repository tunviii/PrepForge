import dotenv from "dotenv";
import Conversation from "./models/Conversation.js";
import {verifyFirebaseToken} from "./middleware/authMiddleware.js";
dotenv.config();
import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
/* ===============================
   SYSTEM PROMPT
================================ */

function generateSystemPrompt(mode, topics) {

  // 🔥 CASE 1: Topic-based mode
  if (mode === "topics" && topics?.length > 0) {
    return `
You are a technical interviewer.

The candidate has chosen to practice ONLY the following topics:
${Array.isArray(topics) ? topics.join(", ") : "General Topics"}

STRICT RULES:
- Ask questions ONLY from these topics
- Do NOT ask anything outside these topics
- Stay within DSA if topics are DSA-related
- Do NOT include HR, OS, DBMS unless explicitly selected
- Ask follow-up questions within the same topic
- Increase difficulty gradually

Behavior:
- Professional
- Structured
- Slightly challenging

Rules:
- Ask ONE question at a time
- After each answer:
  → Give short feedback
  → Ask next question from SAME topic
- Do NOT jump randomly between topics
-If the user asks or answers something outside selected topics:
→ Politely redirect them back to the selected topics.
End:
- Give score out of 10
- Strengths
- Weak areas
`;
  }

  // 🔥 CASE 2: Full interview (default)
  return `
You are a campus placement technical interviewer.

Follow full interview structure:
- DSA
- CS Fundamentals
- Behavioral

Rules:
- Ask one question at a time
- Keep it structured
`;
}

function generateWelcomeMessage(mode, topics) {
  if (mode === "topics" && topics?.length > 0) {
    return `
Welcome to your focused interview practice.

We will ONLY cover:
${Array.isArray(topics) ? topics.join(", ") : "General Topics"}

Let’s begin.

Question 1:
Introduce yourself and your experience with these topics.
`;
  }

  return `
Greetings! Welcome to your technical interview practice session. 


I’ll be conducting your technical interview today.

We’ll begin with a brief introduction, and then move into data structures and algorithms questions. I may ask follow-up questions depending on your responses.

Please answer clearly and walk me through your thought process when solving problems.

Let’s begin.

Question 1:
Could you introduce yourself and briefly describe your programming background?
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
        { role: "assistant", content: welcomeMessage }
      ]
    });

    await conversation.save();

    res.json({
      reply: welcomeMessage,
      conversationId: conversation._id
    });

  } catch (error) {
    console.error("START ERROR:", error);
    res.status(500).json({ reply: error.message });
  }
});

/* ===============================
   HANDLE ANSWERS
================================ */

router.post("/answer", async (req, res) => {
  try {
    const { answer, conversationId } = req.body;

    // 🔥 FETCH CONVERSATION FROM DB
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ reply: "Conversation not found" });
    }

    // Add user message
    conversation.messages.push({
      role: "user",
      content: answer
    });

    // Call AI (use DB messages)
    const completion = await groq.chat.completions.create({
      messages: conversation.messages,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Add AI reply
    conversation.messages.push({
      role: "assistant",
      content: reply
    });

    // 🔥 SAVE BACK TO DB
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

router.post("/reset", async (req, res) => {
  try {
    const { conversationId } = req.body;

    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Interview reset." });

  } catch (error) {
    res.status(500).json({ message: "Error resetting interview" });
  }
});

/* ===============================
   HISTORY
================================ */

router.get("/history", verifyFirebaseToken,async (req, res) => {
  try {
    const userId = req.user?.uid || "test-user";

    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 }); // latest first

    res.json(conversations);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;