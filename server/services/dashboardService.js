import Conversation from "../models/Conversation.js";
import { parseEvaluation } from "./parseEvaluation.js";
import User from "../models/User.js"; 

export async function getDashboardData(userId) {
  const user = await User.findOne({ uid: userId });
  const allSessions = await Conversation.find({ userId }).sort({ createdAt: 1 });

  const parsed = allSessions.map((session) => {
    const evaluation = parseEvaluation(session.messages, session);
    const isScored = evaluation?.isScored ?? false;

    return {
      name: user?.name || "User",
      id: session._id,
      date: session.createdAt,
      totalScore: evaluation?.avgScore ?? 0,
      verdict: evaluation?.verdict ?? "Pending",
      hire: evaluation?.hire ?? null,
      isScored,
      questionCount: evaluation?.questionCount ?? 0,
      topicStats: session.topicStats || [],
      mode: session.mode,
    };
  });

  // Only full completed interviews
  const completed = parsed.filter(
    (s) =>
      s.isScored &&
      s.mode === "full" &&
      s.verdict !== "Pending"
  );

  const avgScore = completed.length
    ? Math.round(
        completed.reduce((sum, s) => sum + s.totalScore, 0) /
          completed.length
      )
    : 0;

  // Topic analytics uses ALL sessions
  const topicMap = {};

  parsed.forEach((session) => {
    if (!session.topicStats) return;

    session.topicStats.forEach((t) => {
      if (!topicMap[t.topic]) {
        topicMap[t.topic] = {
          topic: t.topic,
          questions: 0,
          correct: 0,
          totalScore: 0,
          attempts: 0,
        };
      }

      topicMap[t.topic].questions += t.questions || 0;
      topicMap[t.topic].correct += t.correct || 0;
      topicMap[t.topic].totalScore += t.score || 0;
      topicMap[t.topic].attempts += 1;
    });
  });

  const topicAnalytics = Object.values(topicMap).map((t) => ({
    topic: t.topic,
    accuracy: t.questions
      ? Math.round((t.correct / t.questions) * 100)
      : 0,
    avgScore: t.attempts
      ? Math.round(t.totalScore / t.attempts)
      : 0,
  }));

  const heatmapMap = {};

  completed.forEach((s) => {
    if (!s.date) return;

    const date = new Date(s.date).toISOString().split("T")[0];
    heatmapMap[date] = (heatmapMap[date] || 0) + 1;
  });

  const heatmap = Object.entries(heatmapMap).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    name: user?.name || "User",
    sessions: completed,
    totalSessions: completed.length,
    avgScore,
    hireCount: completed.filter((s) => s.hire === true).length,
    noHireCount: completed.filter((s) => s.hire === false).length,
    scoreOverTime: completed.map((s, i) => ({
      session: `#${i + 1}`,
      score: s.totalScore,
      date: s.date,
    })),
    topicAnalytics,
    heatmap,
  };
}