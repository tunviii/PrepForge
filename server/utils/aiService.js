import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateReply(session) {

  try{
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: session.history,
    temperature: 0.7,
  });

  const reply = response.choices[0].message.content || "Error generating response"; 

  // Save AI response
  session.history.push({
    role: "assistant",
    content: reply,
  });

  session.questionCount++;

  return reply;
  
}catch (error) {
    console.error("Groq API error:", error);
    return "Sorry, something went wrong. Please try again.";
  }

}

export default { generateReply };