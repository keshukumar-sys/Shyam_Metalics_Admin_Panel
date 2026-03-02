import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, MapPin, DollarSign, Briefcase, Trash2,
  Edit, Users, ChevronDown, Image as ImageIcon,
  X, FileText, Send, Building2, TrendingUp,
  Upload, Search, Loader2, Eye, Info, CheckCircle
} from "lucide-react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";

const JobsCreation = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [formData, setFormData] = useState({
    title: "", description: "", location: "", salary: "", img: null,
  });
  const [editId, setEditId] = useState(null);
  const [openJobId, setOpenJobId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/jobs/all`);
      setJobs(res.data || []);
      const apps = {};
      await Promise.all((res.data || []).map(async (job) => {
        try {
          const appRes = await axios.get(`${API_BASE}/jobs/applications/${job._id}`);
          apps[job._id] = appRes.data || [];
        } catch (e) {
          apps[job._id] = [];
        }
      }));
      setApplications(apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (editId) await axios.put(`${API_BASE}/jobs/update/${editId}`, data);
      else await axios.post(`${API_BASE}/jobs/add`, data);

      setEditId(null);
      setFormData({ title: "", description: "", location: "", salary: "", img: null });
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Failed to save job position.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this job posting?")) return;
    try {
      await axios.delete(`${API_BASE}/jobs/delete/${id}`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const totalApps = Object.values(applications).flat().length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Careers & Recruitment</h2>
          <p className="muted">Post new openings and manage candidate applications.</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="label">Live Jobs</span>
            <span className="value">{jobs.length}</span>
          </div>
          <div className="stat-badge primary">
            <span className="label">Total Apps</span>
            <span className="value">{totalApps}</span>
          </div>
        </div>
      </div>

      <div className="content-grid-two-col">
        {/* Job Creation Form */}
        <div className="form-column">
          <div className="form-header">
            <h3>{editId ? "Edit Position" : "Create New Position"}</h3>
            <p>Fill in the details to publish a new career opportunity.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title / Designation</label>
              <div className="input-with-icon">
                <Briefcase size={18} />
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Project Manager"
                  required
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Job Location</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Kolkata, WB"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Salary Range (Optional)</label>
                <div className="input-with-icon">
                  <DollarSign size={18} />
                  <input
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 10 - 15 LPA"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Role Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Key responsibilities, requirements, and benefits..."
                required
              />
            </div>

            <div className="form-group">
              <label>Company/Job Representative Image</label>
              <div className="file-upload-zone" style={{ border: "2px dashed var(--border-color)", borderRadius: "12px", padding: "1.5rem", textAlign: "center", cursor: "pointer", background: "var(--bg-secondary)" }}>
                <input type="file" name="img" onChange={handleChange} style={{ display: "none" }} id="job-img" />
                <label htmlFor="job-img" style={{ cursor: "pointer" }}>
                  <Upload className="muted" size={32} style={{ marginBottom: "0.5rem" }} />
                  <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{formData.img ? formData.img.name : "Click to upload image"}</div>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>PNG, JPG or WEBP (Max 2MB)</div>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: "100%" }}>
                {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Publishing...</> : <><Plus size={18} /> {editId ? "Update Position" : "Publish Vacancy"}</>}
              </button>
              {editId && (
                <button type="button" className="btn-outline" onClick={() => { setEditId(null); setFormData({ title: "", description: "", location: "", salary: "", img: null }) }} style={{ width: "100%", marginTop: "0.5rem" }}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Jobs List */}
        <div className="table-column">
          <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>Live Opportunities</h3>
            <div className="search-bar" style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={16} />
              <input placeholder="Filter jobs..." style={{ paddingLeft: "32px", borderRadius: "20px", border: "1px solid var(--border-color)", height: "36px", fontSize: "0.85rem" }} />
            </div>
          </div>

          <div className="jobs-stack" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {jobs.length > 0 ? jobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                className="card job-item-card"
                style={{ padding: "1.25rem", border: "1px solid var(--border-color)", borderRadius: "16px" }}
              >
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "start" }}>
                  <div className="job-thumb" style={{ width: "60px", height: "60px", borderRadius: "12px", overflow: "hidden", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyCenter: "center" }}>
                    {job.img ? <img src={job.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Briefcase size={24} style={{ color: "var(--primary)" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", fontWeight: "700" }}>{job.title}</h4>
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <span className="muted" style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><MapPin size={12} /> {job.location}</span>
                          <span className="muted" style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }}><DollarSign size={12} /> {job.salary || "Neg."}</span>
                        </div>
                      </div>
                      <div className="dt-actions" style={{ visibility: "hidden", pointerEvents: "none" }}>{/* Placeholder to match spacing if needed */}</div>
                      <div className="job-actions-float">
                        <button className="btn-icon" onClick={() => { setEditId(job._id); setFormData(job); window.scrollTo({ top: 0, behavior: 'smooth' }) }} title="Edit"><Edit size={16} /></button>
                        <button className="btn-icon danger" onClick={() => handleDelete(job._id)} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>

                    <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="badge primary" style={{ cursor: "pointer" }} onClick={() => setOpenJobId(openJobId === job._id ? null : job._id)}>
                        <Users size={14} /> {applications[job._id]?.length || 0} Candidates
                      </div>
                      <button className="text-btn" onClick={() => setOpenJobId(openJobId === job._id ? null : job._id)}>
                        {openJobId === job._id ? "Hide Details" : "View Applicants"}
                        <ChevronDown size={14} style={{ transform: openJobId === job._id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {openJobId === job._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--bg-secondary)", borderRadius: "12px" }}>
                        <h5 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "var(--text-main)" }}>Applications Received</h5>
                        {applications[job._id]?.length > 0 ? (
                          <div className="table-responsive" style={{ overflowX: "auto" }}>
                            <table className="mini-table" style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ textAlign: "left", background: "rgba(0,0,0,0.02)" }}>
                                  <th style={{ padding: "0.5rem" }}>Candidate</th>
                                  <th style={{ padding: "0.5rem" }}>Experience</th>
                                  <th style={{ padding: "0.5rem" }}>Current CTC</th>
                                  <th style={{ padding: "0.5rem" }}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {applications[job._id].map((app) => (
                                  <tr key={app._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "0.5rem" }}>
                                      <div style={{ fontWeight: "600" }}>{app.fullName}</div>
                                      <div className="muted" style={{ fontSize: "0.7rem" }}>{app.email}</div>
                                    </td>
                                    <td style={{ padding: "0.5rem" }}>{app.totalExperience}</td>
                                    <td style={{ padding: "0.5rem" }}>{app.currentCTC}</td>
                                    <td style={{ padding: "0.5rem" }}>
                                      <a href={`${API_BASE}/${app.resume}`} target="_blank" rel="noreferrer" className="btn-link">
                                        <FileText size={14} /> Resume
                                      </a>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="muted" style={{ textAlign: "center", padding: "1rem" }}>No applications found for this role.</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )) : (
              <div className="card muted" style={{ textAlign: "center", padding: "3rem" }}>
                <Briefcase size={40} style={{ opacity: 0.2, marginBottom: "1rem" }} />
                <p>No job positions have been created yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .content-grid-two-col { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 2.5rem; align-items: start; }
        .form-column { position: sticky; top: 1.5rem; container-type: inline-size; }
        .header-stats { display: flex; gap: 1rem; }
        .stat-badge {
          display: flex; flex-direction: column; align-items: flex-end;
          padding: 0.5rem 1rem; background: var(--bg-secondary);
          border-radius: 12px; border: 1px solid var(--border-color);
        }
        .stat-badge.primary { border-color: var(--primary-light); background: var(--primary-light); }
        .stat-badge .label { font-[10px]; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .stat-badge .value { font-size: 1.25rem; font-weight: 800; color: var(--text-main); line-height: 1.1; }
        .stat-badge.primary .value { color: var(--primary); }
        
        .job-item-card:hover .job-actions-float { opacity: 1; visibility: visible; }
        .job-actions-float {
          display: flex; gap: 0.5rem; opacity: 0; transition: opacity 0.2s;
        }
        .btn-icon {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color);
          background: #fff; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-main); transition: all 0.2s;
        }
        .btn-icon:hover { background: var(--primary-light); color: var(--primary); border-color: var(--primary-light); }
        .btn-icon.danger:hover { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }
        
        .text-btn {
          border: none; background: none; color: var(--primary); font-weight: 600;
          font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem; cursor: pointer;
        }
        .btn-link {
          color: var(--primary); display: flex; align-items: center; gap: 0.25rem;
          text-decoration: none; font-weight: 600;
        }
        .badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
        }
        .badge.primary { background: var(--primary-light); color: var(--primary); }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default JobsCreation;