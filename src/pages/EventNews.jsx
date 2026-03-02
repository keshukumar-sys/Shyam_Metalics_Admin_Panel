import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Edit, Trash2, Plus, Loader2, Eye, X, Image as ImageIcon, Type, Layout, Calendar, Globe, FileText } from "lucide-react";
import "../components/css/Form.css";

export default function EventNewsAdmin() {
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentBlocks, setContentBlocks] = useState([{ type: "paragraph", text: "" }]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/news`;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_BASE}/event-news`);
      const data = await res.json();
      if (res.ok) setNewsList(data.data || []);
      else setNewsList([]);
    } catch (err) {
      console.error(err);
      setNewsList([]);
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

  // Dynamic content block functions
  const addContentBlock = () => setContentBlocks([...contentBlocks, { type: "paragraph", text: "" }]);
  const removeContentBlock = (index) => setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  const updateContentBlock = (index, value) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index].text = value;
    setContentBlocks(newBlocks);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!slug || !category || !date || !title || !description || !image) {
      setMessage("All fields including image are required.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("content", JSON.stringify(contentBlocks));
    formData.append("image", image);

    try {
      const res = await fetch(`${API_BASE}/event-news`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating Event News");
      else {
        setMessage("Event News created successfully!");
        resetForm();
        fetchNews();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSlug(""); setCategory(""); setDate(""); setTitle(""); setDescription(""); setImage(null);
    setContentBlocks([{ type: "paragraph", text: "" }]);
    setEditId(null); setEditFields({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news item?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, { method: "DELETE" });
      if (res.ok) fetchNews();
      else alert("Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditFields({
      slug: item.slug,
      category: item.category,
      date: item.date?.substring(0, 10) || "",
      title: item.title,
      description: item.description,
      contentBlocks: item.content || [{ type: "paragraph", text: "" }],
      imgFile: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("slug", editFields.slug);
    formData.append("category", editFields.category);
    formData.append("date", editFields.date);
    formData.append("title", editFields.title);
    formData.append("description", editFields.description);
    formData.append("content", JSON.stringify(editFields.contentBlocks));
    if (editFields.imgFile) formData.append("image", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_event_news/${editId}`, { method: "PUT", body: formData });
      if (res.ok) {
        resetForm();
        fetchNews();
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
          <h2>Event News Management</h2>
          <p className="muted">Create and manage news articles for corporate events and announcements.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Create News Article</h3>
          <p>Fill in the article details, add content blocks, and upload a cover image.</p>
        </div>

        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Article Title</label>
              <input
                placeholder="e.g. Shyam Metalics Expands Operations in West Bengal"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>URL Slug</label>
              <input
                placeholder="news-article-slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                placeholder="e.g. Corporate, Financial"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Publish Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Cover Image (.webp only)</label>
              <input
                type="file"
                accept=".webp"
                className="form-input"
                onChange={handleImageSelect}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Short Description</label>
              <textarea
                className="form-input h-24"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter a brief summary of the article..."
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <div className="form-header" style={{ padding: 0, border: "none", marginBottom: "1rem" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Type size={18} /> Article Content Blocks
              </h4>
              <p className="muted">Add structured paragraphs to your news article.</p>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {contentBlocks.map((block, idx) => (
                <div key={idx} className="card" style={{ padding: "1rem", background: "var(--bg-secondary)", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="muted" style={{ fontSize: "0.75rem", fontWeight: "600" }}>BLOCK #{idx + 1}</span>
                    {contentBlocks.length > 1 && (
                      <button type="button" className="btn-outline btn-sm text-danger" onClick={() => removeContentBlock(idx)}>
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    className="form-input"
                    style={{ minHeight: "100px" }}
                    value={block.text}
                    onChange={e => updateContentBlock(idx, e.target.value)}
                    placeholder="Type paragraph content here..."
                    required
                  />
                </div>
              ))}
            </div>

            <button type="button" className="btn-outline" style={{ marginTop: "1rem", width: "100%" }} onClick={addContentBlock}>
              <Plus size={18} /> Add Another Paragraph
            </button>
          </div>

          {message && (
            <div className={`form-msg ${message.includes("successfully") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Uploading...</> : <><Plus size={18} /> Create Article</>}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem" }}>
          <h3>Published News</h3>
          <p>Manage existing news items on your website.</p>
        </div>

        <DataTable
          columns={[
            {
              key: "title",
              label: "Article Info",
              render: (r) => (
                <div>
                  <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{r.title}</div>
                  <div className="muted" style={{ fontSize: "0.75rem", display: "flex", gap: "0.8rem", marginTop: "0.2rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><Calendar size={12} /> {new Date(r.date).toLocaleDateString()}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><Layout size={12} /> {r.category}</span>
                  </div>
                </div>
              )
            },
            {
              key: "description",
              label: "Excerpt",
              render: (r) => (
                <div className="muted" style={{ fontSize: "0.85rem", maxWidth: "300px" }}>
                  {r.description?.substring(0, 80)}...
                </div>
              )
            },
            {
              key: "image",
              label: "Cover",
              width: "100px",
              render: (r) => r.image ? (
                <a href={r.image} target="_blank" rel="noreferrer" className="btn-outline btn-sm" title="View Full Image">
                  <ImageIcon size={16} />
                </a>
              ) : "-"
            }
          ]}
          data={newsList}
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
          <div className="form-card" style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Edit News Article</h3>
                <p>Modifying: {editFields.title}</p>
              </div>
              <button className="btn-outline btn-sm" onClick={resetForm}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title</label>
                  <input value={editFields.title} onChange={e => setEditFields({ ...editFields, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input value={editFields.slug} onChange={e => setEditFields({ ...editFields, slug: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={editFields.category} onChange={e => setEditFields({ ...editFields, category: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={editFields.date} onChange={e => setEditFields({ ...editFields, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Cover Image (Optional)</label>
                  <input type="file" accept=".webp" className="form-input" onChange={e => handleImageSelect(e, true)} />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea className="form-input h-24" value={editFields.description} onChange={e => setEditFields({ ...editFields, description: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.8rem" }}>Content Blocks</h4>
                <div style={{ display: "grid", gap: "0.8rem" }}>
                  {editFields.contentBlocks?.map((block, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "0.5rem" }}>
                      <textarea
                        className="form-input"
                        style={{ minHeight: "80px" }}
                        value={block.text}
                        onChange={e => {
                          const newBlocks = [...editFields.contentBlocks];
                          newBlocks[idx].text = e.target.value;
                          setEditFields({ ...editFields, contentBlocks: newBlocks });
                        }}
                        required
                      />
                      <button type="button" className="btn-outline btn-sm" style={{ color: "var(--danger)" }} onClick={() => {
                        const newBlocks = editFields.contentBlocks.filter((_, i) => i !== idx);
                        setEditFields({ ...editFields, contentBlocks: newBlocks });
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-outline btn-sm" style={{ marginTop: "0.8rem", width: "100%" }} onClick={() => setEditFields({ ...editFields, contentBlocks: [...editFields.contentBlocks, { type: "paragraph", text: "" }] })}>
                  <Plus size={14} /> Add Block
                </button>
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
