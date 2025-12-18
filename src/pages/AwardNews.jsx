import React, { useState, useEffect } from "react";
import axios from "axios";

export default function NewsManager() {
  const [formData, setFormData] = useState({
    slug: "",
    category: "",
    date: "",
    title: "",
    description: "",
  });

  const [content, setContent] = useState([{ type: "paragraph", text: "" }]);
  const [image, setImage] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}`;
  // Fetch news from backend
  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/news/event-news`); // replace with your backend route
      setNewsList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle content paragraph changes
  const handleContentChange = (index, value) => {
    const updated = [...content];
    updated[index].text = value;
    setContent(updated);
  };

  // Add new paragraph
  const addParagraph = () => {
    setContent((prev) => [...prev, { type: "paragraph", text: "" }]);
  };

  // Remove a paragraph
  const removeParagraph = (index) => {
    if (content.length === 1) return; // always keep at least one paragraph
    const updated = content.filter((_, i) => i !== index);
    setContent(updated);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image");
      return;
    }

    const data = new FormData();
    data.append("slug", formData.slug);
    data.append("category", formData.category);
    data.append("date", formData.date);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("content", JSON.stringify(content));
    data.append("image", image);

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE}/news/event-news`, // replace with your backend route
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("News Created Successfully!");
      setFormData({
        slug: "",
        category: "",
        date: "",
        title: "",
        description: "",
      });
      setContent([{ type: "paragraph", text: "" }]);
      setImage(null);
      fetchNews(); // refresh news list
    } catch (err) {
      console.error(err);
      alert("Error creating news.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>Create News</h1>
      <form onSubmit={handleSubmit}>
        <label>Slug:</label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          required
        />
        <br />

        <label>Category:</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        />
        <br />

        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <br />

        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <br />

        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <br />

        <label>Content:</label>
        {content.map((c, index) => (
          <div key={index} style={{ display: "flex", marginBottom: "5px" }}>
            <textarea
              value={c.text}
              onChange={(e) => handleContentChange(index, e.target.value)}
              placeholder={`Paragraph ${index + 1}`}
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => removeParagraph(index)}
              style={{
                marginLeft: "5px",
                backgroundColor: "#ff4d4d",
                color: "white",
                border: "none",
                padding: "0 10px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addParagraph}>
          Add Paragraph
        </button>
        <br />

        <label>Image:</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleImageChange}
          required
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      <hr style={{ margin: "40px 0" }} />

      <h2>News List</h2>
      {newsList.length === 0 ? (
        <p>No news found.</p>
      ) : (
        newsList.map((news) => (
          <div
            key={news._id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>{news.title}</h3>
            <p>
              <strong>Slug:</strong> {news.slug}
            </p>
            <p>
              <strong>Category:</strong> {news.category}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(news.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Description:</strong> {news.description}
            </p>
            {news.image && (
              <img
                src={news.image}
                alt={news.title}
                style={{ maxWidth: "100%", marginTop: "10px" }}
              />
            )}
            <div style={{ marginTop: "10px" }}>
              <strong>Content:</strong>
              {news.content &&
                Array.isArray(news.content) &&
                news.content.map((c, i) => (
                  <p key={i}>
                    {c.type === "heading" ? <strong>{c.text}</strong> : c.text}
                  </p>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
