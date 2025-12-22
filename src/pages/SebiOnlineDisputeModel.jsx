import React, { useEffect, useState } from "react";

export default function SebiOnlineDisputeModel() {
  const [sebiName, setSebiName] = useState("");
  const [sebiDate, setSebiDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/sebi`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_sebi`);
      if (!res.ok) throw new Error("Failed to fetch SEBI data");
      const json = await res.json();
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!sebiName || !sebiDate || !file) {
      setMessage("Please provide name, date and a file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("sebi_name", sebiName);
      formData.append("sebi_date", sebiDate);
      // send file under both keys to match common multer setups
      formData.append("sebi_file", file);
  

      const res = await fetch(`${API_BASE}/add_sebi`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "SEBI entry added");
      setSebiName("");
      setSebiDate("");
      setFile(null);
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      setMessage(json.message || "Deleted");
      fetchList();
    } catch (err) {
      console.error(err);
      setMessage("Error deleting item");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>SEBI Online Dispute / Filings</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <label>
          Name
          <input value={sebiName} onChange={(e) => setSebiName(e.target.value)} />
        </label>

        <label>
          Date
          <input type="date" value={sebiDate} onChange={(e) => setSebiDate(e.target.value)} />
        </label>

        <label>
          File
          <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} />
        </label>

        <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Add SEBI entry"}</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>SEBI entries</h3>
        {list.length === 0 && <div>No records found</div>}
        <ul>
          {list.map((item, idx) => (
            <li key={idx}>
              <strong>{item.sebi_name}</strong> — {item.sebi_date}
              {item.sebi_file && (
                <div>
                  <a href={item.sebi_file} target="_blank" rel="noreferrer">
                    View file
                  </a>
                </div>
              )}
              <div>
                <button onClick={() => handleDelete(item._id || item.id)} style={{marginLeft:8}}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

