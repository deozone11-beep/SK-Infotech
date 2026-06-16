import { useState } from "react";
import "../css/Login.css";
import { useNavigate } from "react-router-dom";
import { users as defaultUsers } from "../data/data";
import { useEffect } from "react";


function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = () => {
  const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

  const user = storedUsers.find(
    (u) =>
      u.id === userId.trim() &&
      u.password === password.trim()
  );

  if (!user) {
    alert("Invalid Login ❌");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));

  if (user.role === "admin") {
  nav("/admin");
} else if (user.role === "team_lead") {
  nav("/teamlead");
} else {
  nav("/employee");
}
};

useEffect(() => {
  const storedUsers = localStorage.getItem("users");

  if (!storedUsers) {
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
}, []);

  
  return (
    <div className="main">

      {/* 🔵 TOP BAR */}
      <div className="topbar">
        <div className="logo-section">
          <img src="public\favicon.svg" alt="eci" />
          <span className="title">SK INFOTECH</span>
        </div>

        <div className="top-icons">
          <span>Home</span>
          <span>|</span>
          <span>AB</span>
          <span>A_B</span>
          <span>A__B</span>
          <span>|</span>
          <span>A-</span>
          <span>A</span>
          <span>A+</span>
        </div>
      </div>

      {/* 🔷 BODY */}
      <div className="body">

<div className="left">
  <div className="hero">
    <img src="/favicon.svg" alt="logo" />

    <h1>SK INFOTECH</h1>
    <p>Smart Task Management System</p>
  </div>
</div>

        {/* RIGHT SIDE LOGIN */}
        <div className="right">
          <div className="login-card">
            <h3>Login</h3>

            <label>User ID *</label>
            <input
              type="text"
              placeholder="Enter user id"
              onChange={(e) => setUserId(e.target.value)}
            />

            <label>Password *</label>
            <input
              type="password"
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>
          </div>
        </div>
      </div>

      {/* 🔻 FOOTER */}
      <div className="footer">
        Copyright SK INFOTECH 2025. All Rights Reserved.
      </div>

    </div>
  );
}

export default Login;