import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/ReportScreen.module.css';
import { generateReport, getFallbackReport } from '../services/ReportService';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ReportScreen() {

  const { state } = useLocation();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!state) {
      navigate('/');
      return;
    }

    generateReport(state)
      .then((result) => {
        setReport(result);
        setLoading(false);
      })
      .catch(() => {
        setReport(getFallbackReport(state.questions));
        setLoading(false);
      });

  }, []);

  if (loading) {
    return <div>Generating Report...</div>;
  }

  return (

    <div style={{ padding: "40px" }}>

      <h1>Interview Report</h1>

      <h2>Score: {report.totalScore}/100</h2>

      <h3>Confidence Score: {report.confidenceScore}%</h3>

      <p>{report.summary}</p>

      <h3>Verdict: {report.verdict}</h3>

      <h2>Strengths</h2>

      <ul>
        {report.strengths.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <h2>Weaknesses</h2>

      <ul>
        {report.weaknesses.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>

      <h2>Category Scores</h2>

      {report.categories.map((cat, i) => (

        <div key={i} style={{ marginBottom: "10px" }}>

          <strong>{cat.name}</strong> : {cat.score}/100  
          <div>{cat.note}</div>

        </div>

      ))}

      <h2>Per Question Feedback</h2>

      {report.questionFeedback.map((q, i) => (

        <div key={i} style={{ marginBottom: "20px" }}>

          <strong>Question {i + 1}</strong> — Score {q.score}/20  
          <div>{q.feedback}</div>

        </div>

      ))}

    </div>

  );
}