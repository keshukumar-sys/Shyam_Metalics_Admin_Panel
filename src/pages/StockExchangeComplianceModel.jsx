import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function StockExchangeComplianceModel() {
  const [option, setOption] = useState("Shareholding Pattern");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/stock`;

  useEffect(() => {
    if (option) fetchList(option);
  }, [option]);

  const fetchList = async (opt) => {
    try {
      const res = await fetch(`${API_BASE}/get/${option}`);
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

    if (!option || !name || !date || !file) {
      setMessage("Please provide option, name, date and a file.");
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("option", option);
      formData.append("name", name);
      formData.append("date", date);
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/add`, {
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

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.name);
    setEditDate(row.date);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editDate) {
      alert("Please fill all fields");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("date", editDate);
      if (editFile) formData.append("file", editFile);

      const headers = {};
      const token = localStorage.getItem("shyam_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/update_compliance/${editId}`, {
        method: "PUT",
        headers: headers,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Update failed");
      setEditId(null);
      fetchList(option);
    } catch (e) {
      console.error(e);
      alert("Network error: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const options = [
    "Shareholding Pattern",
    "Corporate Governance Report",
    "Reconciliation Share Capital Audit Report",
    "Investors Grievances Report",
    "Integrated Financials",
    "Integrated Governance",
    "Regulation 74(5)",
    "Regulation 40(9)",
    "Regulation 7(3)",
  ];

  return (
    <div style={{ padding: 16 }}>
      <h2>Stock Exchange Compliance</h2>

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
            <>
              <button className="btn-sm" style={{marginRight: 8}} onClick={() => handleEdit(row)}>Edit</button>
              <button className="btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
            </>
          )}
        />
      </section>

      {editId && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>Edit Detail</h3>
          <form onSubmit={handleUpdateSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
            <label>
              Name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </label>
            <label>
              Date
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </label>
            <label>
              File (optional)
              <input type="file" onChange={(e) => setEditFile(e.target.files && e.target.files[0])} />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit">Update</button>
              <button type="button" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
