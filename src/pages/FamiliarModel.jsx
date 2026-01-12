import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function FamiliarModel() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/familiar`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_familiar`);
      if (!res.ok) throw new Error("Failed to fetch");
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
    setUploading(true);

    if (!name || !date || !file) {
      setMessage("Please provide name, date and a file.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("familiar_name", name);
      formData.append("familiar_date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_familiar`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Familiar entry added");
      setName("");
      setDate("");
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
    <div style={{ padding: 16 }}>
      <h2>Familiar</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          File
          <input type="file" onChange={(e) => setFile(e.target.files && e.target.files[0])} />
        </label>

        <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Add Familiar"}</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Entries</h3>
        <DataTable
          columns={[
            { key: "familiar_name", label: "Name" },
            { key: "familiar_date", label: "Date" },
            { key: "familiar_file", label: "File", render: (r) => (r.familiar_file ? <a href={r.familiar_file} target="_blank" rel="noreferrer">View</a> : "-") }
          ]}
          data={list}
          actions={(row) => (
            <button className="btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
          )}
        />
      </section>
    </div>
  );
}
