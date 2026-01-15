import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function DisclosuresAdmin() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [disclosures, setDisclosures] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/disclosure`;

  useEffect(() => {
    fetchDisclosures();
  }, []);

  const fetchDisclosures = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_disclosure`);
      const data = await res.json();
      if (res.ok) setDisclosures(data.data || []);
      else setDisclosures([]);
    } catch (err) {
      console.error(err);
      setDisclosures([]);
    }
  };

  const handleFileSelect = (e, isEdit = false) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".webp")) {
      alert("Only .webp files are allowed");
      return;
    }

    if (isEdit) setEditFields({ ...editFields, fileObj: selectedFile });
    else setFile(selectedFile);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    if (!name || !date || !file) {
      setMessage("All fields including file are required.");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("date", date);
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/create_disclosure`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating disclosure");
      else {
        setMessage("Disclosure created successfully!");
        setName(""); setDate(""); setFile(null);
        fetchDisclosures();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this disclosure?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) fetchDisclosures();
      else alert(result.message || "Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  const handleEdit = (disclosure) => {
    setEditId(disclosure._id);
    setEditFields({
      name: disclosure.name,
      date: disclosure.date?.substring(0, 10) || "",
      fileObj: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("name", editFields.name);
    formData.append("date", editFields.date);
    if (editFields.fileObj) formData.append("file", editFields.fileObj);

    try {
      const res = await fetch(`${API_BASE}/update_disclosure/${editId}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (res.ok) {
        setEditId(null);
        setEditFields({});
        fetchDisclosures();
      } else alert(result.message || "Update failed");
    } catch (err) {
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Disclosures Management</h2>

      {/* Edit Form on Top */}
      {editId && (
        <div className="mb-6 p-6 border border-gray-300 rounded bg-gray-50 shadow">
          <h3 className="text-xl font-semibold mb-4">Edit Disclosure</h3>
          <form onSubmit={handleUpdate} className="grid gap-4 max-w-xl">
            <label className="flex flex-col">
              Name
              <input
                className="border border-gray-300 rounded p-2 mt-1"
                value={editFields.name}
                onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col">
              Date
              <input
                type="date"
                className="border border-gray-300 rounded p-2 mt-1"
                value={editFields.date}
                onChange={(e) => setEditFields({ ...editFields, date: e.target.value })}
                required
              />
            </label>

            <label className="flex flex-col">
              File (.pdf only)
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileSelect(e, true)}
                className="mt-1"
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {uploading ? "Updating..." : "Update Disclosure"}
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Form */}
      <div className="mb-6 p-6 border border-gray-300 rounded bg-white shadow">
        <h3 className="text-xl font-semibold mb-4">Add New Disclosure</h3>
        <form onSubmit={handleCreate} className="grid gap-4 max-w-xl">
          <label className="flex flex-col">
            Name
            <input
              className="border border-gray-300 rounded p-2 mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            Date
            <input
              type="date"
              className="border border-gray-300 rounded p-2 mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col">
            File (.webp only)
            <input
              type="file"
              accept=".webp"
              onChange={handleFileSelect}
              className="mt-1"
              required
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {uploading ? "Uploading..." : "Add Disclosure"}
          </button>

          {message && <p className={`mt-2 ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
        </form>
      </div>

      {/* Disclosures Table */}
      <h3 className="text-xl font-semibold mb-4">All Disclosures</h3>
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "date", label: "Date" },
          { key: "file", label: "File", render: (r) => r.file ? <a href={r.file} target="_blank" className="text-blue-600 underline">View</a> : "-" },
        ]}
        data={disclosures}
        actions={(row) => (
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              onClick={() => handleEdit(row)}
            >
              Edit
            </button>
            <button
              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}
