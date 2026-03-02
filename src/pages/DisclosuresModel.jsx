import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

export default function DisclosuresAdmin() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [mainTitle, setMainTitle] = useState("");
  const [customTitle, setCustomTitle] = useState(""); // for "Other"
  const [file, setFile] = useState(null);
  const [extraLink, setExtraLink] = useState("");
  const [sequenceNumber, setSequenceNumber] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [disclosures, setDisclosures] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [editCustomTitle, setEditCustomTitle] = useState("");

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

    if (isEdit)
      setEditFields({ ...editFields, fileObj: selectedFile });
    else
      setFile(selectedFile);
  };

  // ---------------- CREATE ----------------
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    setUploading(true);

    const finalMainTitle =
      mainTitle === "Other" ? customTitle : mainTitle;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("date", date);
    formData.append("mainTitle", finalMainTitle);
    formData.append("extraLink", extraLink);
    formData.append("sequenceNumber", sequenceNumber);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/create_disclosure`, {
        method: "POST",
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.message || "Error creating disclosure");
      } else {
        setMessage("Disclosure created successfully!");
        setName("");
        setDate("");
        setMainTitle("");
        setCustomTitle("");
        setExtraLink("");
        setFile(null);
        setSequenceNumber("");
        fetchDisclosures();
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setUploading(false);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this disclosure?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const result = await res.json();
      if (res.ok) fetchDisclosures();
      else alert(result.message || "Delete failed");
    } catch (err) {
      alert("Server error");
    }
  };

  // ---------------- EDIT ----------------
  const handleEdit = (disclosure) => {
    setEditId(disclosure._id);

    const isPredefined = mainTitleOptions.includes(disclosure.mainTitle);

    setEditFields({
      name: disclosure.name,
      date: disclosure.date?.substring(0, 10) || "",
      mainTitle: isPredefined ? disclosure.mainTitle : "Other",
      extraLink: disclosure.extraLink || "",
      sequenceNumber: disclosure.sequenceNumber || "",
      fileObj: null
    });

    if (!isPredefined) {
      setEditCustomTitle(disclosure.mainTitle);
    } else {
      setEditCustomTitle("");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const finalMainTitle =
      editFields.mainTitle === "Other"
        ? editCustomTitle
        : editFields.mainTitle;

    const formData = new FormData();
    formData.append("name", editFields.name);
    formData.append("date", editFields.date);
    formData.append("mainTitle", finalMainTitle);
    formData.append("extraLink", editFields.extraLink);
    formData.append("sequenceNumber", editFields.sequenceNumber);
    if (editFields.fileObj)
      formData.append("file", editFields.fileObj);

    try {
      const res = await fetch(
        `${API_BASE}/update_disclosure/${editId}`,
        { method: "PUT", body: formData }
      );

      const result = await res.json();

      if (res.ok) {
        setEditId(null);
        setEditFields({});
        setEditCustomTitle("");
        fetchDisclosures();
      } else {
        alert(result.message || "Update failed");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Disclosures Management
      </h2>

      {/* ---------------- EDIT FORM ---------------- */}
      {editId && (
        <div className="mb-6 p-6 border border-gray-300 rounded bg-gray-50 shadow">
          <h3 className="text-xl font-semibold mb-4">
            Edit Disclosure
          </h3>

          <form
            onSubmit={handleUpdate}
            className="grid gap-4 max-w-xl"
          >
            <label className="flex flex-col">
              Name
              <input
                className="border p-2 mt-1"
                value={editFields.name}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    name: e.target.value
                  })
                }
              />
            </label>

            <label className="flex flex-col">
              Date
              <input
                type="date"
                className="border p-2 mt-1"
                value={editFields.date}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    date: e.target.value
                  })
                }
              />
            </label>

            <label className="flex flex-col">
              Main Title
              <select
                className="border p-2 mt-1"
                value={editFields.mainTitle}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    mainTitle: e.target.value
                  })
                }
              >
                <option value="">
                  -- Select Main Title --
                </option>
                {mainTitleOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            {editFields.mainTitle === "Other" && (
              <label className="flex flex-col">
                Enter Custom Title
                <input
                  className="border p-2 mt-1"
                  value={editCustomTitle}
                  onChange={(e) =>
                    setEditCustomTitle(e.target.value)
                  }
                />
              </label>
            )}

            <label className="flex flex-col">
              Sequence Number
              <input
                type="number"
                className="border p-2 mt-1"
                value={editFields.sequenceNumber}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    sequenceNumber: e.target.value
                  })
                }
              />
            </label>

            <label className="flex flex-col">
              Extra Link
              <input
                className="border p-2 mt-1"
                value={editFields.extraLink}
                onChange={(e) =>
                  setEditFields({
                    ...editFields,
                    extraLink: e.target.value
                  })
                }
              />
            </label>

            <label className="flex flex-col">
              File (.pdf only)
              <input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  handleFileSelect(e, true)
                }
              />
            </label>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {uploading
                  ? "Updating..."
                  : "Update Disclosure"}
              </button>

              <button
                type="button"
                onClick={() => setEditId(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- CREATE FORM ---------------- */}
      <div className="mb-6 p-6 border border-gray-300 rounded bg-white shadow">
        <h3 className="text-xl font-semibold mb-4">
          Add New Disclosure
        </h3>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 max-w-xl"
        >
          <label className="flex flex-col">
            Name
            <input
              className="border p-2 mt-1"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </label>

          <label className="flex flex-col">
            Date
            <input
              type="date"
              className="border p-2 mt-1"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          </label>

          <label className="flex flex-col">
            Main Title
            <select
              className="border p-2 mt-1"
              value={mainTitle}
              onChange={(e) =>
                setMainTitle(e.target.value)
              }
            >
              <option value="">
                -- Select Main Title --
              </option>
              {mainTitleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          {mainTitle === "Other" && (
            <label className="flex flex-col">
              Enter Custom Title
              <input
                className="border p-2 mt-1"
                value={customTitle}
                onChange={(e) =>
                  setCustomTitle(e.target.value)
                }
              />
            </label>
          )}

          <label className="flex flex-col">
            Sequence Number
            <input
              type="number"
              className="border p-2 mt-1"
              value={sequenceNumber}
              onChange={(e) =>
                setSequenceNumber(e.target.value)
              }
            />
          </label>

          <label className="flex flex-col">
            Extra Link
            <input
              className="border p-2 mt-1"
              value={extraLink}
              onChange={(e) =>
                setExtraLink(e.target.value)
              }
            />
          </label>

          <label className="flex flex-col">
            File (.pdf only)
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {uploading
              ? "Uploading..."
              : "Add Disclosure"}
          </button>

          {message && (
            <p
              className={`mt-2 ${
                message.includes("successfully")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <h3 className="text-xl font-semibold mb-4">
        All Disclosures
      </h3>

      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "sequenceNumber", label: "Seq" },
          { key: "date", label: "Date" },
          { key: "mainTitle", label: "Main Title" },
          {
            key: "file",
            label: "File",
            render: (r) =>
              r.file ? (
                <a
                  href={r.file}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              ) : (
                "-"
              )
          },
          {
            key: "extraLink",
            label: "Extra Link",
            render: (r) =>
              r.extraLink ? (
                <a
                  href={r.extraLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View
                </a>
              ) : (
                "-"
              )
          }
        ]}
        data={disclosures}
        actions={(row) => (
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => handleEdit(row)}
            >
              Edit
            </button>

            <button
              className="bg-red-600 text-white px-2 py-1 rounded"
              onClick={() =>
                handleDelete(row._id)
              }
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
}