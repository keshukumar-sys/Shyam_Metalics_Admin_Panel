import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  ShieldCheck, Calendar, FileText, UploadCloud,
  Plus, Edit3, Trash2, Loader2, Info, ArrowRight, X
} from "lucide-react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

export default function TdsDeclarationModel() {
  const [tdsName, setTdsName] = useState("");
  const [tdsDate, setTdsDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/tds`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get_tds`);
      if (!res.ok) throw new Error("Failed to fetch TDS records");
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
    if (!tdsName || !tdsDate || !file) return setMessage("Please provide document title, date and file.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("tds_name", tdsName);
      formData.append("tds_date", tdsDate);
      formData.append("tds_file", file);
      // Backend may expect the filename variant too as per previous code
      formData.append("tds_file_name", file.name);

      const res = await fetch(`${API_BASE}/create_tds`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Upload failed");

      setMessage("TDS declaration published successfully");
      setTdsName("");
      setTdsDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this TDS declaration permanently?")) return;
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
    setEditName(row.tds_name);
    setEditDate(row.tds_date || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editDate) return alert("Please fill all required fields");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("tds_name", editName);
      formData.append("tds_date", editDate);
      if (editFile) formData.append("tds_file", editFile);

      const res = await fetch(`${API_BASE}/update_tds/${editId}`, {
        method: "PUT",
        headers: { ...authHeader() },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      setEditId(null);
      setEditFile(null);
      fetchList();
      alert("TDS declaration updated successfully");
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
          <h2>TDS Declarations</h2>
          <p className="muted">Manage tax deduction certificates, statutory declarations, and financial compliance documents.</p>
        </div>
        <div className="badge primary-subtle"><ShieldCheck size={14} /> Taxation Compliance</div>
      </div>

      <div className="content-grid-two-col">
        {/* FORM SECTION */}
        <div className="form-column">
          <section className="card">
            <div className="form-header">
              {editId ? <Edit3 size={20} /> : <Plus size={20} />}
              <h3>{editId ? "Edit Declaration" : "New TDS Upload"}</h3>
            </div>

            {editId ? (
              <form onSubmit={handleUpdateSubmit} className="form-grid">
                <div className="form-group full">
                  <label>Certificate / Document Title</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Issuance Date</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Update Document (Optional)</label>
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
                  <label>Document Title</label>
                  <div className="input-with-icon">
                    <FileText size={18} />
                    <input
                      placeholder="e.g. Form 15G/15H - FY 2024-25"
                      value={tdsName}
                      onChange={(e) => setTdsName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group half">
                  <label>Declaration Date</label>
                  <input
                    type="date"
                    value={tdsDate}
                    onChange={(e) => setTdsDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>PDF Certificate</label>
                  <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} required />
                </div>
                <button type="submit" className="btn full" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <><UploadCloud size={18} /> Publish TDS Record</>}
                </button>
              </form>
            )}
            {message && <div className={`form-msg ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
          </section>
        </div>

        {/* LIST SECTION */}
        <div className="table-column">
          <section className="card">
            <div className="form-header">
              <ShieldCheck size={20} />
              <h3>Declaration History</h3>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <Loader2 className="animate-spin muted" size={40} />
                <p className="muted">Retrieving tax records...</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "tds_name",
                    label: "Title",
                    render: (r) => (
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                        {r.tds_name}
                      </div>
                    )
                  },
                  {
                    key: "tds_date",
                    label: "Date",
                    width: "140px",
                    render: (r) => (
                      <div className="muted" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} /> {r.tds_date}
                      </div>
                    )
                  },
                  {
                    key: "tds_file",
                    label: "Certificate",
                    width: "120px",
                    render: (r) => (
                      r.tds_file ? (
                        <a href={r.tds_file} target="_blank" rel="noreferrer" className="badge primary-subtle link-badge">
                          <FileText size={12} /> View PDF
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
        .content-grid-two-col { display: grid; grid-template-columns: 1fr 1.6fr; gap: 2rem; align-items: start; }
        .form-column { position: sticky; top: 1.5rem; }
        .link-badge { 
          text-decoration: none; display: flex; align-items: center; gap: 4px; 
          font-weight: 600; font-size: 11px; transition: all 0.2s;
        }
        .link-badge:hover { opacity: 0.8; transform: translateY(-1px); }
        
        @media (max-width: 1200px) {
          .content-grid-two-col { grid-template-columns: 1fr; }
          .form-column { position: static; }
        }
      `}</style>
    </div>
  );
}
