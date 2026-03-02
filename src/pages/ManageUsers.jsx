import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  User, Shield, ShieldCheck, Mail, Calendar,
  Trash2, ArrowUpCircle, ArrowDownCircle, Loader2, Info, Users
} from "lucide-react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/auth`;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users`, { headers: { ...authHeader() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setUsers(json.data || []);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (id, role) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ role })
      });
      const json = await res.json();
      if (!res.ok) return alert(json.error || 'Failed to change role');
      fetchUsers();
    } catch (e) { alert('Network error'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
      const json = await res.json();
      if (!res.ok) return alert(json.error || 'Delete failed');
      fetchUsers();
    } catch (e) { alert('Network error'); }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="badge danger"><ShieldCheck size={12} /> Administrator</span>;
    return <span className="badge primary"><User size={12} /> Staff / Uploader</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p className="muted">Manage administrative access, roles, and security permissions.</p>
        </div>
        <div className="badge secondary"><Users size={14} /> Total Users: {users.length}</div>
      </div>

      <section className="card" style={{ padding: "1.5rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1.5rem" }}>
          <h3>Access Control List</h3>
          <p>Review active accounts and adjust privileges as necessary.</p>
        </div>

        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <Loader2 className="animate-spin muted" size={40} />
            <p className="muted" style={{ marginTop: "1rem" }}>Retrieving user database...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'email',
                label: 'User Identity',
                render: (r) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div className="avatar-placeholder">{r.email.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{r.email}</div>
                      <div className="muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={12} /> System Identity
                      </div>
                    </div>
                  </div>
                )
              },
              {
                key: 'role',
                label: 'Access Level',
                width: "180px",
                render: (r) => getRoleBadge(r.role)
              },
              {
                key: 'createdAt',
                label: 'Registration',
                width: "200px",
                render: (r) => (
                  <div className="muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={12} /> {new Date(r.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )
              }
            ]}
            data={users}
            actions={(row) => (
              <div className="dt-actions">
                {row.role !== 'admin' ? (
                  <button className="btn-outline btn-sm" style={{ color: "var(--primary)" }} onClick={() => changeRole(row._id, 'admin')} title="Promote to Admin">
                    <ArrowUpCircle size={16} /> <span style={{ marginLeft: "4px" }}>Promote</span>
                  </button>
                ) : (
                  <button className="btn-outline btn-sm" style={{ color: "#f59e0b" }} onClick={() => changeRole(row._id, 'uploader')} title="Demote to Staff">
                    <ArrowDownCircle size={16} /> <span style={{ marginLeft: "4px" }}>Demote</span>
                  </button>
                )}
                <button className="btn-outline btn-sm" style={{ color: "var(--danger)" }} onClick={() => deleteUser(row._id)} title="Delete Account">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        )}
      </section>

      <style>{`
        .avatar-placeholder {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--bg-secondary); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; border: 1px solid var(--border-color);
        }
        .badge.danger { background: #fef2f2; color: #dc2626; border: 1px solid #ef444433; }
        .badge.secondary { background: var(--bg-secondary); color: var(--text-muted); border: 1px solid var(--border-color); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
