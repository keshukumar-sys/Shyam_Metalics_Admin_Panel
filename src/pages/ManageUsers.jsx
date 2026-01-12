import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { authHeader } from "../auth";

export default function ManageUsers(){
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

  useEffect(()=>{ fetchUsers(); }, []);

  const changeRole = async (id, role) => {
    try{
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json', ...authHeader() }, body: JSON.stringify({ role }) });
      const json = await res.json();
      if (!res.ok) return alert(json.error || 'Failed to change role');
      fetchUsers();
    } catch(e){ alert('Network error'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try{
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
      const json = await res.json();
      if (!res.ok) return alert(json.error || 'Delete failed');
      fetchUsers();
    } catch(e){ alert('Network error'); }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Manage Users</h2>
      {loading ? <div>Loading...</div> : (
        <DataTable
          columns={[
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'createdAt', label: 'Created', render: r => new Date(r.createdAt || Date.now()).toLocaleString() }
          ]}
          data={users}
          actions={(row) => (
            <>
              {row.role !== 'admin' && <button className="btn-sm" onClick={() => changeRole(row._id, 'admin')}>Promote</button>}
              {row.role === 'admin' && <button className="btn-sm" onClick={() => changeRole(row._id, 'uploader')}>Demote</button>}
              <button style={{ marginLeft: 8 }} className="btn-sm" onClick={() => deleteUser(row._id)}>Delete</button>
            </>
          )}
        />
      )}
    </div>
  );
}
