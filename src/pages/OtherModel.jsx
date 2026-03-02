import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {
  FileText, Users, Phone, Mail, MapPin, Briefcase,
  Plus, Edit3, Trash2, Calendar, UploadCloud,
  Info, Loader2, ArrowRight, X, UserCheck, Settings2
} from "lucide-react";
import { authHeader } from "../auth";
import "../components/css/Form.css";

export default function OtherModel() {
  const [option, setOption] = useState("");
  const [file, setFile] = useState(null);
  const [list, setList] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

  const [details, setDetails] = useState({
    name: "",
    date: "",
    contactInfo: ""
  });

  const [contactInfo, setContactInfo] = useState({
    name: "",
    designation: "",
    office: "",
    company: "",
    address: "",
    phone: "",
    email: "",
  });

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/other`;

  useEffect(() => {
    if (option) fetchList();
    setMessage("");
  }, [option]);

  const fetchList = async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${API_BASE}/get_other/?option=${option}`); // Changed to use 'option=' for query param
      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      const formattedData = (json.data || []).flatMap((item) => {
        // Handle both 'details' array and 'contactInfo' object
        if (item.details && Array.isArray(item.details)) {
          return item.details.map((detail) => ({
            _id: detail._id?.$oid || detail._id,
            name: detail.name,
            date: detail.date?.$date
              ? new Date(detail.date.$date).toISOString().split("T")[0]
              : (detail.date || ""),
            file: detail.file,
            parentId: item._id?.$oid || item._id,
          }));
        } else if (item.contactInfo) {
          // Assuming contactInfo is directly on the item for KMP/Investor
          return [{
            _id: item._id?.$oid || item._id,
            name: item.name, // Use item.name for the main title
            date: item.date?.$date
              ? new Date(item.date.$date).toISOString().split("T")[0]
              : (item.date || ""),
            contactInfo: item.contactInfo, // Store full contact info
            parentId: item._id?.$oid || item._id,
          }];
        }
        return [];
      });

      setList(formattedData);
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.name);
    setEditDate(row.date);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id, option }), // Pass option for targeted deletion
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchList();
      setMessage("Entry deleted successfully!");
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName) return setMessage("Please fill required fields");
    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("details", JSON.stringify({ name: editName, date: editDate }));
      if (editFile) formData.append("file", editFile);
      formData.append("detailId", editId); // Pass the specific detail ID to update

      const res = await fetch(`${API_BASE}/update_other/${editId}`, { // The main ID of the parent document
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("shyam_token")}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");
      setEditId(null);
      setEditFile(null);
      fetchList();
      setMessage("Entry updated successfully");
    } catch (e) {
      setMessage("Error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleOtherComplianceSubmit = async (e) => {
    e.preventDefault();
    if (!option || !details.name || !file) return setMessage("Please fill all required fields.");

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("details", JSON.stringify({ name: details.name, date: details.date }));
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_other`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");

      setMessage("Record added successfully");
      setDetails({ name: "", date: "", contactInfo: "" });
      setFile(null);
      fetchList();
    } catch (err) {
      setMessage("Server error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!option || !details.name || !contactInfo.name) return setMessage("Please fill all required fields.");

    setUploading(true);
    setMessage("");

    try {
      const payload = {
        option,
        name: details.name,
        date: details.date,
        contactInfo: contactInfo,
      };

      const res = await fetch(`${API_BASE}/add_other`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");

      setMessage("Contact information saved successfully");
      setDetails({ name: "", date: "" });
      setContactInfo({ name: "", designation: "", office: "", company: "", address: "", phone: "", email: "" });
      fetchList();
    } catch (err) {
      setMessage("Server error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modern-page">
      <div className="page-header">
        <div>
          <h2>Other Compliances & Contacts</h2>
          <p className="muted">Manage statutory filings, KMP details, and investor relations infrastructure.</p>
        </div>
        <div className="header-actions">
          <div className="category-select-wrapper">
            <Settings2 size={16} />
            <select value={option} onChange={(e) => setOption(e.target.value)}>
              <option value="">Choose Management Area</option>
              <option value="Other Compliances">Other Compliances</option>
              <option value="KMP Contact Details">KMP Contact Details</option>
              <option value="Investor Relations Contact">Investor Relations Contact</option>
            </select>
          </div>
        </div>
      </div>

      {!option && (
        <div className="empty-state-card">
          <Info size={40} className="muted" />
          <h3>Select a Category</h3>
          <p>Choose an option from the dropdown above to start managing records.</p>
        </div>
      )}

      {option && (
        <div className="content-grid-two-col">
          {/* FORM SECTION */}
          <div className="form-column">
            <section className="card">
              <div className="form-header">
                {editId ? <Edit3 size={20} /> : <Plus size={20} />}
                <h3>{editId ? "Update Entry" : `New ${option} Record`}</h3>
              </div>

              {editId ? (
                <form onSubmit={handleUpdateSubmit} className="form-grid">
                  <div className="form-group full">
                    <label>Title / Document Name</label>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div className="form-group half">
                    <label>Publication Date</label>
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                  </div>
                  <div className="form-group half">
                    <label>Updated Document (Optional)</label>
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
                <>
                  {option === "Other Compliances" ? (
                    <form onSubmit={handleOtherComplianceSubmit} className="form-grid">
                      <div className="form-group full">
                        <label>Compliance Title</label>
                        <div className="input-with-icon">
                          <FileText size={18} />
                          <input
                            placeholder="e.g. CSR Policy Document"
                            value={details.name}
                            onChange={(e) => setDetails({ ...details, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group half">
                        <label>Effective Date</label>
                        <input
                          type="date"
                          value={details.date}
                          onChange={(e) => setDetails({ ...details, date: e.target.value })}
                        />
                      </div>
                      <div className="form-group half">
                        <label>PDF Document</label>
                        <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} required />
                      </div>
                      <button type="submit" className="btn full" disabled={uploading}>
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : <><UploadCloud size={18} /> Publish Compliance</>}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="form-grid">
                      <div className="form-section-title">Common Details</div>
                      <div className="form-group half">
                        <label>Category Title</label>
                        <input value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} required />
                      </div>
                      <div className="form-group half">
                        <label>Last Updated</label>
                        <input type="date" value={details.date} onChange={(e) => setDetails({ ...details, date: e.target.value })} />
                      </div>

                      <div className="form-section-title">Personal Information</div>
                      <div className="form-group full">
                        <label>Contact Person Name</label>
                        <div className="input-with-icon">
                          <Users size={18} />
                          <input value={contactInfo.name} onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })} required />
                        </div>
                      </div>
                      <div className="form-group half">
                        <label>Designation</label>
                        <div className="input-with-icon">
                          <Briefcase size={18} />
                          <input value={contactInfo.designation} onChange={(e) => setContactInfo({ ...contactInfo, designation: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group half">
                        <label>Office / Branch</label>
                        <input value={contactInfo.office} onChange={(e) => setContactInfo({ ...contactInfo, office: e.target.value })} />
                      </div>
                      <div className="form-group full">
                        <label>Address</label>
                        <div className="input-with-icon">
                          <MapPin size={18} />
                          <textarea value={contactInfo.address} onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })} rows={2} />
                        </div>
                      </div>
                      <div className="form-group half">
                        <label>Phone Number</label>
                        <div className="input-with-icon">
                          <Phone size={18} />
                          <input value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group half">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                          <Mail size={18} />
                          <input type="email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
                        </div>
                      </div>
                      <button type="submit" className="btn full" disabled={uploading}>
                        {uploading ? <Loader2 className="animate-spin" size={20} /> : "Save Contact Profile"}
                      </button>
                    </form>
                  )}
                </>
              )}
              {message && <div className={`form-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
            </section>
          </div>

          {/* TABLE SECTION */}
          <div className="table-column">
            <section className="card">
              <div className="form-header">
                <FileText size={20} />
                <h3>Existing {option}</h3>
              </div>

              {loadingList ? (
                <div style={{ padding: "4rem", textAlign: "center" }}>
                  <Loader2 className="animate-spin muted" size={40} />
                  <p className="muted">Syncing data...</p>
                </div>
              ) : (
                <DataTable
                  columns={[
                    {
                      key: "name",
                      label: "Document / Title",
                      render: (r) => (
                        <div>
                          <div style={{ fontWeight: "600" }}>{r.name}</div>
                          {r.file && (
                            <a href={r.file} target="_blank" rel="noreferrer" className="table-link">
                              View Attachment
                            </a>
                          )}
                          {r.contactInfo && (
                            <div className="contact-info-preview">
                              <div className="contact-name"><UserCheck size={14} /> {r.contactInfo.name}</div>
                              {r.contactInfo.designation && <div className="contact-designation"><Briefcase size={14} /> {r.contactInfo.designation}</div>}
                              {r.contactInfo.phone && <div className="contact-phone"><Phone size={14} /> {r.contactInfo.phone}</div>}
                              {r.contactInfo.email && <div className="contact-email"><Mail size={14} /> {r.contactInfo.email}</div>}
                            </div>
                          )}
                        </div>
                      )
                    },
                    {
                      key: "date",
                      label: "Date",
                      width: "120px",
                      render: (r) => (
                        <div className="muted" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={14} /> {r.date}
                        </div>
                      )
                    },
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
      )}

      <style>{`
        .modern-page { animation: fadeIn 0.4s ease-out; }
        .category-select-wrapper {
          display: flex; align-items: center; gap: 0.75rem; background: white;
          padding: 0 1rem; border-radius: 12px; border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        .category-select-wrapper select {
          border: none; padding: 0.75rem 0; font-weight: 600; font-size: 0.9rem;
          color: var(--text-main); outline: none; background: transparent; min-width: 240px;
        }
        .content-grid-two-col { display: grid; grid-template-columns: 1fr 1.2fr; gap: 2rem; align-items: start; }
        .form-column { position: sticky; top: 1.5rem; }
        .form-section-title {
          grid-column: span 12; padding: 1rem 0 0.5rem; margin-top: 0.5rem;
          border-bottom: 1px solid var(--border-color); color: var(--primary);
          font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;
        }
        .table-link { font-size: 0.75rem; color: var(--primary); text-decoration: none; display: block; margin-top: 2px; }
        .table-link:hover { text-decoration: underline; }
        .contact-info-preview {
          margin-top: 8px;
          font-size: 0.8rem;
          color: var(--text-light);
          display: grid;
          gap: 4px;
        }
        .contact-info-preview > div {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 1200px) { .content-grid-two-col { grid-template-columns: 1fr; } .form-column { position: static; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
