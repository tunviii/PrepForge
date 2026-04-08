import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import Landing from "./components/Landing";
import Practice from "./components/Practice";
import Interview from "./components/Interview";
import ReportScreen from './components/ReportScreen';
import Dashboard from './components/Dashboard';
import PracticeMode from './components/PracticeMode';
import Topics from './components/Topics';
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

import { auth } from "./firebase/firebase";
import { getCurrentUser, logoutUser } from "./services/auth";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [uid, setUid]     = useState(null);
  const navigate = useNavigate();

useEffect(() => {

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

    if (firebaseUser) {

      const token = await firebaseUser.getIdToken();
      setToken(token);
      setUid(firebaseUser.uid);
      try {

        const res = await fetch("http://localhost:5000/api/users/profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();

        if (data) {
          setUser(data); 
        } else {
          
          setUser({
            name: firebaseUser.displayName,
            email: firebaseUser.email
          });
        }

      } catch (err) {

        
        setUser({
          name: firebaseUser.displayName,
          email: firebaseUser.email
        });

      }

    } else {
      setUser(null);
      setToken(null);
      setUid(null);
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
    if (!user) {
      navigate("/auth");
      return;
    }

    navigate("/practice-mode");
  };

  const openInterview = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    navigate("/test");
  };

  const openDashboard = () => {
  if (!user) { navigate("/auth"); return; }
  navigate("/dashboard");
};

  return (
  <Routes>
    <Route
      path="/"
      element={
        <Landing
          user={user}
          logout={logout}
          openPractice={openPractice}
          openInterview={openInterview}
          openDashboard={openDashboard} 
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

    <Route
      path="/practice"
      element={
        <ProtectedRoute user={user}>
          <Practice goBack={() => navigate("/")} token={token} />
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
          <ReportScreen />
        </ProtectedRoute>
      }
    />

    {/* ── Dashboard ── */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute user={user}>
          <Dashboard userId={uid} token={token} user={user}/>
        </ProtectedRoute>
      }
    />
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
  </Routes>
);
}

export default App;
