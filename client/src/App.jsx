import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import Landing from "./components/Landing";
import Practice from "./components/Practice";
import Interview from "./components/Interview";
import ReportScreen from "./components/ReportScreen";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import PracticeMode from "./components/PracticeMode";
import Topics from "./components/Topics";

import { auth } from "./firebase/firebase";
import { getCurrentUser, logoutUser } from "./services/auth";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setToken(token);

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (data) {
            setUser(data);
          } else {
            setUser({
              name: firebaseUser.displayName,
              email: firebaseUser.email,
            });
          }
        } catch (err) {
          setUser({
            name: firebaseUser.displayName,
            email: firebaseUser.email,
          });
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");
  };

  const openPractice = () => {
    if (!user) { navigate("/auth"); return; }
    navigate("/practice-mode");
  };

  const openInterview = () => {
    if (!user) { navigate("/auth"); return; }
    navigate("/test");
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <Landing
            user={user}
            logout={logout}
            openPractice={openPractice}
            openInterview={openInterview}
            openAuth={() => navigate("/auth")}
          />
        }
      />

      <Route
        path="/auth"
        element={
          <Auth
            goBack={() => {
              const currentUser = getCurrentUser();
              setUser(currentUser);
              navigate("/");
            }}
          />
        }
      />

      {/* Protected routes */}
      <Route
        path="/practice-mode"
        element={
          <ProtectedRoute user={user}>
            <PracticeMode goBack={() => navigate("/")} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/topics"
        element={
          <ProtectedRoute user={user}>
            <Topics goBack={() => navigate("/practice-mode")} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/practice"
        element={
          <ProtectedRoute user={user}>
            <Practice goBack={() => navigate("/practice-mode")} token={token} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/test"
        element={
          <ProtectedRoute user={user}>
            <Interview goBack={() => navigate("/")} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report"
        element={
          <ProtectedRoute user={user}>
            <ReportScreen goBack={() => navigate("/")} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <Dashboard goBack={() => navigate("/")} />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;