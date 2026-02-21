import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function DisclosuresAdmin() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [file, setFile] = useState(null);
  const [extraLink, setExtraLink] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [disclosures, setDisclosures] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const API_BASE = `${import.meta.env.VITE_API_BASE || "http://localhost:3002"}/disclosure`;

  const mainTitleOptions = [
    "Details of Business",
    "Memorandum of Association and Articles of Association",
    "Brief Profile of Board of Directors including Directorship and Full-time Positions in Body Corporates",
    "Terms and conditions of appointment of independent directors",
    "Composition of various committees of board of directors",
    "Code of conduct of board of directors and senior management personnel",
    "Details of establishment of vigil mechanism/Whistle Blower policy",
    "Policy on dealing with related party transactions",
    "Policy for determining ‘material’ subsidiaries",
    "Details of familiarization programmes imparted to directors",
    "Email address for grievance redressal and other relevant details",
    "Contact information of the designated officials responsible for assisting and handling investor grievances",
    "Notice of meeting of the Board of Directors where financial results shall be discussed",
    "Financial results approved at the Board Meeting",
    "Complete copy of the Annual Report including Balance Sheet, Profit and Loss Account, Directors’ Report, Corporate Governance Report, etc.",
    "Shareholding pattern",
    "Schedule of analyst or institutional investor meet",
    "Presentations made to analysts or institutional investors",
    "Audio or video recordings of post-earnings/quarterly calls",
    "Transcripts of post-earnings/quarterly calls",
    "Items under sub-regulation (1) of Regulation 47",
    "All credit ratings obtained for outstanding instruments",
    "Separate audited financial statements of each subsidiary of the listed entity in respect of a relevant financial year",
    "Secretarial Compliance Report",
    "Policy for determination of materiality of events/information",
    "Contact details of Key Managerial Personnel authorized for determining materiality of events/information",
    "Dividend Distribution Policy",
    "Annual Return",
    "Disclosure required under Regulation 30(8)",
    "Other"
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
    formData.append("sequenceNumber", sequenceNumber);
    formData.append("manualTitle", manualTitle);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/create_disclosure`, { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) setMessage(result.message || "Error creating disclosure");
      else {
        setMessage("Disclosure created successfully!");
        setName(""); setDate(""); setMainTitle(""); setExtraLink(""); setFile(null);
        setSequenceNumber(""); setManualTitle("");
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
      sequenceNumber: disclosure.sequenceNumber || "",
      manualTitle: disclosure.manualTitle || "",
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
    formData.append("sequenceNumber", editFields.sequenceNumber);
    formData.append("manualTitle", editFields.manualTitle);
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

            {editFields.mainTitle === "Other" && (
              <label className="flex flex-col">
                Manual Title
                <input
                  className="border border-gray-300 rounded p-2 mt-1"
                  value={editFields.manualTitle}
                  onChange={(e) => setEditFields({ ...editFields, manualTitle: e.target.value })}
                  placeholder="Enter manual title"
                />
              </label>
            )}

            <label className="flex flex-col">
              Sequence Number (optional)
              <input
                type="number"
                className="border border-gray-300 rounded p-2 mt-1"
                placeholder="e.g., 1, 2, 3..."
                value={editFields.sequenceNumber}
                onChange={(e) => setEditFields({ ...editFields, sequenceNumber: e.target.value })}
              />
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

          {mainTitle === "Other" && (
            <label className="flex flex-col">
              Manual Title
              <input
                className="border border-gray-300 rounded p-2 mt-1"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Enter manual title"
              />
            </label>
          )}

          <label className="flex flex-col">
            Sequence Number (optional)
            <input
              type="number"
              className="border border-gray-300 rounded p-2 mt-1"
              placeholder="e.g., 1, 2, 3..."
              value={sequenceNumber}
              onChange={(e) => setSequenceNumber(e.target.value)}
            />
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
          { key: "sequenceNumber", label: "Seq" },
          { key: "date", label: "Date" },
          {
            key: "mainTitle",
            label: "Main Title",
            render: (r) => r.mainTitle === "Other" ? `Other: ${r.manualTitle}` : r.mainTitle
          },
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
