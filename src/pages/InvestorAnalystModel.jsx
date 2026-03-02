import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Edit, Trash2, Plus, Loader2, FileText, Calendar, Filter, X, Users, Mic, Presentation, Info } from "lucide-react";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function InvestorAnalystModel() {
  const [titlename, setTitlename] = useState("Investors/Analyst Meet");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({ name: "", date: "", titlename: "Investors/Analyst Meet", file: null });

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/investor-analyst`;

  const titleOptions = [
    "Investors/Analyst Meet",
    "Investor Presentation",
    "Transcript",
    "Investor Call Intimation",
    "Investor Call Recording",
  ];

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_investor_analyst`, { headers: authHeader() });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const resetForm = () => {
    setName(""); setDate(""); setFile(null);
    setEditId(null); setEditFields({ name: "", date: "", titlename: "Investors/Analyst Meet", file: null });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !date || !file) {
      setMessage("Please provide all required fields.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("titlename", titlename);
      formData.append("investor_analyst_name", name);
      formData.append("investor_analyst_date", date);
      formData.append("investor_analyst_file", file);

      const res = await fetch(`${API_BASE}/add_investor_analyst`, {
        method: "POST",
        headers: authHeader(false),
        body: formData,
      });

      if (!res.ok) {
        const result = await res.json();
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage("Record added successfully!");
      resetForm();
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchList();
      else alert("Delete failed");
    } catch (e) {
      alert("Network error");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditFields({
      name: row.investor_analyst_name,
      date: row.investor_analyst_date?.split("T")[0] || "",
      titlename: row.titlename,
      file: null
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("titlename", editFields.titlename);
      formData.append("investor_analyst_name", editFields.name);
      formData.append("investor_analyst_date", editFields.date);
      if (editFields.file) formData.append("file", editFields.file);

      const res = await fetch(`${API_BASE}/update_investor_analyst/${editId}`, {
        method: "PUT",
        headers: authHeader(false),
        body: formData,
      });

      if (res.ok) {
        resetForm();
        fetchList();
      } else alert("Update failed");
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setUploading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "Transcript": return <FileText size={18} />;
      case "Investor Call Recording": return <Mic size={18} />;
      case "Investor Presentation": return <Presentation size={18} />;
      case "Investor Call Intimation": return <Info size={18} />;
      default: return <Users size={18} />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Investor & Analyst Relations</h2>
          <p className="muted">Manage meetings, presentations, transcripts, and call recordings.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Add New Record</h3>
          <p>Select category and upload related documents or files.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <div className="input-with-icon">
                <Filter size={18} />
                <select value={titlename} onChange={(e) => setTitlename(e.target.value)}>
                  {titleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Meeting / Presentation Name</label>
              <input
                placeholder="e.g. Q4 Analyst Meet - Mumbai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Event Date</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Upload File (PDF/Docs/Audio)</label>
              <div className="input-with-icon">
                <FileText size={18} />
                <input
                  type="file"
                  className="form-input"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  required
                />
              </div>
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
        <div className="form-header" style={{ border: "none", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="category-filter">
              <Filter size={16} />
              <select value={titlename} onChange={(e) => setTitlename(e.target.value)} style={{ border: "none", background: "transparent", fontWeight: "600", outline: "none" }}>
                <option value="">All Categories</option>
                {titleOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="badge secondary">{list.filter(item => !titlename || item.titlename === titlename).length} Entries</div>
        </div>

        <DataTable
          columns={[
            {
              key: "investor_analyst_name",
              label: "Record Details",
              render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div className="icon-badge">{getIcon(r.titlename)}</div>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{r.investor_analyst_name}</div>
                    <div className="muted" style={{ fontSize: "0.75rem" }}>{r.titlename}</div>
                  </div>
                </div>
              )
            },
            {
              key: "investor_analyst_date",
              label: "Date",
              width: "150px",
              render: (r) => (
                <div className="muted" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Calendar size={14} /> {new Date(r.investor_analyst_date).toLocaleDateString()}
                </div>
              )
            },
            {
              key: "investor_analyst_file",
              label: "File",
              width: "100px",
              render: (r) => r.investor_analyst_file ? (
                <a href={r.investor_analyst_file} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                  <FileText size={14} /> View
                </a>
              ) : "-"
            }
          ]}
          data={list.filter(item => !titlename || item.titlename === titlename)}
          actions={(row) => (
            <div className="dt-actions">
              <button className="btn-outline btn-sm" style={{ color: "var(--primary)" }} onClick={() => handleEdit(row)} title="Edit">
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
                <h3>Edit Record</h3>
                <p>Modify event details or replace files.</p>
              </div>
              <button className="btn-outline btn-sm" onClick={resetForm}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Category</label>
                  <select value={editFields.titlename} onChange={(e) => setEditFields({ ...editFields, titlename: e.target.value })}>
                    {titleOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Record Name</label>
                  <input value={editFields.name} onChange={(e) => setEditFields({ ...editFields, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={editFields.date} onChange={(e) => setEditFields({ ...editFields, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Replace File (Optional)</label>
                  <input type="file" className="form-input" onChange={(e) => setEditFields({ ...editFields, file: e.target.files?.[0] })} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .icon-badge {
          width: 40px; height: 40px; border-radius: 8px;
          background: var(--bg-secondary); display: flex;
          align-items: center; justify-content: center;
          color: var(--primary);
        }
        .category-filter {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; background: var(--bg-secondary);
          border-radius: 8px; border: 1px solid var(--border-color);
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1.5rem;
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .badge {
          padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
        }
        .badge.secondary { background: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color); }
      `}</style>
    </div>
  );
}
