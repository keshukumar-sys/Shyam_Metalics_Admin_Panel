import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EventForm() {
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3002";

  const [stories, setStories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState([{ type: "paragraph", text: "" }]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    event_start_date: "",
    event_end_date: "",
    event_location: {
      name: "",
      country: "",
    },
    event_type: {
      name: "",
    },
  });

  // Fetch existing stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stories/get_event_stories`);
        setStories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching stories:", err);
      }
    };

    fetchStories();
  }, []);
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

  // Handle simple input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image
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
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("short_description", formData.short_description);
    data.append("event_start_date", formData.event_start_date);
    data.append("event_end_date", formData.event_end_date);
    data.append("content", JSON.stringify(content));

    // 🔥 IMPORTANT: stringify objects
    data.append("event_location", JSON.stringify(formData.event_location));
    data.append("event_type", JSON.stringify(formData.event_type));

    data.append("front_image", image);

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/stories/create_event_story`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Event Created Successfully!");

      // Reset form
      setFormData({
        name: "",
        slug: "",
        short_description: "",
        event_start_date: "",
        event_end_date: "",
        event_location: { name: "", country: "" },
        event_type: { name: "" },
      });
      setImage(null);
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>Create Event Story</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="slug"
          placeholder="Slug"
          value={formData.slug}
          onChange={handleChange}
          required
        />

        <textarea
          name="short_description"
          placeholder="Short Description"
          value={formData.short_description}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="event_start_date"
          value={formData.event_start_date}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="event_end_date"
          value={formData.event_end_date}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          placeholder="Location Name (e.g. All Plants)"
          value={formData.event_location.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              event_location: {
                ...prev.event_location,
                name: e.target.value,
              },
            }))
          }
          required
        />

        <input
          type="text"
          placeholder="Country (e.g. India)"
          value={formData.event_location.country}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              event_location: {
                ...prev.event_location,
                country: e.target.value,
              },
            }))
          }
          required
        />

        <input
          type="text"
          placeholder="Event Type (e.g. Corporate Event)"
          value={formData.event_type.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              event_type: { name: e.target.value },
            }))
          }
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
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

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      <hr />

      <h3>All Event Stories</h3>

      {stories.length === 0 ? (
        <p>No stories found</p>
      ) : (
        stories.map((story) => (
          <div key={story._id} style={{ marginBottom: "20px" }}>
            <h4>{story.name}</h4>
            <p>
              <b>Type:</b> {story.event_type?.name}
            </p>
            <p>
              <b>Location:</b> {story.event_location?.name},{" "}
              {story.event_location?.country}
            </p>
            <p>{story.short_description}</p>
            {story.front_image?.url && (
              <img src={story.front_image.url} alt={story.name} width="100%" />
            )}
          </div>
        ))
      )}
    </div>
  );
}
