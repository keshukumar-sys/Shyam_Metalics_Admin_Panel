import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import "../App.css";
import "../components/css/Form.css";
import { authHeader } from "../auth";

export default function TdsDeclarationModel() {
  const [tdsName, setTdsName] = useState("");
  const [tdsDate, setTdsDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFile, setEditFile] = useState(null);

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

    try {
      const formData = new FormData();
      formData.append("tds_name", tdsName);
      formData.append("tds_date", tdsDate);
      // append the file under the same field name the backend expects
      formData.append("tds_file", file);
      // also include a simple text field so controllers that validate req.body.tds_file succeed
      formData.append("tds_file", file.name);

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

  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.tds_name);
    setEditDate(row.tds_date);
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
      formData.append("tds_name", editName);
      formData.append("tds_date", editDate);
      if (editFile) formData.append("tds_file", editFile);

      const headers = {};
      const token = localStorage.getItem("shyam_token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/update_tds/${editId}`, {
        method: "PUT",
        headers: headers,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) return alert(json.message || "Update failed");
      setEditId(null);
      fetchList();
    } catch (e) {
      console.error(e);
      alert("Network error: " + e.message);
    } finally {
      setUploading(false);
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
                  <button style={{ marginLeft: 4, marginRight: 4 }} className="btn-sm" onClick={() => handleEdit(row)}>Edit</button>
                  <button style={{ marginLeft: 4 }} className="btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
                </>
              )}
          />
        </div>
      </section>

      {editId && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>Edit TDS</h3>
          <form onSubmit={handleUpdateSubmit} style={{ display: "grid", gap: 8, maxWidth: 640 }}>
            <label>
              Name
              <input className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </label>
            <label>
              Date
              <input className="form-input" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </label>
            <label>
              File (optional)
              <input className="form-input" type="file" onChange={(e) => setEditFile(e.target.files && e.target.files[0])} />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn">Update</button>
              <button type="button" className="btn" style={{background: '#999'}} onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
