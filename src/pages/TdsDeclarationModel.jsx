import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../App.css";
import "../components/css/Form.css";
import { authHeader } from "../auth";

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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Delete failed");
      fetchList();
    } catch (e) {
      alert("Network error");
    }
  };

  return (
    <div className="container" style={{ padding: 16 }}>
      <h2>TDS Declaration</h2>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name
            <input className="form-input" value={tdsName} onChange={(e) => setTdsName(e.target.value)} />
          </label>

          <label>
            Date
            <input className="form-input" type="date" value={tdsDate} onChange={(e) => setTdsDate(e.target.value)} />
          </label>

          <label>
            File
            <input
              className="form-input"
              type="file"
              onChange={(e) => setFile(e.target.files && e.target.files[0])}
              accept="*/*"
            />
          </label>

          <div>
            <button type="submit" className="btn">Upload TDS</button>
          </div>
          {message && <div className={`form-msg ${message.toLowerCase().includes('failed') || message.toLowerCase().includes('please') ? 'error' : ''}`}>{message}</div>}
        </form>
      </div>

      <section style={{ marginTop: 24 }}>
        <h3>Uploaded TDS</h3>
        <div className="card">
          <DataTable
            columns={[
              { key: "tds_name", label: "Name" },
              { key: "tds_date", label: "Date" },
              { key: "tds_file", label: "File", render: (r) => (r.tds_file ? <a href={r.tds_file} target="_blank" rel="noreferrer">View</a> : "-") }
            ]}
            data={list}
            actions={(row) => (
                <>
                  <a className="btn-sm" href={row.tds_file || '#'} target="_blank" rel="noreferrer">Open</a>
                  <button style={{ marginLeft: 8 }} className="btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
                </>
              )}
          />
        </div>
      </section>
    </div>
  );
}
