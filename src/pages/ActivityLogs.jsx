import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { authHeader } from "../auth";

const API_BASE = "https://shyam-metalics-backend-1.onrender.com";
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
        `${API_BASE}/logs?page=1&limit=${DEFAULT_LIMIT}`,
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
    } catch {
      setError("Failed to create test log");
    }
  };

  const columns = [
    {
      key: "createdAt",
      label: "Time",
      render: (r) => new Date(r.createdAt).toLocaleString(),
    },
    { key: "email", label: "User" },
    { key: "action", label: "Action" },
    { key: "method", label: "Method" },
    { key: "route", label: "Route" },
    { key: "status", label: "Status" },
    {
      key: "duration",
      label: "Duration",
      render: (r) =>
        r.metadata?.durationMs ? `${r.metadata.durationMs}ms` : "-",
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>🧾 Activity Logs</h2>

      {/* ACTION BAR */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <button onClick={fetchLogs} disabled={loading}>
          🔄 Refresh
        </button>

        <button onClick={createTestLog} disabled={loading}>
          ➕ Create Test Log
        </button>

        <button
          onClick={handleDeleteAll}
          disabled={loading}
          style={{
            background: "#d32f2f",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          🗑️ Delete All Logs
        </button>

        {message && <span style={{ color: "green" }}>{message}</span>}
        {error && <span style={{ color: "red" }}>{error}</span>}
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          actions={(row) => (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() =>
                  alert(JSON.stringify(row.metadata || {}, null, 2))
                }
              >
                View
              </button>
              <button onClick={() => handleDelete(row._id)}>Delete</button>
            </div>
          )}
        />
      )}
    </div>
  );
};

export default ActivityLogs;
