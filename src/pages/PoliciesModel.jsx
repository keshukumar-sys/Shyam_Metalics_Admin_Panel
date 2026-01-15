import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function PoliciesModel() {
  const [policyName, setPolicyName] = useState("");
  const [policyDate, setPolicyDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/policy`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_policy`);
      if (!res.ok) throw new Error("Failed to fetch policies");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    if (!policyName || !policyDate || !file) {
      setMessage("Please provide policy name, date and a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("policy_name", policyName);
      formData.append("policy_date", policyDate);
      // include both keys in case backend middleware expects a specific field
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_policy`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Policy added");
      setPolicyName("");
      setPolicyDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Delete failed");
      fetchList();
    } catch (e) {
      alert("Network error");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.policy_name);
    setEditDate(row.policy_date);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editDate) {
      alert("Please fill all fields");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("policy_name", editName);
      formData.append("policy_date", editDate);
      if (editFile) formData.append("file", editFile);

      const headers = {};
      const token = localStorage.getItem("shyam_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/update/${editId}`, {
        method: "PUT",
        headers: headers,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Update failed");
      setEditId(null);
      fetchList();
    } catch (e) {
      console.error(e);
      alert("Network error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Policies</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <label>
          Policy Name
          <input value={policyName} onChange={(e) => setPolicyName(e.target.value)} />
        </label>

        <label>
          Date
          <input type="date" value={policyDate} onChange={(e) => setPolicyDate(e.target.value)} />
        </label>

        <label>
          File
          <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} />
        </label>

        <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Add Policy"}</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Policies</h3>
        <DataTable
          columns={[
            { key: "policy_name", label: "Name" },
            { key: "policy_date", label: "Date", render: (r) => new Date(r.policy_date).toLocaleDateString() },
            { key: "policy_file", label: "File", render: (r) => (r.policy_file ? <a href={r.policy_file} target="_blank" rel="noreferrer">View</a> : "-") }
          ]}
          data={list}
          actions={(row) => (
            <>
              <button className="btn-sm" style={{marginRight: 8}} onClick={() => handleEdit(row)}>Edit</button>
              <button className="btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
            </>
          )}
        />
      </section>

      {editId && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>Edit Policy</h3>
          <form onSubmit={handleUpdateSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
            <label>
              Name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </label>
            <label>
              Date
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </label>
            <label>
              File (optional)
              <input type="file" onChange={(e) => setEditFile(e.target.files && e.target.files[0])} />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit">Update</button>
              <button type="button" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
