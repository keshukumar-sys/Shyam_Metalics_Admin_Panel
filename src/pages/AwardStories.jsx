import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EventForm() {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    event_start_date: "",
    event_end_date: "",
    event_location: "",
    event_type: "",
  });
  const API_BASE = `${
    import.meta.env.VITE_API_BASE || "http://localhost:3002"
  }`;
  const [stories, setStories] = useState([]);

  useEffect(() => {
    // Fetch existing event stories
    const fetchStories = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/stories/get_event_stories`
        );
        console.log(res);
        setStories(res.data.data);
      } catch (err) {
        console.error("Error fetching stories:", err);
      }
    };
    fetchStories();
  }, []);

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("short_description", formData.short_description);
    data.append("event_start_date", formData.event_start_date);
    data.append("event_end_date", formData.event_end_date);
    data.append("event_location", formData.event_location);
    data.append("event_type", formData.event_type);
    data.append("front_image", image);

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/stories/create-event-story`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Event Created Successfully!");
      console.log(res.data);

      // Reset form
      setFormData({
        name: "",
        slug: "",
        short_description: "",
        event_start_date: "",
        event_end_date: "",
        event_location: "",
        event_type: "",
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
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Create Event Stories
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <label style={{ display: "block", marginTop: "10px" }}>
          Event Name:
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter Event Name"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          Slug (URL):
        </label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="Enter Slug"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          Short Description:
        </label>
        <textarea
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          placeholder="Enter Short Description"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          Event Start Date:
        </label>
        <input
          type="date"
          name="event_start_date"
          value={formData.event_start_date}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          Event End Date:
        </label>
        <input
          type="date"
          name="event_end_date"
          value={formData.event_end_date}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          Event Location (JSON format):
        </label>
        <textarea
          name="event_location"
          value={formData.event_location}
          onChange={handleChange}
          placeholder='e.g., {"name":"Plant Communities","country":"India"}'
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          Event Type (JSON format):
        </label>
        <textarea
          name="event_type"
          value={formData.event_type}
          onChange={handleChange}
          placeholder='e.g., {"name":"CSR Initiative"}'
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          required
        />

        <label style={{ display: "block", marginTop: "10px" }}>
          Event Image:
        </label>
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          style={{ marginTop: "5px" }}
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            display: "block",
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      <h2 style={{ marginTop: "40px", textAlign: "center" }}>
        All Event Stories
      </h2>
      <div style={{ marginTop: "20px" }}>
        {stories.length === 0 ? (
          <p style={{ textAlign: "center" }}>No stories found.</p>
        ) : (
          stories.map((story) => {
            const startDate = story.event_start_date
              ? new Date(story.event_start_date).toLocaleDateString()
              : "-";
            const endDate = story.event_end_date
              ? new Date(story.event_end_date).toLocaleDateString()
              : "-";
            const typeName = story.event_type?.name || "-";
            const locationName = story.event_location?.name || "-";
            const locationCountry = story.event_location?.country || "-";
            const imageUrl = story.front_image?.url || null;

            return (
              <div
                key={story._id?.$oid || story._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                <h3>{story.name || "Untitled Event"}</h3>
                <p>
                  <strong>Type:</strong> {typeName}
                </p>
                <p>
                  <strong>Location:</strong> {locationName}, {locationCountry}
                </p>
                <p>
                  <strong>Start Date:</strong> {startDate} |{" "}
                  <strong>End Date:</strong> {endDate}
                </p>
                <p>{story.short_description || "No description available."}</p>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={story.name || "Event Image"}
                    style={{
                      maxWidth: "100%",
                      marginTop: "10px",
                      borderRadius: "5px",
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
