import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../components/DataTable";
import {
  Search, Eye, Trash2, User, Mail, Phone, Briefcase,
  Calendar, X, Loader2, FileText, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Download
} from "lucide-react";
import { exportToCSV } from "../utils/csvExport";
import "../components/css/Form.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs/applications/all`);
      setApplications(res.data || []);
    } catch (err) {
      console.error("Fetch applications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await axios.delete(`${API_BASE}/jobs/applications/delete/${id}`);
      fetchApplications();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const updateApplication = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE}/jobs/applications/update/${selectedApp._id}`,
        {
          status: selectedApp.status,
          adminRemark: selectedApp.adminRemark,
        }
      );
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      app.fullName?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.jobId?.title?.toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Selected": return <span className="badge success"><CheckCircle size={12} /> Selected</span>;
      case "Rejected": return <span className="badge danger"><XCircle size={12} /> Rejected</span>;
      case "Shortlisted": return <span className="badge primary"><Clock size={12} /> Shortlisted</span>;
      default: return <span className="badge secondary"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Job Applications</h2>
          <p className="muted">Review and manage candidates applying for various positions.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            className="btn-primary"
            onClick={() => exportToCSV(filteredApplications, "job_applications.csv", [
              { key: "fullName", label: "Candidate Name" },
              { key: "email", label: "Email" },
              { key: "mobile", label: "Mobile" },
              { key: "jobId.title", label: "Position" },
              { key: "totalExperience", label: "Experience" },
              { key: "status", label: "Status" },
              { key: "adminRemark", label: "Admin Remark" },
              { key: "resume", label: "Resume Link" },
              { key: "createdAt", label: "Applied On" },
            ])}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Download size={18} /> Export CSV
          </button>
          <div className="badge primary">{filteredApplications.length} Total Applications</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <div className="form-grid" style={{ alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 2 }}>
            <label>Search Candidates</label>
            <div className="input-with-icon">
              <Search size={18} />
              <input
                placeholder="Search by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Filter by Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Selected">Selected</option>
            </select>
          </div>
          <button className="btn-outline" onClick={fetchApplications} disabled={loading} style={{ height: "42px" }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Refresh"}
          </button>
        </div>
      </div>

      <section className="card" style={{ padding: "1.5rem" }}>
        <DataTable
          columns={[
            {
              key: "fullName",
              label: "Candidate",
              render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div className="avatar-placeholder">{r.fullName?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{r.fullName}</div>
                    <div className="muted" style={{ fontSize: "0.75rem" }}>{r.email}</div>
                  </div>
                </div>
              )
            },
            {
              key: "jobId",
              label: "Applied For",
              render: (r) => (
                <div>
                  <div style={{ fontWeight: "500" }}>{r.jobId?.title || "Deleted Job"}</div>
                  <div className="muted" style={{ fontSize: "0.75rem" }}>{r.totalExperience || "No exp info"}</div>
                </div>
              )
            },
            {
              key: "status",
              label: "Status",
              width: "140px",
              render: (r) => getStatusBadge(r.status || "Pending")
            },
            {
              key: "createdAt",
              label: "Applied On",
              width: "150px",
              render: (r) => (
                <div className="muted" style={{ fontSize: "0.8rem" }}>
                  {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                </div>
              )
            }
          ]}
          data={filteredApplications}
          actions={(row) => (
            <div className="dt-actions">
              <button className="btn-outline btn-sm" style={{ color: "var(--primary)" }} onClick={() => setSelectedApp(row)} title="View & Edit">
                <Eye size={16} />
              </button>
              <button className="btn-outline btn-sm" style={{ color: "var(--danger)" }} onClick={() => deleteApplication(row._id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        />
      </section>

      {selectedApp && (
        <div className="modal-overlay">
          <div className="form-card" style={{ maxWidth: "700px", width: "100%" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Application Details</h3>
                <p>Review candidate profile and update hiring status.</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={updateApplication}>
              <div className="candidate-profile">
                <div className="profile-section">
                  <div className="info-block">
                    <User size={16} />
                    <span><b>Full Name:</b> {selectedApp.fullName}</span>
                  </div>
                  <div className="info-block">
                    <Mail size={16} />
                    <span><b>Email:</b> {selectedApp.email}</span>
                  </div>
                  <div className="info-block">
                    <Phone size={16} />
                    <span><b>Mobile:</b> {selectedApp.mobile}</span>
                  </div>
                </div>
                <div className="profile-section">
                  <div className="info-block">
                    <Briefcase size={16} />
                    <span><b>Position:</b> {selectedApp.jobId?.title || "N/A"}</span>
                  </div>
                  <div className="info-block">
                    <Clock size={16} />
                    <span><b>Experience:</b> {selectedApp.totalExperience}</span>
                  </div>
                  <div className="info-block">
                    <FileText size={16} />
                    <a href={selectedApp.resume} target="_blank" rel="noreferrer" className="link">View Full Resume / CV</a>
                  </div>
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: "1.5rem" }}>
                <div className="form-group full-width">
                  <label>Update Hiring Status</label>
                  <select
                    value={selectedApp.status || "Pending"}
                    onChange={(e) => setSelectedApp({ ...selectedApp, status: e.target.value })}
                  >
                    <option>Pending</option>
                    <option>Shortlisted</option>
                    <option>Rejected</option>
                    <option>Selected</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Internal Admin Remarks</label>
                  <textarea
                    placeholder="Add notes about the interview or candidate quality..."
                    value={selectedApp.adminRemark || ""}
                    onChange={(e) => setSelectedApp({ ...selectedApp, adminRemark: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="btn-outline" onClick={() => setSelectedApp(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .avatar-placeholder {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--primary-light); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 1.2rem;
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1.5rem;
        }
        .candidate-profile {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
          padding: 1.5rem; background: var(--bg-secondary); border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .info-block {
          display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;
          color: var(--text-main); font-size: 0.9rem;
        }
        .info-block svg { color: var(--primary); opacity: 0.8; }
        .link { color: var(--primary); text-decoration: underline; font-weight: 500; }
        .badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
        }
        .badge.primary { background: var(--primary-light); color: var(--primary); }
        .badge.success { background: #ecfdf5; color: #059669; border: 1px solid #10b98133; }
        .badge.danger { background: #fef2f2; color: #dc2626; border: 1px solid #ef444433; }
        .badge.secondary { background: var(--bg-secondary); color: var(--text-muted); border: 1px solid var(--border-color); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}