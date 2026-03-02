import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  Scale, Calendar, FileText, Globe, UploadCloud,
  Plus, Edit3, Trash2, Loader2, Info, ArrowRight, X
} from "lucide-react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

export default function SebiOnlineDisputeModel() {
  const [sebiName, setSebiName] = useState("");
  const [sebiDate, setSebiDate] = useState("");
  const [file, setFile] = useState(null);
  const [extraLink, setExtraLink] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editExtraLink, setEditExtraLink] = useState("");

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/sebi`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get_sebi`);
      if (!res.ok) throw new Error("Failed to fetch SEBI data");
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
    if (!sebiName) return setMessage("Please provide a name.");
    if (!file && !extraLink) return setMessage("Please provide either a PDF document or a reference link.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("sebi_name", sebiName);
      formData.append("sebi_date", sebiDate);
      if (file) formData.append("file", file);
      if (extraLink) formData.append("extra_link", extraLink);

      const res = await fetch(`${API_BASE}/add_sebi`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Submission failed");

      setMessage("SEBI record added successfully");
      setSebiName("");
      setSebiDate("");
      setFile(null);
      setExtraLink("");
      fetchList();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this SEBI record permanently?")) return;
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
    setEditName(row.sebi_name);
    setEditDate(row.sebi_date || "");
    setEditExtraLink(row.extra_link || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName) return alert("Please fill the name field");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("sebi_name", editName);
      formData.append("sebi_date", editDate);
      if (editFile) formData.append("file", editFile);
      if (editExtraLink) formData.append("extra_link", editExtraLink);

      const res = await fetch(`${API_BASE}/update_sebi/${editId}`, {
        method: "PUT",
        headers: { ...authHeader() },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      setEditId(null);
      setEditFile(null);
      fetchList();
      alert("SEBI record updated successfully");
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
          <h2>SEBI Online Dispute Resolution</h2>
          <p className="muted">Manage SCORES filings, online dispute mechanisms, and regulatory compliance communications.</p>
        </div>
        <div className="badge secondary"><Scale size={14} /> Regulatory Affairs</div>
      </div>

      <div className="content-grid-two-col">
        {/* FORM SECTION */}
        <div className="form-column">
          <section className="card">
            <div className="form-header">
              {editId ? <Edit3 size={20} /> : <Plus size={20} />}
              <h3>{editId ? "Edit Record" : "New SEBI Entry"}</h3>
            </div>

            {editId ? (
              <form onSubmit={handleUpdateSubmit} className="form-grid">
                <div className="form-group full">
                  <label>Filing/Dispute Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Filing Date (Optional)</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                </div>
                <div className="form-group half">
                  <label>Update PDF (Optional)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setEditFile(e.target.files && e.target.files[0])} />
                </div>
                <div className="form-group full">
                  <label>External Reference Link (Optional)</label>
                  <div className="input-with-icon">
                    <Globe size={16} />
                    <input value={editExtraLink} onChange={(e) => setEditExtraLink(e.target.value)} placeholder="https://..." />
                  </div>
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
                  <label>Subject / Document Title</label>
                  <div className="input-with-icon">
                    <FileText size={18} />
                    <input
                      placeholder="e.g. SEBI ODR Circular - August 2024"
                      value={sebiName}
                      onChange={(e) => setSebiName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group half">
                  <label>Effective Date</label>
                  <input
                    type="date"
                    value={sebiDate}
                    onChange={(e) => setSebiDate(e.target.value)}
                  />
                </div>
                <div className="form-group half">
                  <label>PDF Document</label>
                  <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files && e.target.files[0])} />
                </div>
                <div className="form-group full">
                  <label>External Portal Link</label>
                  <div className="input-with-icon">
                    <Globe size={18} />
                    <input
                      placeholder="e.g. https://scores.sebi.gov.in"
                      value={extraLink}
                      onChange={(e) => setExtraLink(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn full" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <><UploadCloud size={18} /> Publish SEBI Record</>}
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
              <Scale size={20} />
              <h3>Compliance Repository</h3>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <Loader2 className="animate-spin muted" size={40} />
                <p className="muted">Retrieving regulatory data...</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "sebi_name",
                    label: "Title",
                    render: (r) => (
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                        {r.sebi_name}
                      </div>
                    )
                  },
                  {
                    key: "sebi_date",
                    label: "Date",
                    width: "120px",
                    render: (r) => (
                      <div className="muted" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} /> {r.sebi_date || "N/A"}
                      </div>
                    )
                  },
                  {
                    key: "sebi_file",
                    label: "Links",
                    width: "160px",
                    render: (r) => (
                      <div style={{ display: "flex", gap: "8px" }}>
                        {r.sebi_file && (
                          <a href={r.sebi_file} target="_blank" rel="noreferrer" className="badge primary-subtle link-badge">
                            <FileText size={12} /> PDF
                          </a>
                        )}
                        {r.extra_link && (
                          <a href={r.extra_link} target="_blank" rel="noreferrer" className="badge info-subtle link-badge">
                            <Globe size={12} /> URL
                          </a>
                        )}
                        {!r.sebi_file && !r.extra_link && <span className="muted">—</span>}
                      </div>
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
        .link-badge {
          text-decoration: none; display: flex; align-items: center; gap: 4px;
          font-weight: 600; font-size: 11px; transition: all 0.2s;
        }
        .link-badge:hover { opacity: 0.8; transform: translateY(-1px); }
        .badge.info-subtle { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }

        @media (max-width: 1200px) {
          .content-grid-two-col { grid-template-columns: 1fr; }
          .form-column { position: static; }
        }
      `}</style>
    </div>
  );
}
