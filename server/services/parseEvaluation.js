export function parseEvaluation(messages) {
  const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
  if (!lastMsg) return null;

  const text = lastMsg.content;

  const scoreMatches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*\/\s*10/g)];
  const scores = scoreMatches.map(m => parseFloat(m[1]));
  const avgScore = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10)
    : null;

  const verdictMatch = text.match(/(Strong Hire|Hire|Borderline|Reject)/i);
  const verdict = verdictMatch ? verdictMatch[1] : 'Unknown';
  const isScored = avgScore !== null && verdict !== 'Unknown';
  const hire    = isScored? !['Reject', 'Borderline'].includes(verdict): null;

  const userMessages = messages.filter(m => m.role === 'user');

  return { avgScore, verdict, hire, questionCount: userMessages.length, isScored };
}