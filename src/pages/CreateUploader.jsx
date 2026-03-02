import React, { useState } from "react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

const CreateUploader = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}`;

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/auth/create-uploader`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return setMsg(json.error || "Failed");
      setMsg("Uploader created: " + json.email);
      setEmail("");
      setPassword("");
    } catch (e) {
      setMsg("Network error: check backend and your admin login");
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '500px' }}>
      <div className="form-header">
        <h3>Create Uploader</h3>
        <p className="muted">System administrators only. Internal access accounts.</p>
      </div>

      {msg && <div className={`form-msg ${msg.includes('created') ? 'success' : 'error'}`}>{msg}</div>}

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Uploader Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. uploader@shyammetalics.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Initial Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button className="btn-primary" type="submit" style={{ width: '100%' }}>Create Account</button>
        </div>
      </form>
    </div>
  );
};

export default CreateUploader;
