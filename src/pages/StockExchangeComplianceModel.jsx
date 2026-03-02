import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  Activity, Calendar, FileText, UploadCloud,
  Plus, Edit3, Trash2, Loader2, Info, Settings2,
  ArrowRight, X
} from "lucide-react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

export default function StockExchangeComplianceModel() {
  const [option, setOption] = useState("Shareholding Pattern");
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

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/stock`;

  useEffect(() => {
    if (option) fetchList(option);
  }, [option]);

  const fetchList = async (opt) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get/${option}`);
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
    if (!option || !name || !date || !file) return setMessage("Please provide all required fields.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("name", name);
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Upload failed");

      setMessage("Record published successfully");
      setName("");
      setDate("");
      setFile(null);
      fetchList(option);
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this compliance record?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchList(option);
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.name);
    setEditDate(row.date || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editDate) return alert("Please fill all required fields");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("date", editDate);
      if (editFile) formData.append("file", editFile);

      const res = await fetch(`${API_BASE}/update_compliance/${editId}`, {
        method: "PUT",
        headers: { ...authHeader() },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      setEditId(null);
      setEditFile(null);
      fetchList(option);
      alert("Record updated successfully");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const complianceCategories = [
    "Shareholding Pattern",
    "Corporate Governance Report",
    "Reconciliation Share Capital Audit Report",
    "Investors Grievances Report",
    "Integrated Financials",
    "Integrated Governance",
    "Regulation 74(5)",
    "Regulation 40(9)",
    "Regulation 7(3)",
  ];

  return (
    <div className="modern-page">
      <div className="page-header">
        <div>
          <h2>Stock Exchange Compliance</h2>
          <p className="muted">Manage statutory listings, SEBI regulations, and stock exchange disclosures.</p>
        </div>
        <div className="header-actions">
          <div className="category-select-wrapper">
            <Settings2 size={16} />
            <select value={option} onChange={(e) => setOption(e.target.value)}>
              {complianceCategories.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="content-grid-two-col">
        {/* FORM SECTION */}
        <div className="form-column">
          <section className="card">
            <div className="form-header">
              {editId ? <Edit3 size={20} /> : <Plus size={20} />}
              <h3>{editId ? "Update Record" : "New Filing"}</h3>
            </div>

            {editId ? (
              <form onSubmit={handleUpdateSubmit} className="form-grid">
                <div className="form-group full">
                  <label>Document Title</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Filing Date</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Replace Document (Optional)</label>
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
                  <label>Filing / Report Name</label>
                  <div className="input-with-icon">
                    <FileText size={18} />
                    <input
                      placeholder="e.g. Q3 Shareholding Pattern"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group half">
                  <label>Filing Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>PDF Filing</label>
                  <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} required />
                </div>
                <button type="submit" className="btn full" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <><UploadCloud size={18} /> Publish Compliance</>}
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
              <Activity size={20} />
              <h3>{option} filings</h3>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <Loader2 className="animate-spin muted" size={40} />
                <p className="muted">Syncing regulatory data...</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "name",
                    label: "Report Title",
                    render: (r) => (
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                        {r.name}
                      </div>
                    )
                  },
                  {
                    key: "date",
                    label: "Date",
                    width: "130px",
                    render: (r) => (
                      <div className="muted" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} /> {r.date}
                      </div>
                    )
                  },
                  {
                    key: "file",
                    label: "Document",
                    width: "100px",
                    render: (r) => (
                      r.file ? (
                        <a href={r.file} target="_blank" rel="noreferrer" className="btn-outline btn-sm" style={{ color: "var(--primary)" }}>
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
        .content-grid-two-col { display: grid; grid-template-columns: 1fr 1.8fr; gap: 2rem; align-items: start; }
        .form-column { position: sticky; top: 1.5rem; }
        .category-select-wrapper {
          display: flex; align-items: center; gap: 0.75rem; background: white;
          padding: 0 1rem; border-radius: 12px; border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        .category-select-wrapper select {
          border: none; padding: 0.75rem 0; font-weight: 600; font-size: 0.9rem;
          color: var(--text-main); outline: none; background: transparent; min-width: 250px;
        }

        @media (max-width: 1200px) {
          .content-grid-two-col { grid-template-columns: 1fr; }
          .form-column { position: static; }
        }
      `}</style>
    </div>
  );
}
