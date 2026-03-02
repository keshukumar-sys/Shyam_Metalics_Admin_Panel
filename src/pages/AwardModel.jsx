import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Edit, Trash2, Plus, Loader2, Eye, X, Award } from "lucide-react";
import "../components/css/Form.css";

export default function AwardAdmin() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [awards, setAwards] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/award`;

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_awards`);
      const data = await res.json();
      if (res.ok) setAwards(data.award || []);
      else setAwards([]);
    } catch (err) {
      console.error(err);
      setAwards([]);
    }
  };

  const handleImageSelect = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".webp")) {
      alert("Only .webp images are allowed");
      return;
    }

    if (isEdit) setEditFields({ ...editFields, imgFile: file });
    else setImage(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!category || !title || !description || !image) {
      setMessage("All fields including image are required.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const res = await fetch(`${API_BASE}/create_awards`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating award");
      else {
        setMessage("Award created successfully!");
        setCategory(""); setTitle(""); setDescription(""); setImage(null);
        fetchAwards();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this award?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) fetchAwards();
      else alert(result.message || "Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (award) => {
    setEditId(award._id);
    setEditFields({
      category: award.category,
      title: award.title,
      description: award.description,
      imgFile: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("category", editFields.category);
    formData.append("title", editFields.title);
    formData.append("description", editFields.description);
    if (editFields.imgFile) formData.append("image", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_awards/${editId}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (res.ok) {
        setEditId(null);
        setEditFields({});
        fetchAwards();
      } else alert(result.message || "Update failed");
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
          <h2>Awards Management</h2>
          <p className="muted">Manage and showcase company honors and recognitions.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Add New Award</h3>
          <p>Fill in the details and upload a .webp image.</p>
        </div>

        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="e.g. Industry Excellence"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Award name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                placeholder="Describe the award significance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ height: "100px" }}
              />
            </div>

            <div className="form-group full-width">
              <label>Award Image (.webp only)</label>
              <input
                type="file"
                accept=".webp"
                className="form-input"
                onChange={handleImageSelect}
                required
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
                <><Plus size={18} /> Add Award</>
              )}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem" }}>
          <h3>All Awards</h3>
          <p>Complete list of achievements recorded in the system.</p>
        </div>

        <DataTable
          columns={[
            { key: "category", label: "Category", width: "150px" },
            { key: "title", label: "Title" },
            {
              key: "description",
              label: "Description",
              render: (r) => (
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {r.description?.substring(0, 60)}...
                </span>
              )
            },
            {
              key: "image",
              label: "Image",
              width: "120px",
              render: (r) => (
                r.image ? (
                  <a href={r.image} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                    <Eye size={14} /> View
                  </a>
                ) : "-"
              )
            },
          ]}
          data={awards}
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
          <div className="form-card" style={{ maxWidth: "600px" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Edit Award</h3>
                <p>Update information for "{editFields.title}"</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setEditId(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Category</label>
                  <input
                    value={editFields.category}
                    onChange={(e) => setEditFields({ ...editFields, category: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Title</label>
                  <input
                    value={editFields.title}
                    onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={editFields.description}
                    onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                    required
                    style={{ height: "100px" }}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Update Image (.webp only, optional)</label>
                  <input
                    type="file"
                    accept=".webp"
                    className="form-input"
                    onChange={(e) => handleImageSelect(e, true)}
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
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 2rem; overflow-y: auto;
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
