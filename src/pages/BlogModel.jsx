'use client';
import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Edit, Trash2, Plus, Loader2, Eye, X, PlusCircle, MinusCircle, FileText, Globe, HelpCircle } from "lucide-react";
import "../components/css/Form.css";

export default function BlogAdmin() {
  const [blogs, setBlogs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Create form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [paragraphs, setParagraphs] = useState([{ description: [{ desc: "" }] }]);
  const [meta, setMeta] = useState({ title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogUrl: "" });
  const [faqs, setFaqs] = useState({ desc: "", list: [{ listTitle: "", listdesc: "" }] });
  const [image, setImage] = useState(null);

  // Edit form states
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/blog`;

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_blog`);
      const data = await res.json();
      setBlogs(res.ok ? data.blogs || [] : []);
    } catch (err) {
      console.error(err);
      setBlogs([]);
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

  // CREATE BLOG
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title || !date || !link || !excerpt || !paragraphs.length || !image) {
      setMessage("All fields including image are required.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("date", date);
    formData.append("link", link);
    formData.append("excerpt", excerpt);
    formData.append("paragraph", JSON.stringify(paragraphs));
    formData.append("meta", JSON.stringify(meta));
    formData.append("faqs", JSON.stringify(faqs));
    formData.append("img", image);

    try {
      const res = await fetch(`${API_BASE}/create_blog`, { method: "POST", body: formData });
      const result = await res.json();
      if (res.ok) {
        setMessage("Blog created successfully!");
        setTitle(""); setDate(""); setLink(""); setExcerpt("");
        setParagraphs([{ description: [{ desc: "" }] }]);
        setMeta({ title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogUrl: "" });
        setFaqs({ desc: "", list: [{ listTitle: "", listdesc: "" }] });
        setImage(null); fetchBlogs();
      } else setMessage(result.message || "Error creating blog");
    } catch (err) {
      console.error(err); setMessage("Server error");
    } finally { setUploading(false); }
  };

  // DELETE BLOG
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (res.ok) fetchBlogs();
      else alert(result.message || "Delete failed");
    } catch { alert("Server error"); }
  };

  // EDIT BLOG
  const handleEdit = (blog) => {
    setEditId(blog._id);
    setEditFields({
      title: blog.title,
      date: blog.date?.substring(0, 10) || "",
      link: blog.link,
      excerpt: blog.excerpt,
      paragraphs: blog.paragraph || [{ description: [{ desc: "" }] }],
      meta: blog.meta || { title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogUrl: "" },
      faqs: blog.faqs || { desc: "", list: [{ listTitle: "", listdesc: "" }] },
      imgFile: null
    });
  };

  // UPDATE BLOG
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append("title", editFields.title);
    formData.append("date", editFields.date);
    formData.append("link", editFields.link);
    formData.append("excerpt", editFields.excerpt);
    formData.append("paragraph", JSON.stringify(editFields.paragraphs));
    formData.append("meta", JSON.stringify(editFields.meta));
    formData.append("faqs", JSON.stringify(editFields.faqs));
    if (editFields.imgFile) formData.append("img", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_blog/${editId}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (res.ok) { setEditId(null); setEditFields({}); fetchBlogs(); }
      else alert(result.message || "Update failed");
    } catch { alert("Server error"); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Blog Management</h2>
          <p className="muted">Create and manage insights, news, and articles.</p>
        </div>
      </div>

      <div className="form-card" style={{ maxWidth: "1000px" }}>
        <div className="form-header">
          <h3>Add New Article</h3>
          <p>Compose your story and optimize for search engines.</p>
        </div>

        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Blog Title</label>
              <input type="text" placeholder="Enter article title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Publication Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>URL Slug</label>
              <input type="text" placeholder="e.g. future-of-steel" value={link} onChange={e => setLink(e.target.value)} required />
            </div>

            <div className="form-group full-width">
              <label>Excerpt / Summary</label>
              <textarea placeholder="Brief summary of the article..." rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} required />
            </div>
          </div>

          <div style={{ margin: "2rem 0", display: "grid", gap: "2rem" }}>
            {/* Paragraphs Section */}
            <div className="card" style={{ padding: "1.5rem", background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={18} /> Content Sections
                </h4>
                <button type="button" className="btn-outline btn-sm" onClick={() => setParagraphs([...paragraphs, { description: [{ desc: "" }] }])}>
                  <Plus size={14} /> Add Section
                </button>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                {paragraphs.map((p, idx) => (
                  <div key={idx} style={{ background: "white", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>SECTION {idx + 1}</span>
                      <button type="button" style={{ color: "var(--danger)" }} onClick={() => {
                        const newP = [...paragraphs]; newP.splice(idx, 1); setParagraphs(newP);
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {p.description.map((d, i) => (
                      <div key={i} style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
                        <textarea
                          placeholder="Section content..."
                          className="form-input"
                          rows={3}
                          value={d.desc}
                          onChange={e => {
                            const newP = [...paragraphs]; newP[idx].description[i].desc = e.target.value; setParagraphs(newP);
                          }}
                        />
                        <button type="button" style={{ color: "var(--danger)" }} onClick={() => {
                          const newP = [...paragraphs]; newP[idx].description.splice(i, 1); setParagraphs(newP);
                        }}>
                          <MinusCircle size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn-outline btn-sm" style={{ width: "100%", borderStyle: "dashed" }} onClick={() => {
                      const newP = [...paragraphs]; newP[idx].description.push({ desc: "" }); setParagraphs(newP);
                    }}>
                      <PlusCircle size={14} /> Add Sub-paragraph
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Meta Section */}
            <div className="card" style={{ padding: "1.5rem", background: "#f8fafc" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Globe size={18} /> SEO & Social Metadata
              </h4>
              <div className="form-grid">
                {Object.keys(meta).map(key => (
                  <div key={key} className="form-group">
                    <label style={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input type="text" placeholder={`Enter ${key}`} value={meta[key] || ""} onChange={e => setMeta({ ...meta, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Section */}
            <div className="card" style={{ padding: "1.5rem", background: "#f8fafc" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <HelpCircle size={18} /> Frequently Asked Questions
              </h4>
              <div className="form-group full-width">
                <label>Introductory Text</label>
                <input type="text" placeholder="Short intro for FAQ section" value={faqs.desc} onChange={e => setFaqs({ ...faqs, desc: e.target.value })} />
              </div>
              <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                {faqs.list.map((f, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "start", background: "white", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                    <input type="text" placeholder="Question" value={f.listTitle} onChange={e => {
                      const newList = [...faqs.list]; newList[idx].listTitle = e.target.value; setFaqs({ ...faqs, list: newList });
                    }} />
                    <textarea placeholder="Answer" rows={1} value={f.listdesc} onChange={e => {
                      const newList = [...faqs.list]; newList[idx].listdesc = e.target.value; setFaqs({ ...faqs, list: newList });
                    }} />
                    <button type="button" style={{ color: "var(--danger)", padding: "0.5rem" }} onClick={() => setFaqs({ ...faqs, list: faqs.list.filter((_, i) => i !== idx) })}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-outline btn-sm" style={{ width: "fit-content" }} onClick={() => setFaqs({ ...faqs, list: [...faqs.list, { listTitle: "", listdesc: "" }] })}>
                  <Plus size={14} /> Add FAQ Item
                </button>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Cover Image (.webp only)</label>
            <input type="file" accept=".webp" className="form-input" onChange={handleImageSelect} required />
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
                <><Plus size={18} /> Create Article</>
              )}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem" }}>
          <h3>Published Articles</h3>
          <p>List of all blogs currently live on the website.</p>
        </div>

        <DataTable
          columns={[
            { key: "title", label: "Article Title" },
            {
              key: "date",
              label: "Date",
              width: "120px",
              render: r => r.date ? new Date(r.date).toLocaleDateString() : "-"
            },
            {
              key: "img",
              label: "Cover",
              width: "100px",
              render: r => r.img ? (
                <a href={r.img} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                  <Eye size={14} />
                </a>
              ) : "-"
            },
          ]}
          data={blogs}
          actions={row => (
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
          <div className="form-card" style={{ maxWidth: "900px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>Edit Article</h3>
                <p>Modifying "{editFields.title}"</p>
              </div>
              <button className="btn-outline btn-sm" onClick={() => setEditId(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Title</label>
                  <input type="text" value={editFields.title} onChange={e => setEditFields({ ...editFields, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={editFields.date} onChange={e => setEditFields({ ...editFields, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>URL Slug</label>
                  <input type="text" value={editFields.link} onChange={e => setEditFields({ ...editFields, link: e.target.value })} required />
                </div>
                <div className="form-group full-width">
                  <label>Excerpt</label>
                  <textarea rows={2} value={editFields.excerpt} onChange={e => setEditFields({ ...editFields, excerpt: e.target.value })} />
                </div>
              </div>

              {/* Paragraphs */}
              <div className="card" style={{ padding: "1.5rem", background: "#f8fafc", marginTop: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileText size={18} /> Content Sections
                  </h4>
                  <button type="button" className="btn-outline btn-sm" onClick={() => setEditFields({ ...editFields, paragraphs: [...editFields.paragraphs, { description: [{ desc: "" }] }] })}>
                    <Plus size={14} /> Add Section
                  </button>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  {editFields.paragraphs?.map((p, idx) => (
                    <div key={idx} style={{ background: "white", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)" }}>SECTION {idx + 1}</span>
                        <button type="button" style={{ color: "var(--danger)" }} onClick={() => {
                          const newP = [...editFields.paragraphs]; newP.splice(idx, 1); setEditFields({ ...editFields, paragraphs: newP });
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {p.description.map((d, i) => (
                        <div key={i} style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
                          <textarea
                            placeholder="Section content..."
                            className="form-input"
                            rows={3}
                            value={d.desc}
                            onChange={e => {
                              const newP = [...editFields.paragraphs]; newP[idx].description[i].desc = e.target.value; setEditFields({ ...editFields, paragraphs: newP });
                            }}
                          />
                          <button type="button" style={{ color: "var(--danger)" }} onClick={() => {
                            const newP = [...editFields.paragraphs]; newP[idx].description.splice(i, 1); setEditFields({ ...editFields, paragraphs: newP });
                          }}>
                            <MinusCircle size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="btn-outline btn-sm" style={{ width: "100%", borderStyle: "dashed" }} onClick={() => {
                        const newP = [...editFields.paragraphs]; newP[idx].description.push({ desc: "" }); setEditFields({ ...editFields, paragraphs: newP });
                      }}>
                        <PlusCircle size={14} /> Add Sub-paragraph
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEO Meta Section */}
              <div className="card" style={{ padding: "1.5rem", background: "#f8fafc", marginTop: "1.5rem" }}>
                <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <Globe size={18} /> SEO & Social Metadata
                </h4>
                <div className="form-grid">
                  {Object.keys(editFields.meta || {}).map(key => (
                    <div key={key} className="form-group">
                      <label style={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                      <input type="text" placeholder={`Enter ${key}`} value={editFields.meta[key] || ""} onChange={e => setEditFields({ ...editFields, meta: { ...editFields.meta, [key]: e.target.value } })} />
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs Section */}
              <div className="card" style={{ padding: "1.5rem", background: "#f8fafc", marginTop: "1.5rem" }}>
                <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <HelpCircle size={18} /> Frequently Asked Questions
                </h4>
                <div className="form-group full-width">
                  <label>Introductory Text</label>
                  <input type="text" placeholder="Short intro for FAQ section" value={editFields.faqs?.desc || ""} onChange={e => setEditFields({ ...editFields, faqs: { ...editFields.faqs, desc: e.target.value } })} />
                </div>
                <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
                  {editFields.faqs?.list.map((f, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "start", background: "white", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                      <input type="text" placeholder="Question" value={f.listTitle} onChange={e => {
                        const newList = [...editFields.faqs.list]; newList[idx].listTitle = e.target.value; setEditFields({ ...editFields, faqs: { ...editFields.faqs, list: newList } });
                      }} />
                      <textarea placeholder="Answer" rows={1} value={f.listdesc} onChange={e => {
                        const newList = [...editFields.faqs.list]; newList[idx].listdesc = e.target.value; setEditFields({ ...editFields, faqs: { ...editFields.faqs, list: newList } });
                      }} />
                      <button type="button" style={{ color: "var(--danger)", padding: "0.5rem" }} onClick={() => setEditFields({ ...editFields, faqs: { ...editFields.faqs, list: editFields.faqs.list.filter((_, i) => i !== idx) } })}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-outline btn-sm" style={{ width: "fit-content" }} onClick={() => setEditFields({ ...editFields, faqs: { ...editFields.faqs, list: [...editFields.faqs.list, { listTitle: "", listdesc: "" }] } })}>
                    <Plus size={14} /> Add FAQ Item
                  </button>
                </div>
              </div>

              <div className="form-group full-width" style={{ marginTop: "1rem" }}>
                <label>Change Hub Image (Optional)</label>
                <input type="file" accept=".webp" className="form-input" onChange={e => handleImageSelect(e, true)} />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setEditId(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : "Update Article"}
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
