import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  BarChart3, Calendar, FileText, UploadCloud,
  Plus, Edit3, Trash2, Loader2, Info, ArrowRight, X
} from "lucide-react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

export default function QipModel() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/qip`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get_qip`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!name || !date || !file) return setMessage("Please provide name, date and a file.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("qip_name", name);
      formData.append("qip_date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_qip`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Upload failed");

      setMessage("QIP document published successfully");
      setName("");
      setDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this QIP record?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchList();
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.qip_name);
    setEditDate(row.qip_date ? new Date(row.qip_date).toISOString().split('T')[0] : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editDate) return alert("Please fill all required fields");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("qip_name", editName);
      formData.append("qip_date", editDate);
      if (editFile) formData.append("file", editFile);

      const res = await fetch(`${API_BASE}/update/${editId}`, {
        method: "PUT",
        headers: { ...authHeader() },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      setEditId(null);
      setEditFile(null);
      fetchList();
      alert("QIP record updated successfully");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modern-page">
      <div className="page-header">
        <div>
          <h2>Qualified Institutional Placement (QIP)</h2>
          <p className="muted">Manage and publish QIP documentation, placement reports, and investor disclosures.</p>
        </div>
        <div className="badge secondary"><BarChart3 size={14} /> Institutional Finance</div>
      </div>

      <div className="content-grid-two-col">
        {/* FORM SECTION */}
        <div className="form-column">
          <section className="card">
            <div className="form-header">
              {editId ? <Edit3 size={20} /> : <Plus size={20} />}
              <h3>{editId ? "Update QIP Entry" : "Add QIP Document"}</h3>
            </div>

            {editId ? (
              <form onSubmit={handleUpdateSubmit} className="form-grid">
                <div className="form-group full">
                  <label>QIP Project Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Effective Date</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Replacement Document (Optional)</label>
                  <input type="file" onChange={(e) => setEditFile(e.target.files && e.target.files[0])} />
                </div>
                <div className="form-actions full">
                  <button type="button" className="btn-outline" onClick={() => setEditId(null)}>Cancel</button>
                  <button type="submit" className="btn" disabled={uploading}>
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="form-grid">
                <div className="form-group full">
                  <label>Document Title / QIP Name</label>
                  <div className="input-with-icon">
                    <FileText size={18} />
                    <input
                      placeholder="e.g. QIP Placement Document 2024"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group half">
                  <label>Issuance Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Document Upload (PDF)</label>
                  <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} required />
                </div>
                <button type="submit" className="btn full" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <><UploadCloud size={18} /> Publish QIP Record</>}
                </button>
              </form>
            )}
            {message && <div className={`form-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          </section>
        </div>

        {/* LIST SECTION */}
        <div className="table-column">
          <section className="card">
            <div className="form-header">
              <BarChart3 size={20} />
              <h3>Existing Records</h3>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <Loader2 className="animate-spin muted" size={40} />
                <p className="muted">Syncing records...</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "qip_name",
                    label: "Document Name",
                    render: (r) => (
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                        {r.qip_name}
                      </div>
                    )
                  },
                  {
                    key: "qip_date",
                    label: "Issuance Date",
                    width: "140px",
                    render: (r) => (
                      <div className="muted" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} /> {new Date(r.qip_date).toLocaleDateString()}
                      </div>
                    )
                  },
                  {
                    key: "qip_file",
                    label: "Document",
                    width: "100px",
                    render: (r) => (
                      r.qip_file ? (
                        <a href={r.qip_file} target="_blank" rel="noreferrer" className="btn-outline btn-sm" style={{ color: "var(--primary)" }}>
                          View PDF
                        </a>
                      ) : <span className="muted">—</span>
                    )
                  }
                ]}
                data={list}
                actions={(row) => (
                  <div className="dt-actions">
                    <button className="btn-outline btn-sm" onClick={() => handleEdit(row)} title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button className="btn-outline btn-sm" style={{ color: "var(--danger)" }} onClick={() => handleDelete(row._id)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              />
            )}
          </section>
        </div>
      </div>

      <style>{`
        .content-grid-two-col { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; align-items: start; }
        .form-column { position: sticky; top: 1.5rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 1200px) {
          .content-grid-two-col { grid-template-columns: 1fr; }
          .form-column { position: static; }
        }
      `}</style>
    </div>
  );
}
