import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth, getToken } from "../auth";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Building2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";

  useEffect(() => {
    if (getToken()) nav("/");
  }, [nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErr(json.error || "Invalid credentials. Please try again.");
        return;
      }

      saveAuth(json);
      nav("/");
    } catch (e) {
      setErr("Network connection failed. Please ensure the server is online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card glass">
          <div className="login-header">
            <div className="brand-logo">
              <Building2 size={32} />
            </div>
            <h1>Admin Console</h1>
            <p className="muted">Securely manage Shyam Metalics digital operations.</p>
          </div>

          {err && (
            <div className="login-error">
              <ShieldCheck size={18} />
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="admin@shyammetalics.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Security Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>&copy; {new Date().getFullYear()} Shyam Metalics. Internal Access Only.</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at top right, #3b82f622, transparent),
                      radial-gradient(circle at bottom left, #1d4ed822, transparent),
                      #0f172a;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; overflow: hidden;
        }
        .login-container { width: 100%; max-width: 440px; padding: 1.5rem; z-index: 10; }
        .login-card {
          padding: 2.5rem; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .glass {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .login-header { text-align: center; margin-bottom: 2rem; }
        .brand-logo {
          width: 64px; height: 64px; background: var(--primary, #3b82f6);
          color: white; border-radius: 18px; display: flex; align-items: center;
          justify-content: center; margin: 0 auto 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
        }
        .login-header h1 { font-size: 1.75rem; font-weight: 800; color: white; margin: 0 0 0.5rem; letter-spacing: -0.025em; }
        .login-header .muted { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
        
        .login-error {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5; padding: 0.875rem 1rem; border-radius: 12px; margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem;
        }

        .login-form .form-group { margin-bottom: 1.5rem; }
        .login-form label { display: block; color: #cbd5e1; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-with-icon svg:first-child { position: absolute; left: 1rem; color: #64748b; pointer-events: none; transition: color 0.2s; }
        .input-with-icon input {
          width: 100%; height: 52px; background: rgba(15, 23, 42, 0.5); border: 1px solid #334155;
          border-radius: 14px; padding: 0 1rem 0 3rem; color: white; font-size: 1rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-with-icon input:focus { border-color: #3b82f6; background: rgba(15, 23, 42, 0.8); outline: none; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .input-with-icon input:focus + svg { color: #3b82f6; }
        
        .pwd-toggle {
          position: absolute; right: 0.75rem; background: none; border: none;
          color: #64748b; cursor: pointer; padding: 0.5rem; border-radius: 8px;
          transition: all 0.2s;
        }
        .pwd-toggle:hover { color: #f8fafc; background: rgba(255,255,255,0.05); }

        .login-btn {
          width: 100%; height: 56px; background: #3b82f6; color: white; border: none;
          border-radius: 14px; font-size: 1.05rem; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); margin-top: 1rem;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
        }
        .login-btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4); }
        .login-btn:active { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .login-footer { margin-top: 2.5rem; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; }
        .login-footer p { color: #475569; font-size: 0.75rem; margin: 0; font-weight: 500; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .login-container { padding: 1rem; }
          .login-card { padding: 1.75rem; }
        }
      `}</style>
    </div>
  );
}
