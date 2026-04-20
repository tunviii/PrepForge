export function parseEvaluation(messages, session) {
  const evalMessages = messages.filter(
    (m) => m.role === "assistant" && m.evaluation
  );

  if (!evalMessages.length) return null;

  const scores = evalMessages.map((m) =>
    Number.isFinite(Number(m.evaluation.score))
      ? Number(m.evaluation.score)
      : 0
  );

  const avgScore = Math.round(
    (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
  );

  const topicMap = {};

  evalMessages.forEach((m) => {
    const { topic, score, correct } = m.evaluation;

    if (!topicMap[topic]) {
      topicMap[topic] = {
        topic,
        questions: 0,
        correct: 0,
        score: 0,
      };
    }

    topicMap[topic].questions += 1;
    topicMap[topic].score += score || 0;

    if (correct) topicMap[topic].correct += 1;
  });

  //  verdict logic
  const isFull = session.mode === "full";
  const isCompleted = session.status === "completed";

  let verdict = "Pending";
  let hire = null;

  if (isFull && isCompleted) {
    verdict = avgScore >= 70 ? "Hire" : "Reject";
    hire = avgScore >= 70;
  }

  return {
    avgScore,
    verdict,
    hire,
    questionCount: evalMessages.length,
    isScored: true,
    topicStats: Object.values(topicMap),
  };
}