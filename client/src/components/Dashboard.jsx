import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Dashboard.module.css";
import axios from "axios";
import {
  FaTrophy,
  FaBullseye,
  FaFire,
  FaBrain,
  FaArrowRight,
  FaChartLine
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/* UI COMPONENTS */

const Card = ({ children, className = "" }) => (
  <div className={`${styles.card} ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className={styles.cardHeader}>{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className={styles.cardTitle}>{children}</h3>
);

const CardContent = ({ children }) => (
  <div className={styles.cardContent}>{children}</div>
);

const Progress = ({ value = 0 }) => (
  <div className={styles.progressRoot}>
    <div
      className={styles.progressIndicator}
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </div>
);

const Button = ({ children, onClick }) => (
  <button className={styles.button} onClick={onClick}>
    {children}
  </button>
);

/* MAIN COMPONENT */

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const res = await axios.get(
          "http://localhost:5000/api/dashboard",
          {
            params: { userId: user.uid },
          }
        );

        setDashboardData(res.data);
      } catch (err) {
        console.error(err);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!dashboardData) {
    return <div className={styles.container}>Loading...</div>;
  }

  /* STATS */
  const stats = [
    { label: "Sessions", value: dashboardData.totalSessions, icon: FaBullseye },
    { label: "Avg Score", value: `${dashboardData.avgScore}%`, icon: FaTrophy },
    { label: "Hires", value: dashboardData.hireCount, icon: FaFire },
    { label: "Rejects", value: dashboardData.noHireCount, icon: FaBrain },
  ];

  const performanceData = dashboardData.scoreOverTime || [];

  /* STRENGTHS & WEAKNESSES */
  const strengths = [...dashboardData.topicAnalytics]
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3);

  const weaknesses = [...dashboardData.topicAnalytics]
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3);

  /* HEATMAP */
  const generateHeatmapGrid = (heatmapData) => {
    const map = {};
    heatmapData.forEach((d) => (map[d.date] = d.count));

    const weeks = [];
    const start = new Date();
    start.setDate(start.getDate() - 90);

    for (let w = 0; w < 13; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const key = date.toISOString().split("T")[0];
        week.push(map[key] || 0);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const heatmapData = generateHeatmapGrid(dashboardData.heatmap || []);

  const heatColor = (v) => {
    if (v === 0) return styles.heat0;
    if (v < 2) return styles.heat1;
    if (v < 4) return styles.heat2;
    if (v < 6) return styles.heat3;
    return styles.heat4;
  };

  /* STREAK CALCULATION */
  const calculateStreak = () => {
    const dates = (dashboardData.heatmap || [])
      .map((d) => d.date)
      .sort()
      .reverse();

    let streak = 0;
    let current = new Date();

    for (let d of dates) {
      const date = new Date(d);
      const diff = Math.floor((current - date) / (1000 * 60 * 60 * 24));

      if (diff === 0 || diff === 1) {
        streak++;
        current = date;
      } else break;
    }

    return streak;
  };

  const streak = calculateStreak();

  /* SMART RECOMMENDATION */
  const weakestTopic = weaknesses[0];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div>
          <h1 className={styles.title}>
            Welcome back, <span className={styles.gradient}>User</span>
          </h1>
          <p className={styles.subtitle}>Here's your preparation overview</p>
        </div>

        {/* Stats */}
        <div className={styles.grid4}>
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent>
                <div className={styles.statRow}>
                  <div className={styles.iconBox}>
                    <s.icon size={16} />
                  </div>
                  <div>
                    <p className={styles.statValue}>{s.value}</p>
                    <p className={styles.statLabel}>{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>🔥 Activity Heatmap (Streak: {streak} days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.heatmap}>
              {heatmapData.map((week, wi) => (
                <div key={wi} className={styles.heatColumn}>
                  {week.map((val, di) => (
                    <div
                      key={di}
                      className={`${styles.heatCell} ${heatColor(val)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle>
              <FaChartLine /> Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Topic Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Topic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.topicAnalytics}>
                <XAxis dataKey="topic" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Strengths & Weakness */}
        <div className={styles.grid2}>
          <Card>
            <CardHeader>
              <CardTitle>🏆 Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              {strengths.map((s) => (
                <div key={s.topic} className={styles.progressRow}>
                  <span>{s.topic}</span>
                  <span>{s.avgScore}%</span>
                  <Progress value={s.avgScore} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Focus Area</CardTitle>
            </CardHeader>
            <CardContent>
              {weaknesses.map((w) => (
                <div key={w.topic} className={styles.progressRow}>
                  <span>{w.topic}</span>
                  <span>{w.avgScore}%</span>
                  <Progress value={w.avgScore} />
                </div>
              ))}

              <Button onClick={() => navigate("/practice/topics")}>
                Practice {weakestTopic?.topic} <FaArrowRight />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}