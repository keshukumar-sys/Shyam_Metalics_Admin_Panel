import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AwardPage() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";
  useEffect(() => {
    fetchAwards();
  }, []);

  async function fetchAwards() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/award/get_awards`);
      const data = res.data;
      setAwards(Array.isArray(data.award) ? data.award : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch awards");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!category || !title || !description || !file) {
      setMessage("All fields and image are required");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title);
      formData.append("description", description);
      // controller expects req.file -> use field name 'file'
      formData.append("image", file);

      const res = await axios.post(`${API_BASE}/award/create_awards`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;

      // controller returns { item: award }
      if (data.item) {
        setAwards((prev) => [data.item, ...prev]);
        setTitle("");
        setDescription("");
        setCategory("");
        setFile(null);
        setMessage("Award created successfully");
      }
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message || "Failed to create award");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Awards</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Create Award</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 8, maxWidth: 640 }}
        >
          <label>
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
            />
          </label>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
            />
          </label>
          <label>
            Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Uploading..." : "Create Award"}
            </button>
          </div>
          {message && (
            <div
              style={{ color: message.includes("success") ? "green" : "red" }}
            >
              {message}
            </div>
          )}
        </form>
      </section>

      <section>
        <h2>All Awards</h2>
        {loading && <div>Loading awards…</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && awards.length === 0 && (
          <div>No awards found.</div>
        )}

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            marginTop: 12,
          }}
        >
          {awards.map((a) => (
            <div
              key={a._id || a.id || a.title}
              style={{ border: "1px solid #eee", padding: 12, borderRadius: 6 }}
            >
              {a.image && (
                <div style={{ marginBottom: 8 }}>
                  <img
                    src={a.image}
                    alt={a.title}
                    style={{
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                </div>
              )}
              <div style={{ fontSize: 12, color: "#666" }}>{a.category}</div>
              <div style={{ fontWeight: "bold", marginTop: 6 }}>{a.title}</div>
              <div style={{ marginTop: 8 }}>{a.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
