import Conversation from "../models/Conversation.js";
import { parseEvaluation } from "./parseEvaluation.js";

export async function getDashboardData(userId) {
  const allSessions = await Conversation.find({ userId }).sort({ createdAt: 1 });

  const updatePromises = [];

  const parsed = allSessions.map((session) => {
    const evaluation = parseEvaluation(session.messages);
    const isScored = evaluation?.isScored ?? false;

    if (isScored && session.status !== "completed") {
      updatePromises.push(
        Conversation.findByIdAndUpdate(session._id, {
          status:      "completed",
          score:       evaluation.avgScore,
          verdict:     evaluation.verdict,
          hire:        evaluation.hire,
          completedAt: new Date(),
        })
      );
    }

    return {
      id:            session._id,
      date:          session.createdAt,
      totalScore:    evaluation?.avgScore      ?? null,
      verdict:       evaluation?.verdict       ?? "Unknown",
      hire:          evaluation?.hire          ?? null,
      isScored,
      questionCount: evaluation?.questionCount ?? 0,
    };
  });

  await Promise.all(updatePromises);

  const completed = parsed.filter((s) => s.isScored);

  const avgScore = completed.length
    ? Math.round(
        completed.reduce((sum, s) => sum + s.totalScore, 0) / completed.length
      )
    : 0;

  return {
    sessions:      completed,
    totalSessions: completed.length,
    avgScore,
    hireCount:     completed.filter((s) => s.hire === true).length,
    noHireCount:   completed.filter((s) => s.hire === false).length,
    scoreOverTime: completed.map((s, i) => ({
      session: `#${i + 1}`,
      score:   s.totalScore,
      date:    s.date,
    })),
  };
}