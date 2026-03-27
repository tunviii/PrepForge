import React, { useState } from "react";
import '../styles/Auth.css';

import { registerUser, loginUser, loginWithGoogle } from "../services/auth";

function Auth({ goBack }) {

  const [mode,setMode] = useState("signup");

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [college,setCollege] = useState("");
  const [branch,setBranch] = useState("");
  const [password,setPassword] = useState("");

  const handleSignup = async () => {

    if(!name || !email || !college || !branch || !password){
      alert("Please fill all fields");
      return;
    }

    const result = await registerUser({
      name,
      email,
      college,
      branch,
      password
    });

    if(result.success){
      const user=result.user;
      const token = await user.getIdToken();

    await fetch("http://localhost:5000/api/users/profile", {
    method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    name,
    college,
    branch
  })
});
      alert("Account created!");
      goBack();
    } else{
      alert(result.message);
    }
    
  };

  const handleLogin = async () => {

    if(!email || !password){
      alert("Enter email and password");
      return;
    }

    const result = await loginUser(email,password);

    if(result.success){
      alert("Login successful");
      goBack();
    }
    else{
      alert(result.message);
    }
  };


const handleGoogleLogin = async () => {
  const result = await loginWithGoogle();

  if (result.success) {
    const user = result.user;
    const token = await user.getIdToken();

    await fetch("http://localhost:5000/api/users/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: user.displayName,
        college: "",
        branch: ""
      })
    });

    alert("Google login successful");
    goBack();
  } else {
    alert(result.message);
  }
};

  return (

    <div className="register-page">

      <div className="register-card">

        <h2>{mode==="signup" ? "Create Account" : "Login"}</h2>

        {mode === "signup" && (
          <>
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
            />

            <input
              placeholder="College"
              value={college}
              onChange={(e)=>setCollege(e.target.value)}
            />

            <input
              placeholder="Branch"
              value={branch}
              onChange={(e)=>setBranch(e.target.value)}
            />
          </>
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="register-btn"
          onClick={mode==="signup" ? handleSignup : handleLogin}
        >
          {mode==="signup" ? "Register" : "Login"}
        </button>

        <button className="google-btn" onClick={handleGoogleLogin}> Sign In with Google </button>

        <div className="login-text">

          {mode==="signup" ? (
            <>
              Already have an account?{" "}
              <span onClick={()=>setMode("login")}>Login</span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span onClick={()=>setMode("signup")}>Sign Up</span>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default Auth;