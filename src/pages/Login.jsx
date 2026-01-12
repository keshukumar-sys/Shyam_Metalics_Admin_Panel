import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "../auth";
import "../components/css/Form.css";
import { getToken } from "../auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (getToken()) nav("/");
  }, []);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}`;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return setErr(json.error || "Login failed");
      saveAuth(json);
      nav("/");
    } catch (e) {
      setErr("Network error: check backend is running and CORS");
    }
  };

  return (
    <div className="form-card">
      <h2>Login</h2>
      {err && <div className="form-msg error">{err}</div>}
      <form onSubmit={submit} className="form-grid">
        <label>
          Email
          <input className="form-input" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Password
          <input className="form-input" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <div>
          <button className="btn" type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
