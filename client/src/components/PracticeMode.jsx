import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/PracticeMode.module.css"; // ✅ FIX

function PracticeMode({ goBack }) {
  const navigate = useNavigate();

  const handleFullInterview = () => {
    navigate("/practice", {
      state: { mode: "full" }
    });
  };

  const handleTopicMode = () => {
    navigate("/topics");
  };

  return (
    <>
      <div className="bg-canvas"></div>
      <div className="grid-overlay"></div>

      <div className={styles.practiceModeContainer}>

        {/* HEADER */}
        <div className={styles.practiceHeader}>
          <button className={styles.backBtn} onClick={goBack}>← Back</button>
          <h2>Choose Your Topics</h2>
        </div>

        {/* TITLE */}
        <div className={styles.practiceTitle}>
          <h1>
            How do you want to <span className={styles.highlight}>practice</span>?
          </h1>
          <p>
            Choose a full interview covering all topics, or pick the ones you want to focus on.
          </p>
        </div>

        {/* OPTIONS */}
        <div className={styles.practiceOptions}>

          <div className={styles.optionCard} onClick={handleFullInterview}>
            <div className={styles.icon}>📚</div>
            <h3>Full Interview Prep</h3>
            <p>
              Cover all 12 topics — DSA, system design, SQL & more.
              Best for comprehensive preparation.
            </p>
          </div>

          <div className={styles.optionCard} onClick={handleTopicMode}>
            <div className={styles.icon}>🔍</div>
            <h3>Pick Specific Topics</h3>
            <p>
              Focus on what matters most to you.
              Select individual topics to practice.
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <div className={styles.practiceFooter}>
          <span className={styles.footerText}>Choose a preparation mode above</span>
          <button className={`${styles.startBtn} ${styles.disabled}`}>
            Start Practice →
          </button>
        </div>

      </div>
    </>
  );
}

export default PracticeMode;