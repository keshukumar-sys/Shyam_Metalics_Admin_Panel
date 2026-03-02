import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Edit, Trash2, Plus, Loader2, FileText, Calendar, Filter, X, ChevronRight, Info } from "lucide-react";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function FinancialModel() {
  const [option, setOption] = useState("Annual Report");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [heading, setHeading] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({ name: "", date: "", heading: "", file: null });

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/financial`;

  const reportOptions = [
    "Annual Report",
    "Financial Annual Report",
    "Financial Of Subsidiaries Company",
    "Financial Results",
    "Other",
  ];

  useEffect(() => {
    if (option) fetchList(option);
  }, [option]);

  const fetchList = async (opt) => {
    try {
      const res = await fetch(`${API_BASE}/get_detail/${opt}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const resetForm = () => {
    setName(""); setDate(""); setHeading(""); setFile(null);
    setEditId(null); setEditFields({ name: "", date: "", heading: "", file: null });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!option || !name || !date) {
      setMessage("Please provide all required fields.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("name", name);
      formData.append("date", date);
      formData.append("heading", heading);
      if (file) formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_detail`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const result = await res.json();
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage("Detail added successfully!");
      resetForm();
      fetchList(option);
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
      if (res.ok) fetchList(option);
      else alert("Delete failed");
    } catch (e) {
      alert("Network error");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditFields({
      name: row.name,
      date: row.date?.substring(0, 10) || "",
      heading: row.heading || "",
      file: null
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", editFields.name);
      formData.append("date", editFields.date);
      formData.append("heading", editFields.heading);
      if (editFields.file) formData.append("file", editFields.file);

      const token = localStorage.getItem("shyam_token");
      const res = await fetch(`${API_BASE}/update_financial/${editId}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        resetForm();
        fetchList(option);
      } else alert("Update failed");
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
          <h2>Financial Reports</h2>
          <p className="muted">Manage annual reports, financial results, and subsidiary statements.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Add Financial Detail</h3>
          <p>Upload new reports or statements to the selected category.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Report Category</label>
              <div className="input-with-icon">
                <Filter size={18} />
                <select value={option} onChange={(e) => setOption(e.target.value)}>
                  {reportOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Report Name / Title</label>
              <input
                placeholder="e.g. Q3 Financial Results 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Report Date</label>
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
              <label>Sub-heading (Optional)</label>
              <input
                placeholder="e.g. Audited Results"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Upload Document (PDF)</label>
              <div className="input-with-icon">
                <FileText size={18} />
                <input
                  type="file"
                  accept=".pdf"
                  className="form-input"
                  onChange={(e) => setFile(e.target.files?.[0])}
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
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Uploading...</> : <><Plus size={18} /> Add Detail</>}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3>{option} Archives</h3>
            <p>Historical records for the selected financial category.</p>
          </div>
          <div className="badge primary">{list.length} Records</div>
        </div>

        <DataTable
          columns={[
            {
              key: "name",
              label: "Report Information",
              render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div className="icon-badge"><FileText size={18} /></div>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{r.name}</div>
                    <div className="muted" style={{ fontSize: "0.75rem" }}>{r.heading || "No sub-heading"}</div>
                  </div>
                </div>
              )
            },
            {
              key: "date",
              label: "Release Date",
              width: "150px",
              render: (r) => (
                <div className="muted" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Calendar size={14} /> {new Date(r.date).toLocaleDateString()}
                </div>
              )
            },
            {
              key: "file",
              label: "Action",
              width: "100px",
              render: (r) => r.file ? (
                <a href={r.file} target="_blank" rel="noreferrer" className="btn-outline btn-sm" title="Download/View">
                  <FileText size={14} /> PDF
                </a>
              ) : "-"
            }
          ]}
          data={list}
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
                <h3>Edit Financial Record</h3>
                <p>Modifying: {editFields.name}</p>
              </div>
              <button className="btn-outline btn-sm" onClick={resetForm}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Report Name</label>
                  <input value={editFields.name} onChange={(e) => setEditFields({ ...editFields, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={editFields.date} onChange={(e) => setEditFields({ ...editFields, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Sub-heading</label>
                  <input value={editFields.heading} onChange={(e) => setEditFields({ ...editFields, heading: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Replace File (Optional)</label>
                  <input type="file" accept=".pdf" className="form-input" onChange={(e) => setEditFields({ ...editFields, file: e.target.files?.[0] })} />
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
        .badge.primary { background: var(--primary-light); color: var(--primary); }
      `}</style>
    </div>
  );
}
