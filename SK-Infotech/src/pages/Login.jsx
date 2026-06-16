import { useState, useEffect } from "react";
import "../css/Login.css";
import { useNavigate } from "react-router-dom";
import { loginAPI } from "../services/api";

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Already logged in-ஆ check பண்று
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (token && user) {
      redirectByRole(user.role);
    }
  }, []);

const redirectByRole = (role) => {
  if (role === "admin") nav("/SK-Infotech/admin");
  else if (role === "team_lead") nav("/SK-Infotech/teamlead");
  else nav("/SK-Infotech/employee");
};

  const handleLogin = async () => {
    if (!userId || !password) return alert("ID மற்றும் Password கொடுக்கவும்");
    setLoading(true);
    try {
      const data = await loginAPI(userId, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      redirectByRole(data.user.role);
    } catch (err) {
      alert(err.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="topbar">
        <div className="logo-section">
          <img src="/favicon.svg" alt="eci" />
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

      <div className="body">
        <div className="left">
          <div className="hero">
            <img src="/favicon.svg" alt="logo" />
            <h1>SK INFOTECH</h1>
            <p>Smart Task Management System</p>
          </div>
        </div>

        <div className="right">
          <div className="login-card">
            <h3>Login</h3>
            <label>User ID *</label>
            <input
              type="text"
              placeholder="Enter user id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <label>Password *</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <button onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </div>

      <div className="footer">
        Copyright SK INFOTECH 2025. All Rights Reserved.
      </div>
    </div>
  );
}

export default Login;
