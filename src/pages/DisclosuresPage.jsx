import React, { useEffect, useState } from "react";

export default function DisclosuresModel() {
  const [DisclosureName, setDisclosureName] = useState("");
  const [DisclosureDate, setDisclosureDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);

  const API_BASE = `${
    import.meta.env.VITE_API_BASE || "http://localhost:3002"
  }/disclosure`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_disclosure`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!DisclosureName || !DisclosureDate || !file) {
      setMessage("Please provide name, date and a file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", DisclosureName);
      formData.append("date", DisclosureDate);
      // append the file under the expected field name
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/create_disclosure`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "DisclosureUploaded");
      setDisclosureName("");
      setDisclosureDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Disclosures</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 8, maxWidth: 480 }}
      >
        <label>
          Name
          <input
            value={DisclosureName}
            onChange={(e) => setDisclosureName(e.target.value)}
          />
        </label>

        <label>
          Date
          <input
            type="date"
            value={DisclosureDate}
            onChange={(e) => setDisclosureDate(e.target.value)}
          />
        </label>

        <label>
          File
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0])}
            accept="*/*"
          />
        </label>

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Disclosure"}
        </button>

        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Uploaded Disclosure</h3>
        {list.length === 0 && <div>No records found</div>}
        <ul>
          {list.map((item, idx) => (
            <li key={idx}>
              <strong>{item.name}</strong> — {item.date}
              {item.file && (
                <div>
                  <a href={item.file} target="_blank" rel="noreferrer">
                    View file
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
