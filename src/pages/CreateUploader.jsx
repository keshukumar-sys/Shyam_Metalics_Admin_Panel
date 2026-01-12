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
    <div className="form-card">
      <h3>Create Uploader (admin only)</h3>
      {msg && <div className="form-msg">{msg}</div>}
      <form onSubmit={submit} className="form-grid">
        <label>
          Uploader Email
          <input className="form-input" placeholder="uploader email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Password
          <input className="form-input" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <div>
          <button className="btn" type="submit">Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreateUploader;
