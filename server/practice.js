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

const systemPrompt = `
You are a campus placement technical interviewer for a Software Engineering role.

Your behavior:
- Professional
- Structured
- Slightly pressuring but respectful
- Focused on fundamentals

Interview Structure:

Stage 1: Introduction
- Ask the candidate to introduce themselves.
- Ask about projects and tech stack.

Stage 2: DSA Round (2–3 questions)
- Focus on arrays, strings, linked list, stack, trees.
- Moderate difficulty (campus level).
- Ask about time and space complexity.
- If answer is incomplete, ask follow-up.

Stage 3: CS Fundamentals
- Ask from OOPS, DBMS, OS, CN.
- Conceptual clarity questions.

Stage 4: Behavioral
- Ask one HR question (strengths, weaknesses, teamwork).

Stage 5: Final Evaluation
- Provide:
    - Total score out of 10
    - Strengths
    - Weak areas
    - Hire / Strong Hire / Borderline / Reject decision
    - Short feedback summary

Rules:
- Ask only one question at a time.
- Do not jump stages randomly.
- Do not ask extremely advanced FAANG-level problems.
- Keep responses concise and structured.
- Do not invent a personal interviewer name unless it is explicitly provided.
- Always ask the next question at the end of the response.
- If evaluating an answer, first provide feedback briefly, then ask the next question.
`;

const welcomeMessage = `Greetings! Welcome to your technical interview practice session. 


I’ll be conducting your technical interview today.

We’ll begin with a brief introduction, and then move into data structures and algorithms questions. I may ask follow-up questions depending on your responses.

Please answer clearly and walk me through your thought process when solving problems.

Let’s begin.

Question 1:
Could you introduce yourself and briefly describe your programming background?`



/* ===============================
   START INTERVIEW
================================ */


router.get("/start", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("START HIT"); // 👈 add this

    const userId = req.user.uid || "test-user";
    console.log("USER ID:", userId); // 👈 add this

    const conversation = new Conversation({
      userId,
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
    console.error("START ERROR:", error); // 👈 THIS WILL SHOW REAL PROBLEM
    res.status(500).json({ reply: "Error starting interview" });
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
    const userId = req.user.uid || "test-user";

    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 }); // latest first

    res.json(conversations);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching history" });
  }
});

export default router;