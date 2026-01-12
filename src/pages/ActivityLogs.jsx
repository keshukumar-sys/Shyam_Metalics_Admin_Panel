import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { authHeader } from "../auth";

// Vite env vars: set VITE_API_BASE_URL (optional) and VITE_LOGS_LIMIT
const API_BASE = ((import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim()) || (import.meta.env.DEV ? 'http://localhost:3002' : '')).replace(/\/$/, '');
const DEFAULT_LIMIT = parseInt(import.meta.env.VITE_LOGS_LIMIT || '200', 10);

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [lastRequest, setLastRequest] = useState({ url: null, status: null, body: null });

  const fetchLogs = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const url = `${API_BASE}/logs?page=1&limit=${DEFAULT_LIMIT}`;
      setLastRequest({ url, status: 'pending', body: null });
      const res = await fetch(url, { headers: { ...authHeader() } });
      setLastRequest((s) => ({ ...s, status: res.status }));
      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to fetch logs: ${res.status} ${text}`);
        setLogs([]);
        return;
      }
      const json = await res.json();
      if (json && json.data) setLogs(json.data);
    } catch (e) {
      console.error('Failed to fetch logs', e);
      setError(`Network error while fetching logs: ${e && e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log?')) return;
    try {
      const res = await fetch(`${API_BASE}/logs/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeader() } });
      if (!res.ok) throw new Error('Delete failed');
      setLogs((s) => s.filter(l => l._id !== id));
      setMessage('Log deleted');
    } catch (e) {
      console.error('Failed to delete log', e);
      setError('Failed to delete log');
    }
  };

  const createTestLog = async () => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/logs/test-create`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ note: 'test' }) });
      if (!res.ok) {
        const text = await res.text();
        setError(`Failed to create test log: ${res.status} ${text}`);
        return;
      }
      const json = await res.json();
      setMessage('Test log created');
      // prepend new log if returned
      if (json && json.data) setLogs((s) => [json.data, ...s]);
    } catch (e) {
      console.error('Failed to create test log', e);
      setError('Network error while creating test log');
    }
  };


  const columns = [
    { key: 'createdAt', label: 'Time', render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: 'email', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'method', label: 'Method' },
    { key: 'route', label: 'Route' },
    { key: 'status', label: 'Status' },
    { key: 'ip', label: 'IP' },
    { key: 'duration', label: 'Duration', render: (r) => (r.metadata && r.metadata.durationMs) ? `${r.metadata.durationMs}ms` : '' },
  ];

  return (
    <div>
      <h2>Activity Logs</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchLogs} disabled={loading}>Refresh</button>
          <button onClick={createTestLog} disabled={loading}>Create test log</button>
          {import.meta.env.DEV && <button onClick={async () => {
            setError(null);
            setMessage(null);
            try {
              const res = await fetch(`${API_BASE}/logs/public-test-create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: 'public-test' }) });
              if (!res.ok) {
                const text = await res.text();
                setError(`Failed to create public test log: ${res.status} ${text}`);
                return;
              }
              const json = await res.json();
              setMessage('Public test log created');
              if (json && json.data) setLogs((s) => [json.data, ...s]);
            } catch (e) {
              console.error('Failed to create public test log', e);
              setError(`Network error while creating public test log: ${e && e.message}`);
            }
          }} style={{ marginLeft: 8 }}>Create public test log (DEV)</button>}

          {import.meta.env.DEV && <button onClick={async () => {
            setError(null);
            setMessage(null);
            try {
              const url = `${API_BASE}/logs/public-count`;
              setLastRequest({ url, status: 'pending' });
              const res = await fetch(url);
              setLastRequest((s) => ({ ...s, status: res.status }));
              if (!res.ok) {
                const text = await res.text();
                setError(`Ping failed: ${res.status} ${text}`);
                return;
              }
              const json = await res.json();
              setMessage(`Count: ${json.count}`);
            } catch (e) {
              console.error('Ping failed', e);
              setError(`Network error during ping: ${e && e.message}`);
            }
          }} style={{ marginLeft: 8 }}>Ping API (DEV)</button>}
        </div>

        {message && <div style={{ color: 'green' }}>{message}</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>API base:</strong> <span style={{ fontFamily: 'monospace' }}>{API_BASE || '(empty)'}</span>
        {lastRequest.url && <div><strong>Last request:</strong> <span style={{ fontFamily: 'monospace' }}>{lastRequest.url}</span> — <strong>Status:</strong> {String(lastRequest.status)}</div>}
      </div>

      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={logs} actions={(row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => alert(JSON.stringify(row.metadata || {}, null, 2))}>View</button>
          <button onClick={() => handleDelete(row._id)}>Delete</button>
        </div>
      )} />}
    </div>
  );
};

export default ActivityLogs;
