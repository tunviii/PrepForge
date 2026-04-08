import React,{ useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";          // ← points to client/src/firebase.js
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import styles from "../styles/Dashboard.module.css";

export default function Dashboard({goBack}) {
  const [data, setData]       = useState(null);
  const [userId, setUserId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setError("Not logged in.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/dashboard?userId=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data.");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard.");
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className={styles.loading}>Loading...</div>;

  if (error)
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Progress <span>Dashboard</span></h1>
        <div className={styles.empty}>{error}</div>
      </div>
    );

  if (!data || data.totalSessions === 0)
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Progress <span>Dashboard</span></h1>
        <div className={styles.empty}>No completed interviews yet. Start practicing 🚀</div>
      </div>
    );

  const showChart = data.scoreOverTime?.length >= 2;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Progress <span>Dashboard</span></h1>

      {/* Stats */}
      <div className={styles.cardContainer}>
        <div className={styles.card}><h2>{data.totalSessions}</h2><p>Sessions</p></div>
        <div className={styles.card}><h2>{data.avgScore}/100</h2><p>Avg Score</p></div>
        <div className={styles.card}><h2>{data.hireCount}</h2><p>Hire</p></div>
        <div className={styles.card}><h2>{data.noHireCount}</h2><p>No Hire</p></div>
      </div>

      {/* Score Over Time */}
      <div className={styles.section}>
        <h3>Score Over Time</h3>
        {showChart ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.scoreOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="session" stroke="#888" />
              <YAxis domain={[0, 100]} stroke="#888" />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #00ff88" }}
              />
              <Line
                type="monotone" dataKey="score"
                stroke="#00ff88" strokeWidth={2} dot={{ fill: "#00ff88" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.placeholder}>
            Complete more sessions to see your trend.
          </div>
        )}
      </div>

      {/* Interview History Table */}
      <div className={styles.section}>
        <h3>Interview History</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Score</th>
              <th>Verdict</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {data.sessions.map((item, i) => (
              <tr key={item.id}>
                <td>{i + 1}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td style={{ color: "#00ff88" }}>{item.totalScore}/100</td>
                <td>{item.verdict}</td>
                <td>
                  <button className={item.hire ? styles.hireBtn : styles.noHireBtn}>
                    {item.hire ? "Hire" : "No Hire"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}