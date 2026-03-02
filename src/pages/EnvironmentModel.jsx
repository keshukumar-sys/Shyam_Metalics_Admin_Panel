import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Plus, Edit, Trash2, Eye, X, Loader2, FileText, Calendar } from "lucide-react";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function EnvironmentModel() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/environment`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_environment`);
      if (!res.ok) throw new Error("Failed to fetch");
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

    var form_data = new FormData();
    form_data.append("detail_name", name);
    form_data.append("detail_date", date);
    form_data.append("file", file);

    if (!name || !date || !file) {
      setMessage("Please provide name, date and a file.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/create_environment`, {
        method: "POST",
        body: form_data,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage("Environment entry added successfully!");
      setName(""); setDate(""); setFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) return alert("Delete failed");
      fetchList();
    } catch (e) {
      alert("Network error");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.detail_name);
    setEditDate(row.detail_date?.substring(0, 10) || "");
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("detail_name", editName);
      formData.append("detail_date", editDate);
      if (editFile) formData.append("file", editFile);

      const res = await fetch(`${API_BASE}/update_environment/${editId}`, {
        method: "PUT",
        headers: authHeader(),
        body: formData,
      });
      if (!res.ok) return alert("Update failed");
      setEditId(null);
      fetchList();
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Environment Management</h2>
          <p className="muted">Track and publish environmental sustainability reports and records.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Add New Environment Record</h3>
          <p>Fill in the details and upload the compliance document.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Record Name / Title</label>
              <input
                placeholder="e.g. Emission Compliance Report Q4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Record Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Document Upload</label>
              <input
                type="file"
                className="form-input"
                onChange={(e) => setFile(e.target.files && e.target.files[0])}
                required
              />
            </div>
          </div>

          {message && (
            <div className={`form-msg ${message.includes("successfully") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Uploading...</> : <><Plus size={18} /> Add Record</>}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem" }}>
          <h3>Entries List</h3>
          <p>All published environmental records.</p>
        </div>

        <DataTable
          columns={[
            { key: "detail_name", label: "Name" },
            {
              key: "detail_date",
              label: "Date",
              width: "150px",
              render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={14} className="muted" />
                  {new Date(r.detail_date).toLocaleDateString()}
                </div>
              )
            },
            {
              key: "detail_file",
              label: "File",
              width: "100px",
              render: (r) => (r.detail_file ? (
                <a href={r.detail_file} target="_blank" rel="noreferrer" className="btn-outline btn-sm" title="View Document">
                  <FileText size={16} />
                </a>
              ) : "-")
            }
          ]}
          data={list}
          actions={(row) => (
            <div className="dt-actions">
              <button className="btn-outline btn-sm" onClick={() => handleEdit(row)} title="Edit">
                <Edit size={16} />
              </button>
              <button className="btn-outline btn-sm" style={{ color: "var(--danger)" }} onClick={() => handleDelete(row._id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        />
      </section>

      {editId && (
        <div className="modal-overlay">
          <div className="form-card" style={{ maxWidth: "600px" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Edit Environment Record</h3>
                <p>Updating entry info</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setEditId(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Record Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>New File (Optional)</label>
                  <input type="file" className="form-input" onChange={(e) => setEditFile(e.target.files && e.target.files[0])} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setEditId(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1.5rem;
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
