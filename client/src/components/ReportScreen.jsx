import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/ReportScreen.module.css';
import { generateReport, getFallbackReport } from '../services/ReportService';
import { useLocation, useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────
   Sub-components (kept in same file to
   match the flat component style of your
   existing codebase)
───────────────────────────────────────── */

const R            = 38;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ScoreCircle({ score, color }) {
  const arcRef = useRef(null);

  useEffect(() => {
    const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
    requestAnimationFrame(() => {
      if (arcRef.current) arcRef.current.style.strokeDashoffset = String(offset);
    });
  }, [score]);

  return (
    <div className={styles.scoreCircle}>
      <svg viewBox="0 0 90 90" width="90" height="90">
        <circle className={styles.track} cx="45" cy="45" r={R} />
        <circle
          ref={arcRef}
          className={styles.fill}
          cx="45" cy="45" r={R}
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <div className={styles.scoreInner}>
        <div className={styles.scoreNum} style={{ color }}>{score}</div>
        <div className={styles.scoreDenom}>/100</div>
      </div>
    </div>
  );
}

function CategoryCard({ name, score, note }) {
  const fillRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (fillRef.current) fillRef.current.style.width = `${score}%`;
    });
  }, [score]);

  return (
    <div className={styles.catCard}>
      <div className={styles.catHeader}>
        <div className={styles.catName}>{name}</div>
        <div className={styles.catScore}>{score}/100</div>
      </div>
      <div className={styles.catBar}>
        <div ref={fillRef} className={styles.catFill} style={{ width: '0%' }} />
      </div>
      <div className={styles.catNote}>{note}</div>
    </div>
  );
}

function QuestionFeedbackCard({ index, question, score, feedback }) {
  return (
    <div className={styles.qFeedCard}>
      <div className={styles.qFeedTop}>
        <div className={styles.qFeedNum}>{index + 1}</div>
        <div className={styles.qFeedQ}>{question}</div>
        <div className={styles.qFeedScore}>{score}/20</div>
      </div>
      <div className={styles.qFeedText}>{feedback}</div>
    </div>
  );
}

function HireBanner({ hire }) {
  return (
    <div className={`${styles.hireBanner} ${hire ? styles.hire : styles.noHire}`}>
      <div className={styles.hireIcon}>{hire ? '🏆' : '❌'}</div>
      <div>
        <div className={hire ? styles.hireTitleHire : styles.hireTitleNoHire}>
          {hire ? 'Recommendation: Hire' : 'Recommendation: No Hire'}
        </div>
        <div className={styles.hireSub}>
          {hire
            ? 'This candidate demonstrated sufficient skills for the role. Consider moving to the next round.'
            : 'This candidate needs more preparation before being considered for this role.'}
        </div>
      </div>
    </div>
  );
}


function UserMicIndicator({ isListening }) {
  return (
    <div className={`${styles.userMic} ${isListening ? styles.userMicListening : ''}`}>
      <div className={styles.userMicBars}>
        {[...Array(5)].map((_, i) => <div key={i} className={styles.userMicBar} />)}
      </div>
      <span className={styles.userMicLbl}>Listening…</span>
    </div>
  );
}

function StatusBar({ recStatus = '⏺ Not recording' }) {
  return (
    <div className={styles.statusbar}>
      <div className={styles.statusItem}><span className={styles.sdotGreen} /> PrepForge AI</div>
      <div className={styles.statusSep} />
      <div className={styles.statusItem}>🔒 Private Session</div>
      <div className={styles.statusSep} />
      <div className={styles.statusItem}>{recStatus}</div>
      <div className={styles.statusSep} />
      <div className={styles.statusItem}>No hints · No retries</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
   Props:
     questions         string[]
     answerTranscripts string[]
     interviewLog      { timeSpent: number }[]
     currentQuestion   number
     isListening       boolean
     recStatus         string
───────────────────────────────────────── */
export default function ReportScreen({
  questions        = [],
  answerTranscripts = [],
  interviewLog     = [],
  currentQuestion  = 0,
  isListening      = false,
  recStatus        = '⏺ Not recording',
}) {
   const { state } = useLocation();
  const navigate  = useNavigate();
  if (!state?.questions) {
    navigate('/');
    return null;
  }
  const [loading, setLoading] = useState(true);
  const [report,  setReport]  = useState(null);

  useEffect(() => {
    let cancelled = false;

    generateReport({ questions, answerTranscripts, interviewLog, currentQuestion })
      .then((result) => { if (!cancelled) { setReport(result); setLoading(false); } })
      .catch((err)   => {
        console.error(err);
        if (!cancelled) { setReport(getFallbackReport(questions)); setLoading(false); }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scoreColor =
    report?.totalScore >= 75 ? 'var(--green)'  :
    report?.totalScore >= 50 ? '#ffbe00'        : 'var(--red)';

  const now = new Date().toLocaleString();

  return (
    <>
      <div className={styles.reportScreen}>
        <div className={styles.reportWrap}>

          {loading ? (
            <div className={styles.reportLoading}>
              <div className={styles.loadingSpinner} />
              <div className={styles.loadingText}>AI is analyzing your interview…</div>
              <div className={styles.loadingSub}>This takes about 10–15 seconds</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={styles.reportHeader}>
                <div>
                  <div className={styles.reportTitle}>Performance <span>Report</span></div>
                  <div className={styles.reportMeta}>PrepForge AI · {now}</div>
                </div>
              </div>

              {/* Score */}
              <div className={styles.scoreRow}>
                <ScoreCircle score={report.totalScore} color={scoreColor} />
                <div className={styles.scoreRight}>
                  <div className={styles.scoreVerdict} style={{ color: scoreColor }}>{report.verdict}</div>
                  <div className={styles.scoreSummary}>{report.summary}</div>
                </div>
              </div>

              {/* Categories 2×2 */}
              <div className={styles.catsGrid}>
                {report.categories.map((cat) => (
                  <CategoryCard key={cat.name} name={cat.name} score={cat.score} note={cat.note} />
                ))}
              </div>

              {/* Per-question */}
              <div className={styles.qFeedbacks}>
                <div className={styles.qSectionLabel}>Per-Question Breakdown</div>
                {questions.map((q, i) => {
                  const fb = report.questionFeedback[i] || { score: 0, feedback: 'Not attempted.' };
                  return (
                    <QuestionFeedbackCard
                      key={i} index={i} question={q}
                      score={fb.score} feedback={fb.feedback}
                    />
                  );
                })}
              </div>

              {/* Hire banner */}
              <HireBanner hire={report.hire} />

              <div className={styles.reportActions}>

</div>
            </>
          )}
        </div>

        <UserMicIndicator isListening={isListening} />
      </div>

      <StatusBar recStatus={recStatus} />
    </>
  );
}