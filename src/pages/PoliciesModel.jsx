import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  Shield, Calendar, FileText, UploadCloud,
  Plus, Edit3, Trash2, Loader2, Info, ArrowRight, X
} from "lucide-react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

export default function PoliciesModel() {
  const [policyName, setPolicyName] = useState("");
  const [policyDate, setPolicyDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get_policy`);
      if (!res.ok) throw new Error("Failed to fetch policies");
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
    if (!policyName || !policyDate || !file) return setMessage("Please provide policy name, date and a file.");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("policy_name", policyName);
      formData.append("policy_date", policyDate);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_policy`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Upload failed");

      setMessage("Policy published successfully");
      setPolicyName("");
      setPolicyDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
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
    setEditName(row.policy_name);
    setEditDate(row.policy_date ? new Date(row.policy_date).toISOString().split('T')[0] : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editDate) return alert("Please fill all required fields");

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("policy_name", editName);
      formData.append("policy_date", editDate);
      if (editFile) formData.append("file", editFile);

      const res = await fetch(`${API_BASE}/update_policy/${editId}`, {
        method: "PUT",
        headers: { ...authHeader() },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      setEditId(null);
      setEditFile(null);
      fetchList();
      alert("Policy updated successfully");
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
          <h2>Corporate Policies</h2>
          <p className="muted">Manage and publish internal regulatory and governance frameworks.</p>
        </div>
        <div className="badge secondary"><Shield size={14} /> Compliance Standards</div>
      </div>

      <div className="content-grid-two-col">
        {/* FORM SECTION */}
        <div className="form-column">
          <section className="card">
            <div className="form-header">
              {editId ? <Edit3 size={20} /> : <Plus size={20} />}
              <h3>{editId ? "Update Policy" : "Create New Policy"}</h3>
            </div>

            {editId ? (
              <form onSubmit={handleUpdateSubmit} className="form-grid">
                <div className="form-group full">
                  <label>Full Policy Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Effective Date</label>
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
                  <label>Policy Designation</label>
                  <div className="input-with-icon">
                    <FileText size={18} />
                    <input
                      placeholder="e.g. Code of Business Conduct"
                      value={policyName}
                      onChange={(e) => setPolicyName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group half">
                  <label>Effective Date</label>
                  <input
                    type="date"
                    value={policyDate}
                    onChange={(e) => setPolicyDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Upload Document (PDF)</label>
                  <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} required />
                </div>
                <button type="submit" className="btn full" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <><UploadCloud size={18} /> Publish to Portal</>}
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
              <Shield size={20} />
              <h3>Active Policies</h3>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <Loader2 className="animate-spin muted" size={40} />
                <p className="muted">Retrieving documents...</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "policy_name",
                    label: "Policy Name",
                    render: (r) => (
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                        {r.policy_name}
                      </div>
                    )
                  },
                  {
                    key: "policy_date",
                    label: "Effective Date",
                    width: "140px",
                    render: (r) => (
                      <div className="muted" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} /> {new Date(r.policy_date).toLocaleDateString()}
                      </div>
                    )
                  },
                  {
                    key: "policy_file",
                    label: "Action",
                    width: "100px",
                    render: (r) => (
                      r.policy_file ? (
                        <a href={r.policy_file} target="_blank" rel="noreferrer" className="btn-outline btn-sm" style={{ color: "var(--primary)" }}>
                          View
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
        .content-grid-two-col { display: grid; grid-template-columns: 1.2fr 2fr; gap: 2rem; align-items: start; }
        .form-column { position: sticky; top: 1.5rem; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 1024px) {
          .content-grid-two-col { grid-template-columns: 1fr; }
          .form-column { position: static; }
        }
      `}</style>
    </div>
  );
}
