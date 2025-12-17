import React, { useEffect, useState } from "react";

export default function TdsDeclarationModel() {
  const [tdsName, setTdsName] = useState("");
  const [tdsDate, setTdsDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/tds`; 

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_tds`);
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

    if (!tdsName || !tdsDate || !file) {
      setMessage("Please provide name, date and a file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("tds_name", tdsName);
      formData.append("tds_date", tdsDate);
      // append the file under the expected field name
      formData.append("tds_file", file);
      const res = await fetch(`${API_BASE}/create_tds`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "TDS uploaded");
      setTdsName("");
      setTdsDate("");
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
      <h2>TDS Declaration</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <label>
          Name
          <input value={tdsName} onChange={(e) => setTdsName(e.target.value)} />
        </label>

        <label>
          Date
          <input type="date" value={tdsDate} onChange={(e) => setTdsDate(e.target.value)} />
        </label>

        <label>
          File
          <input
            type="file"
            onChange={(e) => setFile(e.target.files && e.target.files[0])}
              accept="*/*"
            />
          </label>

          <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload TDS"}</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Uploaded TDS</h3>
        {list.length === 0 && <div>No records found</div>}
        <ul>
          {list.map((item, idx) => (
            <li key={idx}>
              <strong>{item.tds_name}</strong> — {item.tds_date}
              {item.tds_file && (
                <div>
                  <a href={item.tds_file} target="_blank" rel="noreferrer">
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
