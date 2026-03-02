import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Edit, Trash2, Plus, Loader2, Eye, X, FileText, Link as LinkIcon, Hash, Calendar } from "lucide-react";
import "../components/css/Form.css";

export default function DisclosuresAdmin() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [customTitle, setCustomTitle] = useState(""); // for "Other"
  const [file, setFile] = useState(null);
  const [extraLink, setExtraLink] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [disclosures, setDisclosures] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [editCustomTitle, setEditCustomTitle] = useState("");

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/disclosure`;

  const mainTitleOptions = [
    "Details of Business",
    "Memorandum of Association and Articles of Association",
    "Brief Profile of Board of Directors including Directorship and Full-time Positions in Body Corporates",
    "Terms and conditions of appointment of independent directors",
    "Composition of various committees of board of directors",
    "Code of conduct of board of directors and senior management personnel",
    "Details of establishment of vigil mechanism/Whistle Blower policy",
    "Policy on dealing with related party transactions",
    "Policy for determining ‘material’ subsidiaries",
    "Details of familiarization programmes imparted to directors",
    "Email address for grievance redressal and other relevant details",
    "Contact information of the designated officials responsible for assisting and handling investor grievances",
    "Notice of meeting of the Board of Directors where financial results shall be discussed",
    "Financial results approved at the Board Meeting",
    "Complete copy of the Annual Report including Balance Sheet, Profit and Loss Account, Directors’ Report, Corporate Governance Report, etc.",
    "Shareholding pattern",
    "Schedule of analyst or institutional investor meet",
    "Presentations made to analysts or institutional investors",
    "Audio or video recordings of post-earnings/quarterly calls",
    "Transcripts of post-earnings/quarterly calls",
    "Items under sub-regulation (1) of Regulation 47",
    "All credit ratings obtained for outstanding instruments",
    "Separate audited financial statements of each subsidiary of the listed entity in respect of a relevant financial year",
    "Secretarial Compliance Report",
    "Policy for determination of materiality of events/information",
    "Contact details of Key Managerial Personnel authorized for determining materiality of events/information",
    "Dividend Distribution Policy",
    "Annual Return",
    "Disclosure required under Regulation 30(8)",
    "Other"
  ];

  useEffect(() => {
    fetchDisclosures();
  }, []);

  const fetchDisclosures = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_disclosure`);
      const data = await res.json();
      if (res.ok) setDisclosures(data.data || []);
      else setDisclosures([]);
    } catch (err) {
      console.error(err);
      setDisclosures([]);
    }
  };

  const handleFileSelect = (e, isEdit = false) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      alert("Only .pdf files are allowed");
      return;
    }

    if (isEdit)
      setEditFields({ ...editFields, fileObj: selectedFile });
    else
      setFile(selectedFile);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");

    const finalMainTitle = mainTitle === "Other" ? customTitle : mainTitle;
    if (!finalMainTitle) {
      setMessage("Main Title is required.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("date", date);
    formData.append("mainTitle", finalMainTitle);
    formData.append("extraLink", extraLink);
    formData.append("sequenceNumber", sequenceNumber);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/create_disclosure`, {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Error creating disclosure");
      } else {
        setMessage("Disclosure created successfully!");
        setName(""); setDate(""); setMainTitle(""); setCustomTitle(""); setExtraLink(""); setFile(null); setSequenceNumber("");
        fetchDisclosures();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this disclosure?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchDisclosures();
      else alert("Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (disclosure) => {
    setEditId(disclosure._id);
    const isPredefined = mainTitleOptions.includes(disclosure.mainTitle);
    setEditFields({
      name: disclosure.name,
      date: disclosure.date?.substring(0, 10) || "",
      mainTitle: isPredefined ? disclosure.mainTitle : "Other",
      extraLink: disclosure.extraLink || "",
      sequenceNumber: disclosure.sequenceNumber || "",
      fileObj: null
    });
    setEditCustomTitle(!isPredefined ? disclosure.mainTitle : "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const finalMainTitle = editFields.mainTitle === "Other" ? editCustomTitle : editFields.mainTitle;
    const formData = new FormData();
    formData.append("name", editFields.name);
    formData.append("date", editFields.date);
    formData.append("mainTitle", finalMainTitle);
    formData.append("extraLink", editFields.extraLink);
    formData.append("sequenceNumber", editFields.sequenceNumber);
    if (editFields.fileObj) formData.append("file", editFields.fileObj);

    try {
      const res = await fetch(`${API_BASE}/update_disclosure/${editId}`, { method: "PUT", body: formData });
      if (res.ok) {
        setEditId(null); setEditFields({}); setEditCustomTitle(""); fetchDisclosures();
      } else alert("Update failed");
    } catch (err) {
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Disclosures Management</h2>
          <p className="muted">Regulate and publish statutory disclosures and corporate information.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Add New Disclosure</h3>
          <p>Fill in the details and upload the relevant PDF document.</p>
        </div>

        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Main Category Title</label>
              <select
                className="form-input"
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                required
              >
                <option value="">-- Choose Category --</option>
                {mainTitleOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {mainTitle === "Other" && (
              <div className="form-group full-width">
                <label>Custom Title</label>
                <input
                  placeholder="Enter the custom title here"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Document Name</label>
              <input
                placeholder="e.g. Annual Report 2023"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Reference Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Sequence Number</label>
              <input
                type="number"
                placeholder="Sort order (numeric)"
                value={sequenceNumber}
                onChange={(e) => setSequenceNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Extra External Link (Optional)</label>
              <input
                placeholder="https://example.com"
                value={extraLink}
                onChange={(e) => setExtraLink(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Document Upload (.pdf only)</label>
              <input
                type="file"
                accept=".pdf"
                className="form-input"
                onChange={handleFileSelect}
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
              {uploading ? (
                <><Loader2 className="animate-spin" size={18} /> Uploading...</>
              ) : (
                <><Plus size={18} /> Add Disclosure</>
              )}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem" }}>
          <h3>All Disclosures</h3>
          <p>Complete record of corporate disclosures and filings.</p>
        </div>

        <DataTable
          columns={[
            { key: "sequenceNumber", label: "Seq", width: "80px", render: r => <span style={{ fontWeight: "600", color: "var(--primary)" }}>#{r.sequenceNumber || "0"}</span> },
            { key: "name", label: "Name" },
            {
              key: "mainTitle",
              label: "Category",
              render: r => (
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block", maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.mainTitle}>
                  {r.mainTitle}
                </span>
              )
            },
            {
              key: "date",
              label: "Date",
              width: "120px",
              render: r => r.date ? new Date(r.date).toLocaleDateString() : "-"
            },
            {
              key: "links",
              label: "Files/Links",
              width: "150px",
              render: (r) => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {r.file && (
                    <a href={r.file} target="_blank" rel="noreferrer" className="btn-outline btn-sm" title="View PDF">
                      <FileText size={14} />
                    </a>
                  )}
                  {r.extraLink && (
                    <a href={r.extraLink} target="_blank" rel="noreferrer" className="btn-outline btn-sm" title="External Link">
                      <LinkIcon size={14} />
                    </a>
                  )}
                </div>
              )
            },
          ]}
          data={disclosures}
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
          <div className="form-card" style={{ maxWidth: "700px" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Edit Disclosure</h3>
                <p>Updating "{editFields.name}"</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setEditId(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Category Title</label>
                  <select
                    className="form-input"
                    value={editFields.mainTitle}
                    onChange={(e) => setEditFields({ ...editFields, mainTitle: e.target.value })}
                    required
                  >
                    {mainTitleOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {editFields.mainTitle === "Other" && (
                  <div className="form-group full-width">
                    <label>Custom Title</label>
                    <input
                      value={editCustomTitle}
                      onChange={(e) => setEditCustomTitle(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Document Name</label>
                  <input
                    value={editFields.name}
                    onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editFields.date}
                    onChange={(e) => setEditFields({ ...editFields, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Sequence #</label>
                  <input
                    type="number"
                    value={editFields.sequenceNumber}
                    onChange={(e) => setEditFields({ ...editFields, sequenceNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Extra Link</label>
                  <input
                    value={editFields.extraLink}
                    onChange={(e) => setEditFields({ ...editFields, extraLink: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Update PDF (Optional)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="form-input"
                    onChange={(e) => handleFileSelect(e, true)}
                  />
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