import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { authHeader } from "../auth";
import { RefreshCw, Plus, Trash2, Eye, Loader2, AlertCircle, Info } from "lucide-react";

const API_BASE = "https://shyam-metalics-backend-kzr8.onrender.com";
const DEFAULT_LIMIT = parseInt(import.meta.env.VITE_LOGS_LIMIT || "200", 10);

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/logs`,
        { headers: authHeader() }
      );
      if (!res.ok) throw new Error("Failed to fetch logs");
      const json = await res.json();
      setLogs(json.data || []);
    } catch (e) {
      setError("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // DELETE SINGLE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log?")) return;
    try {
      await fetch(`${API_BASE}/logs/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      setLogs((s) => s.filter((l) => l._id !== id));
      setMessage("Log deleted successfully");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setError("Failed to delete log");
    }
  };

  // DELETE ALL
  const handleDeleteAll = async () => {
    if (!window.confirm("⚠️ This will delete ALL activity logs. Continue?"))
      return;

    try {
      setLoading(true);
      await fetch(`${API_BASE}/logs/delete-all`, {
        method: "DELETE",
        headers: authHeader(),
      });
      setLogs([]);
      setMessage("All activity logs deleted");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setError("Failed to delete all logs");
    } finally {
      setLoading(false);
    }
  };

  // CREATE TEST LOG
  const createTestLog = async () => {
    try {
      const res = await fetch(`${API_BASE}/logs/test-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ note: "test" }),
      });
      const json = await res.json();
      if (json?.data) setLogs((s) => [json.data, ...s]);
      setMessage("Test log created");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setError("Failed to create test log");
    }
  };

  const columns = [
    {
      key: "createdAt",
      label: "Time",
      render: (r) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {new Date(r.createdAt).toLocaleString()}
        </span>
      ),
    },
    { key: "email", label: "User" },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <span className={`badge ${r.method === 'DELETE' ? 'badge-danger' : 'badge-info'}`} style={{
          background: r.method === 'DELETE' ? '#fee2e2' : '#dcfce7',
          color: r.method === 'DELETE' ? '#991b1b' : '#166534',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.7rem',
          fontWeight: '600'
        }}>
          {r.action}
        </span>
      )
    },
    { key: "method", label: "Method" },
    { key: "route", label: "Route" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span style={{ color: r.status >= 400 ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>
          {r.status}
        </span>
      )
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Activity Logs</h2>
          <p className="muted">Track system changes and user operations.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn-outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button className="btn-outline" onClick={createTestLog} disabled={loading}>
            <Plus size={18} />
            Test Log
          </button>
          <button
            className="btn-primary"
            style={{ background: "var(--danger)" }}
            onClick={handleDeleteAll}
            disabled={loading}
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        {message && (
          <div className="form-msg success">
            <Info size={18} />
            {message}
          </div>
        )}
        {error && (
          <div className="form-msg error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading && logs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 1rem" }} />
            <p>Loading activity logs...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            actions={(row) => (
              <div className="dt-actions">
                <button
                  className="btn-outline btn-sm"
                  onClick={() => alert(JSON.stringify(row.metadata || {}, null, 2))}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  className="btn-outline btn-sm"
                  style={{ color: "var(--danger)" }}
                  onClick={() => handleDelete(row._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ActivityLogs;
