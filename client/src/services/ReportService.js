const ANTHROPIC_API_KEY = "YOUR_API_KEY_HERE";

export async function generateReport({
  questions,
  answerTranscripts,
  interviewLog,
  currentQuestion
}) {
  try {

    const answeredCount = Math.min(currentQuestion + 1, questions.length);

    const totalTime = interviewLog.reduce(
      (s, x) => s + (x.timeSpent || 0),
      0
    );

    const transcriptSummary = questions
      .map((q, i) => {

        const transcript = answerTranscripts[i];
        const timeSpent = interviewLog[i]
          ? interviewLog[i].timeSpent
          : 0;

        const wordCount = transcript
          ? transcript.trim().split(/\s+/).length
          : 0;

        if (!transcript || transcript === "(no speech detected)") {

          return `Q${i + 1}: "${q}"
Candidate answer: [Not answered]
Time spent: ${timeSpent}s
Word count: 0`;

        }

        return `Q${i + 1}: "${q}"
Candidate answer: "${transcript}"
Time spent: ${timeSpent}s
Word count: ${wordCount}`;

      })
      .join("\n\n");

    const prompt = `You are a senior technical interviewer at a FAANG-level company.

Evaluate the candidate as if this was a real interview.

Consider:
• correctness
• depth of reasoning
• clarity of explanation
• communication ability
• time spent thinking
• answer completeness

INTERVIEW DETAILS
Total Questions: ${questions.length}
Questions Answered: ${answeredCount}
Total Interview Time: ~${Math.round(totalTime / 60)} minutes

TRANSCRIPT
${transcriptSummary}

Return ONLY JSON:

{
  "totalScore": number,
  "confidenceScore": number,
  "verdict": "Strong Hire | Hire | Borderline | No Hire",
  "summary": "2-3 sentence summary",
  "hire": true or false,

  "strengths": [
    "strength 1",
    "strength 2"
  ],

  "weaknesses": [
    "weakness 1",
    "weakness 2"
  ],

  "categories": [
    {"name":"Technical Knowledge","score":number,"note":"text"},
    {"name":"Communication","score":number,"note":"text"},
    {"name":"Problem Solving","score":number,"note":"text"},
    {"name":"Time Management","score":number,"note":"text"}
  ],

  "questionFeedback":[
    {"score":number,"feedback":"text"}
  ]
}`;

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: prompt }
          ]
        })
      }
    );

    const data = await response.json();

    const raw = data.content[0].text
      .replace(/```json|```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return getFallbackReport(questions);
    }

    return parsed;

  } catch (err) {

    console.error("Report generation failed:", err);
    return getFallbackReport(questions);

  }
}

export function getFallbackReport(questions) {

  return {

    totalScore: 65,
    confidenceScore: 70,

    verdict: "Borderline",

    summary:
      "The interview completed successfully but AI evaluation could not be generated.",

    hire: false,

    strengths: [
      "Candidate attempted all questions",
      "Showed reasonable communication"
    ],

    weaknesses: [
      "Detailed technical analysis unavailable",
      "Answers could be more structured"
    ],

    categories: [

      {
        name: "Technical Knowledge",
        score: 65,
        note: "Detailed evaluation unavailable."
      },

      {
        name: "Communication",
        score: 70,
        note: "Candidate attempted responses."
      },

      {
        name: "Problem Solving",
        score: 60,
        note: "Detailed evaluation unavailable."
      },

      {
        name: "Time Management",
        score: 75,
        note: "Interview pacing appeared normal."
      }

    ],

    questionFeedback: questions.map(() => ({

      score: 12,

      feedback:
        "Response recorded but AI analysis could not be completed."

    }))
  };
}