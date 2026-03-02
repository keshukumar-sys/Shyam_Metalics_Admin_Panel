import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from "../components/DataTable";
import {
  Users, MapPin, Phone, User, Search,
  Plus, Pencil, Trash2, Loader2, Info,
  CheckCircle2, XCircle, Filter
} from 'lucide-react';
import "../components/css/Form.css";

const API_URL = `${import.meta.env.VITE_API_BASE}/distributors`;

const AdminDistributor = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    district: '',
    state: ''
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState("");

  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setDistributors(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to load distributors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        setMessage("Distributor record updated successfully");
      } else {
        await axios.post(`${API_URL}/create`, formData);
        setMessage("New distributor added successfully");
      }
      setFormData({ customerName: '', contactNumber: '', district: '', state: '' });
      setEditId(null);
      fetchDistributors();
    } catch (err) {
      setMessage("Error performing operation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this distributor from the network?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchDistributors();
      setMessage("Distributor deleted successfully");
    } catch (err) {
      setMessage("Delete failed. Please try again.");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setFormData({
      customerName: row.customerName,
      contactNumber: row.contactNumber,
      district: row.district,
      state: row.state
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredDistributors = distributors.filter(item =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modern-page">
      <div className="page-header">
        <div>
          <h2>Distributor Network</h2>
          <p className="muted">Manage and monitor our regional distribution partners and supply chain contacts.</p>
        </div>
        <div className="badge secondary"><Users size={14} /> Network Admin</div>
      </div>

      <div className="content-grid-two-col">
        {/* FORM SECTION */}
        <div className="form-column">
          <section className="card">
            <div className="form-header">
              {editId ? <Pencil size={20} /> : <Plus size={20} />}
              <h3>{editId ? "Update Partner" : "Register Distributor"}</h3>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group full">
                <label>Customer Name</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input
                    name="customerName"
                    placeholder="Full business name"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>Contact Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input
                    name="contactNumber"
                    placeholder="Mobile or Landline"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group half">
                <label>District</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
                  <input
                    name="district"
                    placeholder="District"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group half">
                <label>State</label>
                <div className="input-with-icon">
                  <Globe size={18} />
                  <input
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions full">
                {editId && (
                  <button type="button" className="btn-outline" onClick={() => {
                    setEditId(null);
                    setFormData({ customerName: '', contactNumber: '', district: '', state: '' });
                  }}>Cancel</button>
                )}
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : (
                    editId ? "Update Profile" : "Add to Network"
                  )}
                </button>
              </div>
            </form>
            {message && <div className={`form-msg ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</div>}
          </section>
        </div>

        {/* LIST SECTION */}
        <div className="table-column">
          <section className="card">
            <div className="table-header-box">
              <div className="form-header">
                <Filter size={20} />
                <h3>Distributor Registry</h3>
              </div>
              <div className="search-field">
                <Search size={16} />
                <input
                  placeholder="Search by name, state or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "4rem", textAlign: "center" }}>
                <Loader2 className="animate-spin muted" size={40} />
                <p className="muted">Loading distributor database...</p>
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: "customerName",
                    label: "Customer Details",
                    render: (r) => (
                      <div>
                        <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{r.customerName}</div>
                        <div className="muted" style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={12} /> {r.contactNumber}
                        </div>
                      </div>
                    )
                  },
                  {
                    key: "location",
                    label: "Region",
                    render: (r) => (
                      <div className="muted" style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={14} /> {r.district}, {r.state}
                      </div>
                    )
                  }
                ]}
                data={filteredDistributors}
                actions={(row) => (
                  <div className="dt-actions">
                    <button className="btn-outline btn-sm" onClick={() => handleEdit(row)} title="Edit Profile">
                      <Pencil size={15} />
                    </button>
                    <button className="btn-outline btn-sm" style={{ color: "var(--danger)" }} onClick={() => handleDelete(row._id)} title="Delete Record">
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
        .content-grid-two-col { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 2.5rem; align-items: start; }
        .form-column { position: sticky; top: 1.5rem; container-type: inline-size; }
        .table-header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
        .search-field { 
          display: flex; align-items: center; gap: 0.75rem; background: var(--bg-main);
          padding: 0.5rem 1rem; border-radius: 10px; border: 1px solid var(--border-light);
          flex: 1; min-width: 250px;
        }
        .search-field input { border: none; background: transparent; outline: none; width: 100%; font-size: 0.85rem; color: var(--text-primary); }
        
        @media (max-width: 1400px) {
          .content-grid-two-col { grid-template-columns: 1fr; }
          .form-column { position: static; }
        }
      `}</style>
    </div>
  );
};

export default AdminDistributor;