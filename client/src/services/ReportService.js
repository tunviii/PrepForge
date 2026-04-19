export async function generateReport({ questions, answerTranscripts, interviewLog, currentQuestion }) {
  const answeredCount = Math.min(currentQuestion + 1, questions.length);
  const totalTime = interviewLog.reduce((s, x) => s + (x.timeSpent || 0), 0);

  const transcriptSummary = questions
    .map((q, i) => {
      const transcript = answerTranscripts[i];
      const timeSpent = interviewLog[i] ? interviewLog[i].timeSpent : 0;
      if (!transcript || transcript === '(no speech detected)') {
        return `Q${i + 1}: "${q}"\nCandidate answer: [Not answered / no speech detected]\nTime spent: ${timeSpent}s`;
      }
      return `Q${i + 1}: "${q}"\nCandidate answer: "${transcript}"\nTime spent: ${timeSpent}s`;
    })
    .join('\n\n');

  const hasRealTranscripts = answerTranscripts.some(
    (t) => t && t !== '(no speech detected)'
  );

  const prompt = `You are a senior technical interviewer at a top FAANG-level tech company. You just conducted a real mock interview. Below are the exact questions asked and the candidate's actual spoken answers (transcribed via speech recognition).

INTERVIEW DETAILS:
- Total questions: ${questions.length}
- Questions with answers: ${answeredCount}
- Total time used: ~${Math.round(totalTime / 60)} minutes
- Format: Voice interview — answers were spoken aloud

TRANSCRIPT:
${transcriptSummary}

${
  hasRealTranscripts
    ? 'Evaluate the candidate strictly based on their actual spoken answers above. Be specific in your feedback — quote or reference what they said. Score honestly.'
    : 'NOTE: Speech recognition did not capture answers (possibly due to browser/mic issues). Evaluate based on completion behavior and time spent per question.'
}

Rules:
- Score each question out of 20 based on answer quality, depth, and correctness
- Be specific and honest — if an answer was weak, vague, or wrong, say so
- For DSA questions, check if they explained the approach, time/space complexity
- For behavioral, check for structure (STAR method), specifics, and relevance
- Total score should reflect the weighted average of question scores

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "totalScore": <0-100>,
  "verdict": "<Strong Hire | Hire | Borderline | No Hire>",
  "summary": "<2-3 honest sentences summarizing overall performance>",
  "hire": <true or false>,
  "categories": [
    {"name": "Technical Knowledge", "score": <0-100>, "note": "<specific observation>"},
    {"name": "Communication", "score": <0-100>, "note": "<specific observation>"},
    {"name": "Problem Solving", "score": <0-100>, "note": "<specific observation>"},
    {"name": "Time Management", "score": <0-100>, "note": "<specific observation>"}
  ],
  "questionFeedback": [
    {"score": <0-20>, "feedback": "<specific feedback referencing what they said>"}
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const raw = data.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
}

export function getFallbackReport(questions) {
  return {
    totalScore: 70,
    verdict: 'Hire',
    summary:
      'The candidate completed the interview session. A detailed AI analysis could not be generated at this time, but based on completion behavior the candidate showed reasonable engagement.',
    hire: true,
    categories: [
      { name: 'Technical Knowledge', score: 70, note: 'Unable to evaluate in detail.' },
      { name: 'Communication',       score: 70, note: 'Candidate engaged with all questions.' },
      { name: 'Problem Solving',     score: 65, note: 'Unable to evaluate in detail.' },
      { name: 'Time Management',     score: 75, note: 'Pacing appeared reasonable.' },
    ],
    questionFeedback: questions.map(() => ({
      score: 14,
      feedback: 'Response was recorded. Detailed AI analysis unavailable.',
    })),
  };
}