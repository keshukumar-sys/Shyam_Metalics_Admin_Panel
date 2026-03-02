import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { Edit, Trash2, Plus, Loader2, Eye, X, Image as ImageIcon, MapPin, Calendar, Type, Layout, Flag, Globe, Info } from "lucide-react";
import "../components/css/Form.css";

export default function EventStoriesAdmin() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState({ name: "", country: "" });
  const [eventType, setEventType] = useState({ name: "" });
  const [contentBlocks, setContentBlocks] = useState([{ type: "paragraph", text: "" }]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stories, setStories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/stories`;

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_event_stories`);
      const data = await res.json();
      if (res.ok) setStories(data.data || []);
      else setStories([]);
    } catch (err) {
      console.error(err);
      setStories([]);
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

  const addContentBlock = () => setContentBlocks([...contentBlocks, { type: "paragraph", text: "" }]);
  const removeContentBlock = (index) => setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  const updateContentBlock = (index, value) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index].text = value;
    setContentBlocks(newBlocks);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !slug || !shortDescription || !startDate || !endDate || !location.name || !location.country || !eventType.name || !image) {
      setMessage("All fields including image are required.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("short_description", shortDescription);
    formData.append("event_start_date", startDate);
    formData.append("event_end_date", endDate);
    formData.append("event_location", JSON.stringify(location));
    formData.append("event_type", JSON.stringify(eventType));
    formData.append("content", JSON.stringify(contentBlocks));
    formData.append("front_image", image);

    try {
      const res = await fetch(`${API_BASE}/create_event_story`, { method: "POST", body: formData });
      if (!res.ok) {
        const result = await res.json();
        setMessage(result.message || "Error creating story");
      } else {
        setMessage("Event Story created successfully!");
        resetForm();
        fetchStories();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName(""); setSlug(""); setShortDescription(""); setStartDate(""); setEndDate("");
    setLocation({ name: "", country: "" }); setEventType({ name: "" });
    setContentBlocks([{ type: "paragraph", text: "" }]);
    setImage(null); setEditFields({}); setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchStories();
      else alert("Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditFields({
      name: item.name,
      slug: item.slug,
      short_description: item.short_description,
      event_start_date: item.event_start_date?.substring(0, 10) || "",
      event_end_date: item.event_end_date?.substring(0, 10) || "",
      event_location: item.event_location || { name: "", country: "" },
      event_type: item.event_type || { name: "" },
      contentBlocks: item.content || [{ type: "paragraph", text: "" }],
      imgFile: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("name", editFields.name);
    formData.append("slug", editFields.slug);
    formData.append("short_description", editFields.short_description);
    formData.append("event_start_date", editFields.event_start_date);
    formData.append("event_end_date", editFields.event_end_date);
    formData.append("event_location", JSON.stringify(editFields.event_location));
    formData.append("event_type", JSON.stringify(editFields.event_type));
    formData.append("content", JSON.stringify(editFields.contentBlocks));
    if (editFields.imgFile) formData.append("front_image", editFields.imgFile);

    try {
      const res = await fetch(`${API_BASE}/update_event_story/${editId}`, { method: "PUT", body: formData });
      if (res.ok) {
        resetForm();
        fetchStories();
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
          <h2>Event Stories Management</h2>
          <p className="muted">Showcase event highlights, case studies, and success stories.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Add New Event Story</h3>
          <p>Provide a rich overview of the event including description, location, and highlights.</p>
        </div>

        <form onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Event Name</label>
              <input
                placeholder="e.g. Annual Metals & Mining Expo 2025"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>URL Slug</label>
              <input
                placeholder="event-highlight-slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Event Type</label>
              <input
                placeholder="e.g. Exhibition, Conference"
                value={eventType.name}
                onChange={e => setEventType({ name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Location Name</label>
              <input
                placeholder="e.g. Pragati Maidan"
                value={location.name}
                onChange={e => setLocation({ ...location, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                placeholder="e.g. India"
                value={location.country}
                onChange={e => setLocation({ ...location, country: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Feature Image (.webp)</label>
              <input
                type="file"
                accept=".webp"
                className="form-input"
                onChange={handleImageSelect}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Brief Summary</label>
              <textarea
                className="form-input h-24"
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="Enter a short introduction for the story..."
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "2rem" }}>
            <div className="form-header" style={{ padding: 0, border: "none", marginBottom: "1rem" }}>
              <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Type size={18} /> Detailed Content Highlights
              </h4>
              <p className="muted">Add multiple sections to detail the event proceedings.</p>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {contentBlocks.map((block, idx) => (
                <div key={idx} className="card" style={{ padding: "1rem", background: "var(--bg-secondary)", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="muted" style={{ fontSize: "0.75rem", fontWeight: "600" }}>HIGHLIGHT #{idx + 1}</span>
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
                    placeholder="Type highlight content here..."
                    required
                  />
                </div>
              ))}
            </div>

            <button type="button" className="btn-outline" style={{ marginTop: "1rem", width: "100%" }} onClick={addContentBlock}>
              <Plus size={18} /> Add Highlight Section
            </button>
          </div>

          {message && (
            <div className={`form-msg ${message.includes("successfully") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? <><Loader2 className="animate-spin" size={18} /> Uploading...</> : <><Plus size={18} /> Save Story</>}
            </button>
          </div>
        </form>
      </div>

      <section className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
        <div className="form-header" style={{ border: "none", marginBottom: "1rem" }}>
          <h3>Event History</h3>
          <p>Manage and update previously published event stories.</p>
        </div>

        <DataTable
          columns={[
            {
              key: "name",
              label: "Event Highlights",
              render: (r) => (
                <div>
                  <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{r.name}</div>
                  <div className="muted" style={{ fontSize: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "0.2rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><Calendar size={12} /> {new Date(r.event_start_date).toLocaleDateString()}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><MapPin size={12} /> {r.event_location?.name}, {r.event_location?.country}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}><Flag size={12} /> {r.event_type?.name}</span>
                  </div>
                </div>
              )
            },
            {
              key: "short_description",
              label: "Description",
              render: (r) => (
                <div className="muted" style={{ fontSize: "0.85rem", maxWidth: "300px" }}>
                  {r.short_description?.substring(0, 80)}...
                </div>
              )
            },
            {
              key: "front_image",
              label: "Thumbnail",
              width: "100px",
              render: (r) => r.front_image?.url ? (
                <a href={r.front_image.url} target="_blank" rel="noreferrer" className="btn-outline btn-sm" title="View Full Image">
                  <ImageIcon size={16} />
                </a>
              ) : "-"
            }
          ]}
          data={stories}
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
                <h3>Edit Event Story</h3>
                <p>Updating technical info for: {editFields.name}</p>
              </div>
              <button className="btn-outline btn-sm" onClick={resetForm}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Name</label>
                  <input value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input value={editFields.slug} onChange={e => setEditFields({ ...editFields, slug: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Event Type</label>
                  <input value={editFields.event_type.name} onChange={e => setEditFields({ ...editFields, event_type: { name: e.target.value } })} required />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={editFields.event_start_date} onChange={e => setEditFields({ ...editFields, event_start_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={editFields.event_end_date} onChange={e => setEditFields({ ...editFields, event_end_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={editFields.event_location.name} onChange={e => setEditFields({ ...editFields, event_location: { ...editFields.event_location, name: e.target.value } })} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input value={editFields.event_location.country} onChange={e => setEditFields({ ...editFields, event_location: { ...editFields.event_location, country: e.target.value } })} required />
                </div>
                <div className="form-group">
                  <label>Front Image (Optional)</label>
                  <input type="file" accept=".webp" className="form-input" onChange={e => handleImageSelect(e, true)} />
                </div>
                <div className="form-group full-width">
                  <label>Short Description</label>
                  <textarea className="form-input h-24" value={editFields.short_description} onChange={e => setEditFields({ ...editFields, short_description: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.8rem" }}>Content Highlights</h4>
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
                      <button type="button" className="btn-outline btn-sm text-danger" onClick={() => {
                        const newBlocks = editFields.contentBlocks.filter((_, i) => i !== idx);
                        setEditFields({ ...editFields, contentBlocks: newBlocks });
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn-outline btn-sm" style={{ marginTop: "0.8rem", width: "100%" }} onClick={() => setEditFields({ ...editFields, contentBlocks: [...editFields.contentBlocks, { type: "paragraph", text: "" }] })}>
                  <Plus size={14} /> Add Highlight Section
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
