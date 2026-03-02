import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";
import { authHeader } from "../auth";
import { Edit, Trash2, Plus, Loader2, Eye, X } from "lucide-react";

export default function CorporateModel() {
  const [option, setOption] = useState("Newspaper Publication");
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

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"
    }/corporate`;

  useEffect(() => {
    if (option) fetchList(option);
  }, [option]);

  const fetchList = async (opt) => {
    try {
      const res = await fetch(`${API_BASE}/get/${opt}`);
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

    if (!option || !name || !date || !file) {
      setMessage("Please provide all required fields.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("name", name);
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Announcement added successfully!");
      setName("");
      setDate("");
      setFile(null);
      fetchList(option);
    } catch (err) {
      console.error(err);
      setMessage("Server error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Delete failed");
      fetchList(option);
    } catch (e) {
      alert("Network error");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.name);
    setEditDate(row.date);
    setEditFile(null);
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
      formData.append("name", editName);
      formData.append("date", editDate);
      if (editFile) formData.append("file", editFile);

      const headers = {};
      const token = localStorage.getItem("shyam_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/update_ca/${editId}`, {
        method: "PUT",
        headers: headers,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Update failed");
      setEditId(null);
      fetchList(option);
    } catch (e) {
      console.error(e);
      alert("Network error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const options = [
    "Newspaper Publication",
    "Press Release",
    "Notices",
    "Regulation 30 Disclosures",
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Corporate Announcements</h2>
          <p className="muted">Manage and publish corporate announcements and notices.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Add New Announcement</h3>
          <p>Fill in the details below to upload a new announcement.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Announcement Type</label>
              <select value={option} onChange={(e) => setOption(e.target.value)}>
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Title / Name</label>
              <input
                type="text"
                placeholder="Enter announcement title"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Publication Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Document File</label>
              <input
                type="file"
                className="form-input"
                onChange={(e) => setFile(e.target.files && e.target.files[0])}
              />
            </div>
          </div>

          {message && (
            <div className={`form-msg ${message.includes("failed") || message.includes("error") ? "error" : "success"}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? (
                <><Loader2 className="animate-spin" size={18} /> Uploading...</>
              ) : (
                <><Plus size={18} /> Add Announcement</>
              )}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem" }}>
          <h3>{option} List</h3>
          <p>History of published announcements under this category.</p>
        </div>

        <DataTable
          columns={[
            { key: "name", label: "Announcement Name" },
            { key: "date", label: "Date", width: "150px" },
            {
              key: "file",
              label: "Document",
              width: "120px",
              render: (r) => (
                r.file ? (
                  <a href={r.file} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                    <Eye size={14} /> View
                  </a>
                ) : "-"
              )
            }
          ]}
          data={list}
          actions={(row) => (
            <div className="dt-actions">
              <button
                className="btn-outline btn-sm"
                style={{ color: "var(--primary)" }}
                onClick={() => handleEdit(row)}
                title="Edit"
              >
                <Edit size={16} />
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
      </section>

      {editId && (
        <div className="modal-overlay">
          <div className="form-card" style={{ maxWidth: "600px" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Edit Announcement</h3>
                <p>Update the details for "{editName}"</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setEditId(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title / Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Publication Date</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Update File (Optional)</label>
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
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
          overflow-y: auto;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
