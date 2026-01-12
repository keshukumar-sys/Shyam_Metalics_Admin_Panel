import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function InvestorInformationModel() {
  const [option, setOption] = useState("Credit Rating");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);
  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/investor-information`;

  useEffect(() => {
    if (option) fetchList(option);
  }, [option]);

  const fetchList = async (opt) => {
    try {
      const res = await fetch(`${API_BASE}/get_investor_information/${opt}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      // adapt depending on backend shape; expect { data: [...] } or array
      setList(json.data || json || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    if (!option || !name || !date || !file) {
      setMessage("Please provide option, name, date and a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("name", name);
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add_investor_information`, {
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
      fetchList(option);
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
      fetchList(option);
    } catch (e) {
      alert("Network error");
    }
  };

  const options = ["Credit Rating", "Postal Ballot", "AGM"];

  return (
    <div style={{ padding: 16 }}>
      <h2>Investor Information</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        <label>
          Option
          <select value={option} onChange={(e) => setOption(e.target.value)}>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

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
        <h3>{option} details</h3>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "date", label: "Date" },
            { key: "file", label: "File", render: (r) => (r.file ? <a href={r.file} target="_blank" rel="noreferrer">View</a> : "-") }
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

