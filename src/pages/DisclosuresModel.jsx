import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function DisclosuresAdmin() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [file, setFile] = useState(null);
  const [extraLink, setExtraLink] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [disclosures, setDisclosures] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/disclosure`;

  const mainTitleOptions = [
    "Composition of Committees",
    "Contact Information of Designated Officials – Investor Grievances",
    "Newspaper Publications",
    "Criteria of making payments to NEDs",
    "Statements Dividend Distribution Policy",
    "Contact Details of KMPs determining Materiality of Events",
    "Secretarial Compliance Report",
    "Credit Ratings",
    "Investor Grievance Redressal",
    "Familiarization Programme for Independent Directors",
    "Policy on Related Party Transactions",
    "Financial Information",
    "Composition of BOD & Committees",
    "Terms of Appointment of Independent Directors",
    "Memorandum of Association and Articles of Association",
    "Statement of deviation or variation under Reg 32 of SEBI LODR",
    "Disclosure under Reg 30(8) of SEBI LODR",
    "Annual Return",
    "Subsidiaries – Financial Statements",
    "Stock Exchange Intimations",
    "Policy for determination of Materiality of Events",
    "Schedule of Analysts/Investors Meet & Presentations",
    "Shareholding Pattern",
    "Policy for determination of Material Subsidiary",
    "Whistle Blower Policy",
    "Code of Conduct for BOD & SMP",
    "Details of Business",
  ];

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

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      alert("Only .pdf files are allowed");
      return;
    }

    if (isEdit) setEditFields({ ...editFields, fileObj: selectedFile });
    else setFile(selectedFile);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);


    const formData = new FormData();
    formData.append("name", name);
    formData.append("date", date);
    formData.append("mainTitle", mainTitle);
    formData.append("extraLink", extraLink);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/create_disclosure`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating disclosure");
      else {
        setMessage("Disclosure created successfully!");
        setName(""); setDate(""); setMainTitle(""); setExtraLink(""); setFile(null);
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
      mainTitle: disclosure.mainTitle || "",
      extraLink: disclosure.extraLink || "",
      fileObj: null,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("name", editFields.name);
    formData.append("date", editFields.date);
    formData.append("mainTitle", editFields.mainTitle);
    formData.append("extraLink", editFields.extraLink);
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
                />
            </label>

            <label className="flex flex-col">
              Date
              <input
                type="date"
                className="border border-gray-300 rounded p-2 mt-1"
                value={editFields.date}
                onChange={(e) => setEditFields({ ...editFields, date: e.target.value })}
              />
            </label>

            <label className="flex flex-col">
              Main Title
              <select
                className="border border-gray-300 rounded p-2 mt-1"
                value={editFields.mainTitle || ""}
                onChange={(e) => setEditFields({ ...editFields, mainTitle: e.target.value })}
              >
                <option value="">-- Select Main Title (optional) --</option>
                {mainTitleOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              Extra Link (optional)
              <input
                type="text"
                className="border border-gray-300 rounded p-2 mt-1"
                placeholder="e.g., https://..."
                value={editFields.extraLink || ""}
                onChange={(e) => setEditFields({ ...editFields, extraLink: e.target.value })}
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
            />
          </label>

          <label className="flex flex-col">
            Date
            <input
              type="date"
              className="border border-gray-300 rounded p-2 mt-1"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            Main Title
            <select
              className="border border-gray-300 rounded p-2 mt-1"
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
            >
              <option value="">-- Select Main Title (optional) --</option>
              {mainTitleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            Extra Link (optional)
            <input
              type="text"
              className="border border-gray-300 rounded p-2 mt-1"
              placeholder="e.g., https://..."
              value={extraLink}
              onChange={(e) => setExtraLink(e.target.value)}
            />
          </label>

          <label className="flex flex-col">
            File (.pdf only)
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="mt-1"
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
          { key: "mainTitle", label: "Main Title" },
          { key: "file", label: "File", render: (r) => r.file ? <a href={r.file} target="_blank" className="text-blue-600 underline">View</a> : "-" },
          { key: "extraLink", label: "Extra Link", render: (r) => r.extraLink ? <a href={r.extraLink} target="_blank" className="text-blue-600 underline">View</a> : "-" },
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
