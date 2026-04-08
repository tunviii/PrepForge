import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Topics.module.css"; // ✅ FIX

function Topics({ goBack }) {
  const navigate = useNavigate();

  const topicsList = [
    { name: "Arrays & Strings", level: "Easy-Medium" },
    { name: "Linked Lists", level: "Medium" },
    { name: "Stacks & Queues", level: "Easy-Medium" },
    { name: "Trees & BST", level: "Medium-Hard" },
    { name: "Graphs", level: "Hard" },
    { name: "Dynamic Programming", level: "Hard" },
    { name: "Sorting & Searching", level: "Easy-Medium" },
    { name: "Recursion & Backtracking", level: "Medium-Hard" },
    { name: "Hashing", level: "Easy-Medium" },
    { name: "Bit Manipulation", level: "Medium" },
    { name: "SQL & Databases", level: "Medium" },
    { name: "System Design", level: "Hard" },
  ];

  const [selectedTopics, setSelectedTopics] = useState([]);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStart = () => {
    if (selectedTopics.length === 0) return;

    navigate("/practice", {
      state: {
        mode: "topics",
        topics: selectedTopics
      }
    });
  };

  // helper to map difficulty → class
  const getLevelClass = (level) => {
    if (level === "Easy-Medium") return styles.easyMedium;
    if (level === "Medium") return styles.medium;
    if (level === "Medium-Hard") return styles.mediumHard;
    if (level === "Hard") return styles.hard;
    return "";
  };

  return (
    <>
      <div className="bg-canvas"></div>
      <div className="grid-overlay"></div>

      <div className={styles.topicsContainer}>

        {/* HEADER */}
        <div className={styles.topicsHeader}>
          <button className={styles.backBtn} onClick={goBack}>← Back</button>
          <h2>Choose Your Topics</h2>
        </div>

        {/* TITLE */}
        <div className={styles.topicsTitle}>
          <h1>
            What do you want to <span className={styles.highlight}>practice</span>?
          </h1>
          <p>
            Select one or more topics. The AI interviewer will tailor questions accordingly.
          </p>
        </div>

        {/* GRID */}
        <div className={styles.topicsGrid}>
          {topicsList.map((topic, index) => {
            const isSelected = selectedTopics.includes(topic.name);

            return (
              <div
                key={index}
                className={`${styles.topicCard} ${isSelected ? styles.selected : ""}`}
                onClick={() => toggleTopic(topic.name)}
              >
                <h3 className={styles.topicTitle}>{topic.name}</h3>

                <span className={`${styles.level} ${getLevelClass(topic.level)}`}>
                  {topic.level}
                </span>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className={styles.topicsFooter}>
          <span className={styles.footerText}>
            {selectedTopics.length === 0
              ? "Select at least one topic"
              : `${selectedTopics.length} topic(s) selected`}
          </span>

          <button
            className={`${styles.startBtn} ${
              selectedTopics.length === 0 ? styles.disabled : ""
            }`}
            onClick={handleStart}
          >
            Start Practice →
          </button>
        </div>

      </div>
    </>
  );
}

export default Topics;