import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function InvestorAnalystModel() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/investor-analyst`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_investor_analyst`);
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

    try {
      const formData = new FormData();
      formData.append("investor_analyst_name", name);
      formData.append("investor_analyst_date", date);
      // some backends expect generic 'file' key as well
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_investor_analyst`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Detail added");
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
      <h2>Investor / Analyst</h2>

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

        <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Add detail"}</button>
        {message && <div>{message}</div>}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3>Entries</h3>
        <DataTable
          columns={[
            { key: "investor_analyst_name", label: "Name" },
            { key: "investor_analyst_date", label: "Date", render: (r) => new Date(r.investor_analyst_date).toLocaleDateString() },
            { key: "investor_analyst_file", label: "File", render: (r) => (r.investor_analyst_file ? <a href={r.investor_analyst_file} target="_blank" rel="noreferrer">View</a> : "-") }
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
