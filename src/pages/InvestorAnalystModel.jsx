import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { authHeader } from "../auth";

export default function InvestorAnalystModel() {
  const [titlename, setTitlename] = useState("Investors/Analyst Meet"); // Main title dropdown
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
  const [editTitlename, setEditTitlename] = useState("Investors/Analyst Meet");

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/investor-analyst`;

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_investor_analyst`, { headers: authHeader() });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setTitlename(json.titlename || "Investors/Analyst Meet");
      setList(json.data || []);
    } catch (err) {
      console.error(err);
      setList([]);
    }
  };

  // ================= ADD ENTRY =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    if (!name || !date || !file) {
      setMessage("Please provide name, date, and a file.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titlename", titlename);
      formData.append("investor_analyst_name", name);
      formData.append("investor_analyst_date", date);
      formData.append("investor_analyst_file", file);

      const res = await fetch(`${API_BASE}/add_investor_analyst`, {
        method: "POST",
        headers: authHeader(false),
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        setMessage(result.message || "Upload failed");
        return;
      }

      setMessage(result.message || "Detail added successfully");
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

  // ================= DELETE ENTRY =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
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

  // ================= EDIT ENTRY =================
  const handleEdit = (row) => {
    setEditId(row._id);
    setEditName(row.investor_analyst_name);
    setEditDate(row.investor_analyst_date.split("T")[0]);
    setEditFile(null);
    setEditTitlename(titlename);
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
      formData.append("titlename", editTitlename);
      formData.append("investor_analyst_name", editName);
      formData.append("investor_analyst_date", editDate);
      if (editFile) formData.append("file", editFile);

      const res = await fetch(`${API_BASE}/update_investor_analyst/${editId}`, {
        method: "PUT",
        headers: authHeader(false),
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
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Investor / Analyst Details</h2>

      {/* ================= TITLE DROPDOWN ================= */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Title Name</label>
        <select
          value={titlename}
          onChange={(e) => setTitlename(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="Investors/Analyst Meet">Investors/Analyst Meet</option>
          <option value="Investor Presentation">Investor Presentation</option>
          <option value="Transcript">Transcript</option>
          <option value="Investor Call Intimation">Investor Call Intimation</option>
          <option value="Investor Call Recording">Investor Call Recording</option>
        </select>
      </div>

      {/* ================= ADD FORM ================= */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="col-span-1 md:col-span-1">
          <label className="block mb-1 font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            required
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="col-span-1 md:col-span-1">
          <label className="block mb-1 font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="col-span-1 md:col-span-1">
          <label className="block mb-1 font-medium text-gray-700">File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0])}
            required
            className="w-full"
          />
        </div>

        <div className="col-span-1 md:col-span-3 mt-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {uploading ? "Uploading..." : "Add Detail"}
          </button>
          {message && <div className="mt-2 text-green-600">{message}</div>}
        </div>
      </form>

      {/* ================= ENTRIES TABLE ================= */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Entries</h3>
        <DataTable
  columns={[
    { key: "titlename", label: "Title Name" }, 
    { key: "investor_analyst_name", label: "Name" },
    {
      key: "investor_analyst_date",
      label: "Date",
      render: (r) => new Date(r.investor_analyst_date).toLocaleDateString(),
    },
    {
      key: "investor_analyst_file",
      label: "File",
      render: (r) =>
        r.investor_analyst_file ? (
          <a
            href={r.investor_analyst_file}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:underline"
          >
            View
          </a>
        ) : (
          "-"
        ),
    },
  ]}
  // Filter the list by currently selected titlename
  data={list.filter(item => item.titlename === titlename)}
  actions={(row) => (
    <div className="flex gap-2 justify-center">
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        onClick={() => handleEdit(row)}
      >
        Edit
      </button>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        onClick={() => handleDelete(row._id)}
      >
        Delete
      </button>
    </div>
  )}
/>


      </section>

      {/* ================= EDIT FORM ================= */}
      {editId && (
        <div className="mt-10 p-6 border border-gray-300 rounded-lg bg-white shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Edit Entry</h3>
          <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">File (optional)</label>
              <input
                type="file"
                onChange={(e) => setEditFile(e.target.files?.[0])}
                className="w-full"
              />
            </div>

            <div className="col-span-1 md:col-span-3">
              <label className="block mb-1 font-medium text-gray-700">Title Name</label>
              <select
                value={editTitlename}
                onChange={(e) => setEditTitlename(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Investors/Analyst Meet">Investors/Analyst Meet</option>
                <option value="Investor Presentation">Investor Presentation</option>
                <option value="Transcript">Transcript</option>
                <option value="Investor Call Intimation">Investor Call Intimation</option>
                <option value="Investor Call Recording">Investor Call Recording</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-3 flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
