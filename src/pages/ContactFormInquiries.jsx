import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Eye, X, Mail, Phone, Globe, MessageSquare, Loader2, AlertCircle, Download } from "lucide-react";
import { exportToCSV } from "../utils/csvExport";
import DataTable from "../components/DataTable";

const API_BASE = import.meta.env.VITE_API_BASE || "https://shyam-metalics-backend-kzr8.onrender.com";
const API_URL = `${API_BASE}/inquiries`;

export default function ContactFormInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setInquiries(data);
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setInquiries(inquiries.filter((inq) => inq._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    setStatusUpdating(true);
    try {
      await axios.patch(`${API_URL}/${id}/status`, { status });
      setInquiries(
        inquiries.map((inq) => (inq._id === id ? { ...inq, status } : inq))
      );
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Resolved": return "badge-success";
      case "Rejected": return "badge-danger";
      case "In Progress": return "badge-warning";
      default: return "badge-info";
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Contact Inquiries</h2>
          <p className="muted">Review and manage messages from your website visitors.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => exportToCSV(inquiries, "contact_inquiries.csv", [
            { key: "fullName", label: "Full Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "companyName", label: "Company" },
            { key: "industry", label: "Industry" },
            { key: "classification", label: "Classification" },
            { key: "country", label: "Country" },
            { key: "inquiryMessage", label: "Message" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Date" },
          ])}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 1rem" }} />
            <p>Loading inquiries...</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "fullName", label: "Full Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "inquiryMessage", label: "Message" },
              { key: "companyName", label: "Company" },
              {
                key: "status",
                label: "Status",
                width: "150px",
                render: (r) => (
                  <select
                    value={r.status || "Pending"}
                    onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    disabled={statusUpdating}
                    className="form-input"
                    style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                  >
                    {["Pending", "In Progress", "Resolved", "Rejected"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )
              },
            ]}
            data={inquiries}
            actions={(row) => (
              <div className="dt-actions">
                <button
                  className="btn-outline btn-sm"
                  onClick={() => setSelectedInquiry(row)}
                  title="View Details"
                >
                  <Eye size={16} />
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
        )}
      </div>

      {selectedInquiry && (
        <div className="modal-overlay">
          <div className="form-card" style={{ maxWidth: "600px", position: "relative" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Inquiry Details</h3>
                <p>Received on {new Date(selectedInquiry.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setSelectedInquiry(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gap: "1.5rem", padding: "1rem 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="muted" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.25rem" }}>FULL NAME</label>
                  <p style={{ fontWeight: "500" }}>{selectedInquiry.fullName || "-"}</p>
                </div>
                <div>
                  <label className="muted" style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.25rem" }}>COMPANY</label>
                  <p style={{ fontWeight: "500" }}>{selectedInquiry.companyName || "-"}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Mail size={16} className="muted" />
                  <a href={`mailto:${selectedInquiry.email}`} className="link">{selectedInquiry.email || "-"}</a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Phone size={16} className="muted" />
                  <span>{selectedInquiry.phone || "-"}</span>
                </div>
              </div>

              <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                <label className="muted" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                  <MessageSquare size={14} /> MESSAGE
                </label>
                <p style={{ fontSize: "0.9rem", lineHeight: "1.5", color: "var(--text-main)" }}>
                  {selectedInquiry.inquiryMessage || "No message provided."}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
                <div>
                  <span className="muted">Industry:</span> {selectedInquiry.industry || "-"}
                </div>
                <div>
                  <span className="muted">Classification:</span> {selectedInquiry.classification || "-"}
                </div>
                <div>
                  <span className="muted">Country:</span> {selectedInquiry.country || "-"}
                </div>
                <div>
                  <span className="muted">Current Status:</span>
                  <span style={{ marginLeft: "0.5rem", fontWeight: "600" }}>{selectedInquiry.status || "Pending"}</span>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-primary" onClick={() => setSelectedInquiry(null)}>Close</button>
            </div>
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
        .link { color: var(--primary); text-decoration: none; }
        .link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
